import { useState, useRef, useEffect } from 'react';
import { Card } from '@/components/Card';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { useAuth } from '@/hooks/useAuth';
import { updateProfile } from './api/profile.api';
import { User } from 'lucide-react';

export function Profile() {
  const { user, updateUser } = useAuth();
  
  const [fullName, setFullName] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{message: string, isError: boolean} | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setProfilePicture(user.profilePicture || '');
    }
  }, [user]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 1024 * 1024) {
       setSaveStatus({ message: 'File too large (Max 1MB).', isError: true });
       return;
    }
    if (!file.type.startsWith('image/')) {
       setSaveStatus({ message: 'Please select a valid image file.', isError: true });
       return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
       if (event.target?.result && typeof event.target.result === 'string') {
          setProfilePicture(event.target.result);
          setSaveStatus(null);
       }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveStatus(null);
    try {
      const payload = { fullName, profilePicture };
      const updatedUser = await updateProfile(payload);
      updateUser(updatedUser);
      setSaveStatus({ message: 'Profile updated successfully!', isError: false });
    } catch (err: any) {
      setSaveStatus({ message: err?.response?.data?.message || 'Unable to update profile. Please try again.', isError: true });
    } finally {
      setIsSaving(false);
      setTimeout(() => setSaveStatus(null), 5000);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 mb-2">Profile Settings</h1>
        <p className="text-slate-600 dark:text-slate-400">Manage your account and preferences.</p>
      </div>
      <Card className="dark:bg-slate-800 dark:border-slate-700">
        <form className="space-y-6" onSubmit={handleSave}>
          <div className="flex items-center space-x-6 mb-8">
            <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-300 text-3xl font-bold shadow-inner overflow-hidden border-4 border-slate-50 dark:border-slate-800">
              {profilePicture ? (
                 <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                 <User size={48} />
              )}
            </div>
            <div>
              <input type="file" accept="image/*" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
              <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} className="dark:border-slate-600 dark:text-slate-200">
                Update Avatar
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-6">
            <Input 
              label="Full Name" 
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
            />
            <Input 
              label="Email address" 
              value={user?.email || ''} 
              disabled 
            />
          </div>
          
          {saveStatus && (
            <div className={`p-3 rounded-lg text-sm font-medium ${saveStatus.isError ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400'}`}>
              {saveStatus.message}
            </div>
          )}
          
          <div className="pt-4 flex justify-end">
             <Button type="submit" disabled={isSaving}>
               {isSaving ? 'Saving...' : 'Save Changes'}
             </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
