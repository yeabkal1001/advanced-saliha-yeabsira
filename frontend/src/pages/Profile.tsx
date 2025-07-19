import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../hooks/use-toast';
import { User, Mail, Store, Save, Loader2, AlertCircle } from 'lucide-react';

interface ProfileFormData {
  name: string;
  email: string;
  storeName: string;
}

const Profile = () => {
  const { user, updateProfile, loading, error, clearError } = useAuth();
  const { toast } = useToast();
  const [formData, setFormData] = useState<ProfileFormData>({
    name: '',
    email: '',
    storeName: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize form data when user loads
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        storeName: user.storeName || ''
      });
    }
  }, [user]);

  // Check for changes
  useEffect(() => {
    if (user) {
      const hasFormChanges = 
        formData.name !== user.name ||
        formData.email !== user.email ||
        formData.storeName !== user.storeName;
      setHasChanges(hasFormChanges);
    }
  }, [formData, user]);

  const handleChange = (field: keyof ProfileFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) clearError();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !hasChanges) return;

    setIsSubmitting(true);
    clearError();

    try {
      const success = await updateProfile({
        name: formData.name,
        email: formData.email,
        storeName: formData.storeName
      });

      if (success) {
        toast({
          title: "Profile updated!",
          description: "Your profile information has been saved successfully.",
        });
        setHasChanges(false);
      }
    } catch (err) {
      console.error('Profile update error:', err);
      toast({
        title: "Update failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        storeName: user.storeName || ''
      });
      clearError();
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 mx-auto mb-4 text-red-600" />
          <p className="text-gray-600">Please sign in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full">
      <header className="flex items-center sticky top-0 z-10 gap-4 border-b border-blue-200 bg-white/80 backdrop-blur-sm px-6 py-4">
        <SidebarTrigger />
        <h1 className="text-2xl font-semibold">My Profile</h1>
      </header>
      
      <main className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {/* Profile Summary */}
            <div className="lg:col-span-1">
              <Card className="bg-white border-blue-200">
                <CardContent className="p-6 text-center">
                  <Avatar className="w-24 h-24 mx-auto mb-4">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="text-2xl">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <h2 className="text-xl font-bold mb-2">{user.name}</h2>
                  <p className="text-gray-600 mb-4">{user.email}</p>
                  
                  <div className="space-y-2 text-sm text-gray-600">
                    {user.storeName && (
                      <div className="flex items-center justify-center gap-2">
                        <Store size={16} />
                        <span>{user.storeName}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-center gap-2">
                      <User size={16} />
                      <span>Member since {new Date().getFullYear()}</span>
                    </div>
                  </div>

                  {user.storeName && (
                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                      <h3 className="font-semibold text-blue-800 mb-2">Seller Stats</h3>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="font-medium">Products</p>
                          <p className="text-blue-600">-</p>
                        </div>
                        <div>
                          <p className="font-medium">Sales</p>
                          <p className="text-blue-600">-</p>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Profile Form */}
            <div className="lg:col-span-2">
              <Card className="bg-white border-blue-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="text-blue-600" size={24} />
                    Profile Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center gap-2 text-red-600">
                        <AlertCircle size={16} />
                        <span className="text-sm">{error}</span>
                      </div>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name *</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => handleChange('name', e.target.value)}
                          placeholder="Enter your full name"
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleChange('email', e.target.value)}
                          placeholder="Enter your email"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="storeName">Store Name</Label>
                      <Input
                        id="storeName"
                        value={formData.storeName}
                        onChange={(e) => handleChange('storeName', e.target.value)}
                        placeholder="Enter your store name (optional)"
                      />
                      <p className="text-xs text-gray-500">
                        Leave empty if you're not a seller
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        type="submit"
                        className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                        size="lg"
                        disabled={!hasChanges || isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2" size={20} />
                            Save Changes
                          </>
                        )}
                      </Button>
                      
                      {hasChanges && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleReset}
                          disabled={isSubmitting}
                        >
                          Reset
                        </Button>
                      )}
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
};

export default Profile;