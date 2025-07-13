require 'json'

# Constants
PODFILE_PATH = "ios/Podfile"
PODLOCK_PATH = "ios/Podfile.lock"
POD_PROPERTIES_PATH = "ios/.podfile.properties.json"
PODS_DIR = "ios/Pods"

# 1. Get deployment target
def get_deployment_target
  default_version = 15.1
  if File.exist?(POD_PROPERTIES_PATH)
    props = JSON.parse(File.read(POD_PROPERTIES_PATH))
    version = props["ios.deploymentTarget"]
    return version.to_f if version
  end

  puts "⚠️  Using default deployment target: #{default_version}"
  default_version
end

# 2. Get list of installed pods from Podfile.lock
def get_installed_pods
  content = File.read(PODLOCK_PATH)
  pods = content.scan(/^\s+-\s+([A-Za-z0-9\-\+_]+)/).flatten.uniq
  # Filter out subspecs (like React-Core) by keeping only base names
  pods.map { |p| p.split('/').first }.uniq
end

# 3. Try to find iOS deployment version in .podspec.json or .podspec
def get_pod_min_ios_version(pod_name)
  # 1. Check Pods/<pod_name>/.podspec.json
  pod_dir = Dir.glob("#{PODS_DIR}/#{pod_name}").first
  if pod_dir
    json_path = Dir.glob("#{pod_dir}/*.podspec.json").first
    if json_path && File.exist?(json_path)
      podspec = JSON.parse(File.read(json_path))
      ios_info = podspec.dig("platforms", "ios")
      return ios_info.to_f if ios_info
    end

    ruby_path = Dir.glob("#{pod_dir}/*.podspec").first
    if ruby_path && File.exist?(ruby_path)
      contents = File.read(ruby_path)
      match = contents.match(/s\.ios\.deployment_target\s*=\s*['"](\d+\.\d+)['"]/)
      return match[1].to_f if match
    end
  end

  # 2. Check node_modules for <pod_name>.podspec
  podspec_paths = Dir.glob("**/node_modules/**/#{pod_name}.podspec")
  podspec_paths.each do |spec_path|
    if File.exist?(spec_path)
      contents = File.read(spec_path)
      match = contents.match(/s\.ios\.deployment_target\s*=\s*['"](\d+\.\d+)['"]/)
      return match[1].to_f if match
    end
  end

  # 3. Fallback: Use `pod trunk info` to query CocoaPods registry
  puts "📡 Fetching iOS deployment info for #{pod_name} from trunk..."
  info = `pod trunk info #{pod_name} 2>/dev/null`
  match = info.match(/iOS\s+(\d+\.\d+)/)
  return match[1].to_f if match

  # Not found anywhere
  nil
end


# MAIN
deployment_target = get_deployment_target
abort("❌ Could not determine iOS deployment target") unless deployment_target

puts "📱 Your app's iOS Deployment Target: iOS #{deployment_target}"
puts "🔍 Checking pod compatibility...\n\n"

incompatible = []

get_installed_pods.each do |pod|
  min_ios = get_pod_min_ios_version(pod)

  if min_ios.nil?
    puts "⚠️  Could not determine iOS requirement for #{pod}"
  elsif min_ios > deployment_target
    puts "❌ #{pod} requires iOS #{min_ios} — too high!"
    incompatible << [pod, min_ios]
  else
    puts "✅ #{pod} requires iOS #{min_ios}"
  end
end

# Summary
puts "\n#{'=' * 40}"
if incompatible.empty?
  puts "✅ All pods are compatible with your deployment target."
  exit 0
else
  puts "🚨 #{incompatible.size} incompatible pod(s) found:"
  incompatible.each { |name, min_ios| puts "   - #{name}: iOS #{min_ios}" }
  exit 1
end
