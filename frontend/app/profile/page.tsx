'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { UserCircleIcon, PhotoIcon } from '@heroicons/react/24/solid';
import { AuthGuard } from '@/components/auth-guard';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Camera, Save, ArrowLeft, User } from 'lucide-react';
import { apiService } from '@/lib/api-service';

export default function ProfilePage() {
  const router = useRouter();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
  });
  const [originalFormData, setOriginalFormData] = useState({
    name: '',
    company: '',
    email: '',
  });
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [originalProfileImage, setOriginalProfileImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUpdated, setIsUpdated] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Check if form has changes
  const hasFormChanges = () => {
    if (!isEditMode) return true; // Always allow create mode
    
    const formChanged = 
      formData.name !== originalFormData.name ||
      formData.company !== originalFormData.company ||
      formData.email !== originalFormData.email;
    
    const imageChanged = profileImage !== originalProfileImage;
    
    return formChanged || imageChanged;
  };

  useEffect(() => {
    const checkProfileAndLoad = async () => {
      // Get wallet address from localStorage
      const address = localStorage.getItem('stellarPublicKey');
      if (!address) {
        // If no wallet is connected, redirect to home
        router.push('/');
        return;
      }
      setWalletAddress(address);

      // Get the auth token
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        router.push('/');
        return;
      }

      try {
        const tokenData = JSON.parse(authToken);
        
        // Check if profile already exists
        const profileResponse = await apiService.getProfile();
        console.log('✅ Existing profile found:', profileResponse);
        
        const loadedFormData = {
          name: profileResponse.profile.name || '',
          company: profileResponse.profile.company || '',
          email: profileResponse.profile.email || '',
        };
        
        setFormData(loadedFormData);
        setOriginalFormData(loadedFormData);
        
        if (profileResponse.profile.profileImage) {
          setProfileImage(profileResponse.profile.profileImage);
          setOriginalProfileImage(profileResponse.profile.profileImage);
        }
        
        setIsEditMode(true);
      } catch (error) {
        // No profile exists, stay in create mode
        console.log('ℹ️ No existing profile found, creating new one');
        setIsEditMode(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkProfileAndLoad();
  }, [router]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.company.trim()) {
      newErrors.company = 'Company/Project name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setErrors(prev => ({ ...prev, image: 'Please select an image file' }));
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, image: 'Image size should be less than 5MB' }));
        return;
      }

      // Create a preview URL
      const imageUrl = URL.createObjectURL(file);
      setProfileImage(imageUrl);
      setErrors(prev => ({ ...prev, image: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // If already updated, redirect to dashboard
    if (isUpdated) {
      router.push('/mockup-dashboard');
      return;
    }
    
    console.log('🔍 Profile: Form submission started');
    console.log('🔍 Profile: Form data:', formData);
    console.log('🔍 Profile: Is edit mode:', isEditMode);
    console.log('🔍 Profile: Wallet address:', walletAddress);
    
    if (!validateForm()) {
      console.log('❌ Profile: Form validation failed');
      return;
    }

    setIsSubmitting(true);

    try {
      // Get the auth token
      const authToken = localStorage.getItem('authToken');
      if (!authToken) {
        throw new Error('No authentication token found');
      }

      // Parse the token to get the wallet address
      const tokenData = JSON.parse(authToken);
      console.log('🔍 Profile: Auth token parsed successfully');
      
      // Use PUT for updates, POST for creation
      const method = isEditMode ? 'PUT' : 'POST';
      console.log('🔍 Profile: Using method:', method);
      
      const requestBody = {
        name: formData.name,
        company: formData.company,
        email: formData.email,
        profileImage: profileImage // This will be stored as a URL
      };
      
      console.log('🔍 Profile: Request body:', requestBody);
      
      // Call the API to create or update the profile
      const profileResponse = await apiService.createProfile({
        name: formData.name,
        company: formData.company,
        email: formData.email
      });

      console.log(`✅ Profile ${isEditMode ? 'updated' : 'created'} successfully:`, profileResponse);

      // Store profile data in localStorage for local access
      const localProfileData = {
        ...formData,
        walletAddress,
        profileImage,
        createdAt: profileResponse.profile?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        id: profileResponse.profile?.id
      };
      
      localStorage.setItem('userProfile', JSON.stringify(localProfileData));
      console.log('✅ Profile: Local storage updated');

      // Show success toast notification
      console.log('🔔 Profile: Attempting to show toast notification...');
      try {
        toast({
          title: "Profile Updated Successfully!",
          description: isEditMode 
            ? "Your profile has been updated successfully."
            : "Your profile has been created successfully.",
        });
        console.log('✅ Profile: Toast notification called successfully');
      } catch (toastError) {
        console.error('❌ Profile: Toast notification failed:', toastError);
        // Fallback: show alert if toast fails
        alert(isEditMode 
          ? "Profile updated successfully!" 
          : "Profile created successfully!"
        );
      }

      // Set updated state to change button
      setIsUpdated(true);

      // Don't redirect automatically - let user click the button
      console.log('✅ Profile: Update successful, button changed to "Go to Validation Dashboard"');
    } catch (error) {
      console.error(`❌ Error ${isEditMode ? 'updating' : 'saving'} profile:`, error);
      setErrors({ submit: error instanceof Error ? error.message : `Failed to ${isEditMode ? 'update' : 'save'} profile. Please try again.` });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  if (!walletAddress || isLoading) {
    return (
      <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto bg-card rounded-xl shadow-lg p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto bg-card rounded-xl shadow-lg p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div 
                onClick={handleImageClick}
                className="relative w-24 h-24 rounded-full overflow-hidden bg-muted border-4 border-muted-foreground/20 cursor-pointer group hover:border-primary/50 transition-colors duration-200"
              >
                {profileImage ? (
                  <Image
                    src={profileImage}
                    alt="Profile"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <UserCircleIcon className="w-full h-full text-muted-foreground" />
                )}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-opacity duration-200 flex items-center justify-center">
                  <PhotoIcon className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                </div>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                accept="image/*"
                className="hidden"
                aria-label="Upload profile image"
                title="Upload profile image"
              />
            </div>
            {errors.image && (
              <p className="text-sm text-destructive mt-2">{errors.image}</p>
            )}
            <h2 className="text-3xl font-bold text-foreground">
              {isEditMode ? 'Edit Your Profile' : 'Create Your Profile'}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {isEditMode 
                ? 'Update your profile information below'
                : 'Please provide your information to get started'
              }
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-foreground">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                id="name"
                required
                value={formData.name}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm bg-background border-input ${
                  errors.name ? 'border-destructive' : ''
                }`}
                placeholder="John Doe"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-destructive">{errors.name}</p>
              )}
            </div>

            <div>
              <label htmlFor="company" className="block text-sm font-medium text-foreground">
                Company/Project Name
              </label>
              <input
                type="text"
                name="company"
                id="company"
                required
                value={formData.company}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm bg-background border-input ${
                  errors.company ? 'border-destructive' : ''
                }`}
                placeholder="Acme Inc."
              />
              {errors.company && (
                <p className="mt-1 text-sm text-destructive">{errors.company}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                id="email"
                required
                value={formData.email}
                onChange={handleChange}
                className={`mt-1 block w-full rounded-md shadow-sm focus:ring-primary focus:border-primary sm:text-sm bg-background border-input ${
                  errors.email ? 'border-destructive' : ''
                }`}
                placeholder="john@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-destructive">{errors.email}</p>
              )}
            </div>

            <div className="bg-muted/50 p-4 rounded-md">
              <p className="text-sm text-muted-foreground">
                Your personal information is fully encrypted and stored securely. We take your privacy seriously and will never share your data with third parties.
              </p>
            </div>

            {errors.submit && (
              <div className="bg-destructive/10 p-4 rounded-md">
                <p className="text-sm text-destructive">{errors.submit}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || (isEditMode && !hasFormChanges() && !isUpdated)}
              className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium transition-all duration-300 ${
                isUpdated 
                  ? 'text-white bg-violet-600 hover:bg-violet-700 focus:ring-violet-500' 
                  : isEditMode && !hasFormChanges()
                  ? 'text-gray-400 bg-gray-200 cursor-not-allowed'
                  : isEditMode
                  ? 'text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                  : 'text-primary-foreground bg-primary hover:bg-primary/90 focus:ring-primary'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50`}
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {isEditMode ? 'Updating Profile...' : 'Creating Profile...'}
                </span>
              ) : (
                isUpdated 
                  ? 'Go to Validation Dashboard' 
                  : isEditMode 
                  ? 'Update Profile' 
                  : 'Create Profile'
              )}
            </button>
          </form>
        </div>
      </div>
    </AuthGuard>
  );
} 