
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/api/entities";
import { EventProfile } from "@/api/entities";
import { Event } from "@/api/entities";
import { UploadFile } from "@/api/integrations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Check, Shield, User as UserIcon, LogIn, Heart, Camera, Upload, Facebook, Instagram } from "lucide-react";
import { toast } from 'sonner';
import { motion, AnimatePresence } from "framer-motion";

// Simple UUID v4 generator function
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export default function Consent() {
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [step, setStep] = useState('manual');
  const [formData, setFormData] = useState({
    first_name: '',
    email: '',
    age: '',
    gender_identity: '',
    interested_in: '',
    profile_photo_url: ''
  });
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  const stepAnimation = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3 }
  };

  useEffect(() => {
    const fetchEvent = async () => {
      const eventId = localStorage.getItem('currentEventId');
      if (!eventId) {
        navigate(createPageUrl("Home"));
        return;
      }
      try {
        const events = await Event.filter({ id: eventId });
        if (events.length > 0) {
          setEvent(events[0]);
        } else {
          navigate(createPageUrl("Home"));
        }
      } catch (err) {
        console.error("Error fetching event details:", err);
        navigate(createPageUrl("Home"));
      }
    };
    fetchEvent();
  }, [navigate]);

  // Handler for profile photo upload
  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error("Please select an image file.");
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be smaller than 5MB.");
      return;
    }

    setIsUploadingPhoto(true);
    try {
      const { file_url } = await UploadFile({ file });
      setFormData(prev => ({ ...prev, profile_photo_url: file_url }));
      toast.success("Photo uploaded successfully!");
    } catch (err) {
      console.error("Error uploading photo:", err);
      toast.error("Failed to upload photo. Please try again.");
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all required fields including photo
    if (!formData.first_name || !formData.email || !formData.age || !formData.gender_identity || !formData.interested_in) {
      toast.error("Please fill in all fields.");
      return;
    }

    if (!formData.profile_photo_url) { // New validation for profile photo
      toast.error("Please upload a profile photo.");
      return;
    }
    
    setIsSubmitting(true);
    setStep('processing');
    
    try {
      const sessionId = generateUUID();
      const profileColor = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');

      // Update user data with profile photo
      await User.updateMyUserData({
        profile_photo_url: formData.profile_photo_url,
        age: parseInt(formData.age),
        gender_identity: formData.gender_identity,
        interested_in: formData.interested_in,
        profile_color: profileColor
      });

      // Create event profile with photo
      await EventProfile.create({
        event_id: event.id,
        session_id: sessionId,
        first_name: formData.first_name,
        email: formData.email,
        age: parseInt(formData.age),
        gender_identity: formData.gender_identity,
        interested_in: formData.interested_in,
        profile_color: profileColor,
        profile_photo_url: formData.profile_photo_url,
        is_visible: true,
      });

      localStorage.setItem('currentSessionId', sessionId);
      localStorage.setItem('currentProfileColor', profileColor);
      localStorage.setItem('currentProfilePhotoUrl', formData.profile_photo_url);
      
      toast.success("Profile created! Welcome to the event.");
      navigate(createPageUrl("Discovery"));
    } catch (err) {
      console.error("Error creating profile:", err);
      setError("Failed to create profile. Please try again.");
      setStep('error');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center p-4">
      <style>{`
        /* Dark mode form styling improvements */
        .dark .form-label {
          color: #ffffff !important;
        }
        
        .dark .form-input {
          background-color: #374151 !important;
          color: #ffffff !important;
          border-color: #6b7280 !important;
        }
        
        .dark .form-input::placeholder {
          color: #9ca3af !important;
        }
        
        .dark .form-input:focus {
          border-color: #8b5cf6 !important;
          box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.2) !important;
        }
        
        .dark .select-trigger {
          background-color: #374151 !important;
          color: #ffffff !important;
          border-color: #6b7280 !important;
        }
        
        .dark .select-trigger:focus {
          border-color: #8b5cf6 !important;
          box-shadow: 0 0 0 2px rgba(139, 92, 246, 0.2) !important;
        }
        
        .dark .select-trigger [data-placeholder] {
          color: #9ca3af !important;
        }
        
        .dark .select-content {
          background-color: #374151 !important;
          border-color: #6b7280 !important;
        }
        
        .dark .select-item {
          color: #ffffff !important;
        }
        
        .dark .select-item:hover {
          background-color: #4b5563 !important;
        }
        
        .dark .upload-area {
          background-color: #374151 !important;
          border-color: #6b7280 !important;
        }
        
        .dark .upload-text {
          color: #9ca3af !important;
        }
      `}</style>
      
      <AnimatePresence mode="wait">
        {step === 'manual' && (
          <motion.div key="manual" {...stepAnimation}>
            <Card className="glass-effect border-0 shadow-xl max-w-md w-full">
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <UserIcon className="w-8 h-8 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
                  Create Your Event Profile
                </CardTitle>
                <p className="text-gray-500 dark:text-gray-400">
                  This profile is temporary and only for {event?.name || 'this event'}.
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Profile Photo Upload */}
                  <div className="space-y-2">
                    <label className="form-label text-sm font-medium text-gray-700 dark:text-white">
                      Profile Photo *
                    </label>
                    <div className="flex flex-col items-center space-y-3">
                      {formData.profile_photo_url ? (
                        <div className="relative">
                          <img
                            src={formData.profile_photo_url}
                            alt="Profile preview"
                            className="w-24 h-24 rounded-full object-cover border-4 border-purple-200 dark:border-purple-700"
                          />
                          <label
                            htmlFor="photo-upload"
                            className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 hover:opacity-100 transition-opacity cursor-pointer"
                          >
                            <Camera className="w-6 h-6 text-white" />
                          </label>
                        </div>
                      ) : (
                        <div className="upload-area w-24 h-24 rounded-full border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center bg-gray-50 dark:bg-gray-700">
                          <div className="text-center">
                            <Upload className="w-6 h-6 text-gray-400 dark:text-gray-500 mx-auto mb-1" />
                            <p className="upload-text text-xs text-gray-500 dark:text-gray-400">Upload Photo</p>
                          </div>
                        </div>
                      )}
                      
                      <label
                        htmlFor="photo-upload"
                        className={`px-4 py-2 rounded-lg text-sm font-medium cursor-pointer transition-colors ${
                          isUploadingPhoto
                            ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                            : 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-800'
                        }`}
                      >
                        {isUploadingPhoto ? (
                          <div className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-700 dark:border-purple-300"></div>
                            Uploading...
                          </div>
                        ) : formData.profile_photo_url ? (
                          'Change Photo'
                        ) : (
                          'Upload Photo'
                        )}
                      </label>
                      
                      <input
                        id="photo-upload"
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        disabled={isUploadingPhoto}
                        className="hidden"
                      />
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                      Required • Max 5MB • JPG, PNG, or GIF
                    </p>
                  </div>

                  <div>
                    <Input
                      type="text"
                      placeholder="First Name *"
                      value={formData.first_name}
                      onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                      className="form-input"
                      required
                    />
                  </div>
                  <div>
                    <Input
                      type="email"
                      placeholder="Email (private, for feedback only) *"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="form-input"
                      required
                    />
                  </div>
                   <div>
                    <Input
                      type="number"
                      placeholder="Age *"
                      min="18"
                      max="99"
                      value={formData.age}
                      onChange={(e) => setFormData({...formData, age: e.target.value})}
                      className="form-input"
                      required
                    />
                  </div>
                  <div>
                    <Select onValueChange={(value) => setFormData({...formData, gender_identity: value})} required>
                      <SelectTrigger className="select-trigger">
                        <SelectValue placeholder="I am a... *" />
                      </SelectTrigger>
                      <SelectContent className="select-content">
                        <SelectItem value="man" className="select-item">Man</SelectItem>
                        <SelectItem value="woman" className="select-item">Woman</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Select onValueChange={(value) => setFormData({...formData, interested_in: value})} required>
                      <SelectTrigger className="select-trigger">
                        <SelectValue placeholder="I'm interested in... *" />
                      </SelectTrigger>
                      <SelectContent className="select-content">
                        <SelectItem value="men" className="select-item">Men</SelectItem>
                        <SelectItem value="women" className="select-item">Women</SelectItem>
                        <SelectItem value="everyone" className="select-item">Everyone</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    type="submit"
                    disabled={isSubmitting || isUploadingPhoto}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Creating Profile...
                      </div>
                    ) : (
                      'Join Event'
                    )}
                  </Button>
                </form>

                {/* 
                // Hidden Social Autofill Buttons for Future Use
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-gray-300 dark:border-gray-600" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-white dark:bg-gray-800 px-2 text-gray-500 dark:text-gray-400">
                      Or autofill from
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Button variant="outline" className="w-full" disabled>
                    <Instagram className="w-5 h-5 mr-2 text-[#E1306C]" />
                    Autofill from Instagram
                  </Button>
                  <Button variant="outline" className="w-full" disabled>
                    <Facebook className="w-5 h-5 mr-2 text-[#1877F2]" />
                    Autofill from Facebook
                  </Button>
                </div>
                */}

              </CardContent>
            </Card>
          </motion.div>
        )}

        {step === 'processing' && (
          <motion.div key="processing" {...stepAnimation}>
            <Card className="glass-effect border-0 shadow-xl max-w-md w-full">
              <CardContent className="p-8 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-6"></div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Creating Your Profile...
                </h2>
                <p className="text-gray-500 dark:text-gray-400">
                  Just a moment while we get you into the event.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {step === 'error' && (
          <motion.div key="error" {...stepAnimation}>
            <Card className="glass-effect border-0 shadow-xl max-w-md w-full">
              <CardContent className="p-8 text-center">
                 <h2 className="text-xl font-semibold text-red-600 dark:text-red-400 mb-2">
                  Something went wrong
                </h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {error}
                </p>
                <Button onClick={() => setStep('manual')} variant="outline">Try Again</Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
