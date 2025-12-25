
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { userService } from '../../services/userService';
import { UserImage, PhoneNumber } from '../../types/api';
import { Mail, Calendar, Shield, Camera, Trash2, Upload, Edit2, Lock, Save, X, Phone, Plus, CheckCircle } from 'lucide-react';
import Loader from '../../components/UI/Loader';

const Profile: React.FC = () => {
  const { user, refreshProfileImage } = useAuth();
  const [images, setImages] = useState<UserImage[]>([]);
  const [phones, setPhones] = useState<PhoneNumber[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  
  // Profile Form State
  const [profileForm, setProfileForm] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    username: user?.username || ''
  });

  // Phone Form State
  const [isAddingPhone, setIsAddingPhone] = useState(false);
  const [newPhone, setNewPhone] = useState({ phoneNumber: '', isPrimary: false });

  // Password Form State
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const loadData = async () => {
    if (!user) return;
    try {
      const [imgRes, phoneRes] = await Promise.all([
        api.get(`/users/${user.userID}/images`),
        userService.getPhones(user.userID)
      ]);
      setImages(imgRes.data.images || []);
      setPhones(phoneRes.phoneNumbers || []);
    } catch (err) {
      console.error("Failed to load profile data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    if (user) {
      setProfileForm({
        firstName: user.firstName,
        lastName: user.lastName || '',
        email: user.email,
        username: user.username
      });
    }
  }, [user]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      await api.put(`/users/${user.userID}`, {
        ...profileForm,
        status: user.status,
        roleID: user.roleID,
        isDeleted: user.isDeleted
      });
      const updatedUser = { ...user, ...profileForm };
      localStorage.setItem('user_data', JSON.stringify(updatedUser));
      window.location.reload();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  const handleAddPhone = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);
    try {
      await userService.addPhone(user.userID, newPhone);
      await loadData();
      setIsAddingPhone(false);
      setNewPhone({ phoneNumber: '', isPrimary: false });
    } catch (err: any) {
      alert(err.response?.data?.detail || "Failed to add phone number");
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePrimary = async (phone: PhoneNumber) => {
    if (!user || phone.isPrimary) return;
    setLoading(true);
    try {
      await userService.updatePhone(user.userID, phone.phoneID, {
        phoneNumber: phone.phoneNumber,
        isPrimary: true,
        isDeleted: false
      });
      await loadData();
    } catch (err) {
      alert("Failed to update primary phone");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePhone = async (phoneId: number) => {
    if (!user || !window.confirm("Delete this phone number?")) return;
    setLoading(true);
    try {
      await userService.deletePhone(user.userID, phoneId);
      await loadData();
    } catch (err) {
      alert("Failed to delete phone number");
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !user) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', e.target.files[0]);
    try {
      await api.post(`/users/${user.userID}/images/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const res = await api.get(`/users/${user.userID}/images`);
      setImages(res.data.images || []);
      await refreshProfileImage();
    } catch (err) {
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const deleteImage = async (imageId: number) => {
    if (!user || !window.confirm("Delete this profile image?")) return;
    try {
      await api.delete(`/users/${user.userID}/images/${imageId}`);
      setImages(images.filter(img => img.userImageID !== imageId));
      await refreshProfileImage();
    } catch (err) {
      alert("Delete failed");
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert("New passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await api.put(`/users/${user.userID}/password`, passwordForm);
      alert("Password changed successfully!");
      setIsChangingPassword(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      alert(err.response?.data?.detail || "Password change failed");
    } finally {
      setLoading(false);
    }
  };

  if (loading && !isEditing && !isAddingPhone && !isChangingPassword) return <Loader fullScreen />;
  if (!user) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white rounded-[3rem] shadow-xl overflow-hidden border">
            <div className="h-40 bg-gradient-to-r from-blue-600 to-indigo-700 relative">
              <div className="absolute -bottom-12 left-8 flex items-end gap-6">
                <div className="relative group">
                  <div className="w-32 h-32 rounded-[2.5rem] bg-white p-2 shadow-2xl">
                    <div className="w-full h-full rounded-[2rem] bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-4xl overflow-hidden border-2 border-white shadow-sm">
                      {images.length > 0 ? (
                        <img src={images[0].imageURL} alt={user.fullName} className="w-full h-full object-cover" />
                      ) : user.firstName[0]}
                    </div>
                  </div>
                  <label className="absolute bottom-2 right-2 p-2 bg-blue-600 text-white rounded-xl shadow-lg cursor-pointer hover:bg-blue-700 transition-all">
                    <Camera size={18} />
                    <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} />
                  </label>
                </div>
                <div className="mb-4 text-white">
                  <h1 className="text-3xl font-black">{user.fullName}</h1>
                  <p className="opacity-80 font-medium">@{user.username}</p>
                </div>
              </div>
            </div>

            <div className="pt-20 px-10 pb-10">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Shield size={20} className="text-blue-600" /> Account Settings
                </h2>
                <button 
                  onClick={() => setIsEditing(!isEditing)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-gray-50 hover:bg-gray-100 text-gray-700 transition-colors"
                >
                  {isEditing ? <><X size={16}/> Cancel</> : <><Edit2 size={16}/> Edit Details</>}
                </button>
              </div>

              {isEditing ? (
                <form onSubmit={handleUpdateProfile} className="space-y-6 animate-in fade-in slide-in-from-top-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">First Name</label>
                      <input 
                        type="text" 
                        className="w-full px-4 py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-blue-500"
                        value={profileForm.firstName}
                        onChange={e => setProfileForm({...profileForm, firstName: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Last Name</label>
                      <input 
                        type="text" 
                        className="w-full px-4 py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-blue-500"
                        value={profileForm.lastName}
                        onChange={e => setProfileForm({...profileForm, lastName: e.target.value})}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Email</label>
                      <input 
                        type="email" 
                        className="w-full px-4 py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-blue-500"
                        value={profileForm.email}
                        onChange={e => setProfileForm({...profileForm, email: e.target.value})}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Username</label>
                      <input 
                        type="text" 
                        className="w-full px-4 py-3 bg-gray-50 border rounded-xl focus:ring-2 focus:ring-blue-500"
                        value={profileForm.username}
                        onChange={e => setProfileForm({...profileForm, username: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  <div className="flex justify-end pt-4">
                    <button type="submit" className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-blue-700 shadow-lg">
                      <Save size={18} /> Save Changes
                    </button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
                    <Mail className="text-blue-500" size={20} />
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Email Address</p>
                      <p className="text-sm font-semibold">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl">
                    <Calendar className="text-blue-500" size={20} />
                    <div>
                      <p className="text-[10px] font-bold text-gray-400 uppercase">Member Since</p>
                      <p className="text-sm font-semibold">{new Date(user.joinDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Phone Management Section */}
          <div className="bg-white rounded-[2.5rem] shadow-xl p-8 border">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Phone size={20} className="text-blue-600" /> Phone Numbers
              </h2>
              <button 
                onClick={() => setIsAddingPhone(!isAddingPhone)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold bg-blue-50 hover:bg-blue-100 text-blue-600 transition-colors"
              >
                {isAddingPhone ? <X size={16}/> : <><Plus size={16}/> Add New</>}
              </button>
            </div>

            {isAddingPhone && (
              <form onSubmit={handleAddPhone} className="mb-8 p-6 bg-gray-50 rounded-2xl border border-gray-100 space-y-4 animate-in fade-in slide-in-from-top-2">
                <div className="flex gap-4">
                  <input 
                    type="tel" 
                    placeholder="+962 7X XXX XXXX"
                    className="flex-grow px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500"
                    value={newPhone.phoneNumber}
                    onChange={e => setNewPhone({...newPhone, phoneNumber: e.target.value})}
                    required
                  />
                  <div className="flex items-center gap-2 px-4">
                    <input 
                      type="checkbox" 
                      id="primary-check"
                      checked={newPhone.isPrimary}
                      onChange={e => setNewPhone({...newPhone, isPrimary: e.target.checked})}
                    />
                    <label htmlFor="primary-check" className="text-sm font-bold text-gray-600">Primary</label>
                  </div>
                  <button type="submit" className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold">
                    Add Number
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-4">
              {phones.length > 0 ? phones.map(phone => (
                <div key={phone.phoneID} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-gray-200 transition-all">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${phone.isPrimary ? 'bg-green-100 text-green-600' : 'bg-gray-200 text-gray-500'}`}>
                      <Phone size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{phone.phoneNumber}</p>
                      {phone.isPrimary && <span className="text-[10px] font-black text-green-600 uppercase tracking-widest">Primary Contact</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!phone.isPrimary && (
                      <button 
                        onClick={() => handleTogglePrimary(phone)}
                        className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                        title="Set as primary"
                      >
                        <CheckCircle size={20} />
                      </button>
                    )}
                    <button 
                      onClick={() => handleDeletePhone(phone.phoneID)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      title="Delete number"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              )) : (
                <p className="text-center text-gray-400 py-4 italic">No phone numbers added yet.</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-[2.5rem] shadow-xl p-8 border">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Lock size={20} className="text-blue-600" /> Privacy & Security
              </h2>
              <button 
                onClick={() => setIsChangingPassword(!isChangingPassword)}
                className="text-blue-600 font-bold text-sm hover:underline"
              >
                {isChangingPassword ? "Cancel" : "Change Password"}
              </button>
            </div>

            {isChangingPassword && (
              <form onSubmit={handleChangePassword} className="space-y-4 animate-in fade-in slide-in-from-top-2">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input 
                    type="password" 
                    placeholder="Current Password"
                    className="px-4 py-3 bg-gray-50 border rounded-xl"
                    value={passwordForm.currentPassword}
                    onChange={e => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                    required
                  />
                  <input 
                    type="password" 
                    placeholder="New Password"
                    className="px-4 py-3 bg-gray-50 border rounded-xl"
                    value={passwordForm.newPassword}
                    onChange={e => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                    required
                  />
                  <input 
                    type="password" 
                    placeholder="Confirm New Password"
                    className="px-4 py-3 bg-gray-50 border rounded-xl"
                    value={passwordForm.confirmPassword}
                    onChange={e => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                    required
                  />
                </div>
                <button type="submit" className="bg-gray-900 text-white px-6 py-2 rounded-xl font-bold hover:bg-black">
                  Update Password
                </button>
              </form>
            )}
            {!isChangingPassword && (
              <p className="text-sm text-gray-500">Keep your account safe by using a strong password and changing it regularly.</p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white rounded-[2.5rem] shadow-xl p-8 border">
            <h3 className="font-bold text-gray-900 flex items-center gap-2 mb-6">
              <Camera size={18} className="text-blue-600" /> Photo Gallery
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {images.map(img => (
                <div key={img.userImageID} className="aspect-square rounded-2xl overflow-hidden relative group border-2 border-transparent hover:border-blue-500 transition-all">
                  <img src={img.imageURL} alt="Gallery" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity gap-2">
                    <button 
                      onClick={() => deleteImage(img.userImageID)}
                      className="p-2 bg-red-600 text-white rounded-lg hover:scale-110 transition-transform"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
              <label className="aspect-square rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-gray-400 hover:bg-gray-50 cursor-pointer hover:border-blue-300 transition-all">
                <Upload size={20} />
                <span className="text-[10px] font-bold uppercase mt-2">Add New</span>
                <input type="file" className="hidden" onChange={handleUpload} disabled={uploading} />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
