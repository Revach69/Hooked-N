import * as React from 'react'
import { Dimensions } from 'react-native'

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    const update = ({ window }) => {
      setIsMobile(window.width < MOBILE_BREAKPOINT)
    }
    const subscription = Dimensions.addEventListener('change', update)
    setIsMobile(Dimensions.get('window').width < MOBILE_BREAKPOINT)
    return () => subscription.remove()
  }, [])

  return isMobile
}
