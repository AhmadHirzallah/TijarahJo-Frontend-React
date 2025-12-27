
import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import api, { BACKEND_URL } from '../../services/api';
import { User } from '../../types/api';
import { Camera, Trash2, Edit2, Lock, Phone, Plus, ShieldCheck, Key, Star, CheckCircle2, AlertCircle } from 'lucide-react';
import Loader from '../../components/UI/Loader';
import { validatePassword, getPasswordStrengthColor, getPasswordStrengthBg } from '../../utils/passwordValidation';

interface PhoneData {
  phoneID: number;
  userID: number;
  phoneNumber: string;
  isPrimary: boolean;
}

const Profile: React.FC = () => {
  const { user, profileImage, refreshProfileImage } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [phones, setPhones] = useState<PhoneData[]>([]);
  const [loading, setLoading] = useState(true);
  
  // States for forms
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPass, setIsChangingPass] = useState(false);
  
  const [profileForm, setProfileForm] = useState({ firstName: '', lastName: '', email: '', username: '' });
  const [newPhone, setNewPhone] = useState('');
  
  const [passForm, setPassForm] = useState({ 
    currentPassword: '', 
    newPassword: '', 
    confirmPassword: '' 
  });
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');
  const [passwordValidation, setPasswordValidation] = useState<ReturnType<typeof validatePassword> | null>(null);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [profileRes, phonesRes] = await Promise.all([
        api.get('/users/me'),
        api.get(`/users/${user.userID}/phones`)
      ]);
      setProfile(profileRes.data);
      setProfileForm({ 
        firstName: profileRes.data.firstName, 
        lastName: profileRes.data.lastName || '', 
        email: profileRes.data.email, 
        username: profileRes.data.username 
      });
      setPhones(phonesRes.data.phoneNumbers || []);
    } catch (err) { 
      console.error(err); 
    } finally { 
      setLoading(false); 
    }
  }, [user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.put('/users/me', profileForm);
      setProfile(res.data);
      localStorage.setItem('user_data', JSON.stringify(res.data));
      setIsEditing(false);
      alert("Profile details updated successfully.");
    } catch (err) { 
      alert("Failed to update profile details."); 
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError('');
    setPassSuccess('');

    // Validate new password
    const passwordValidationResult = validatePassword(passForm.newPassword);
    if (!passwordValidationResult.isValid) {
      setPassError(passwordValidationResult.error || "New password does not meet requirements.");
      return;
    }

    if (passForm.newPassword !== passForm.confirmPassword) {
      setPassError("New passwords do not match.");
      return;
    }

    if (!passForm.currentPassword.trim()) {
      setPassError("Current password is required.");
      return;
    }

    try {
      await api.put('/users/me/password', {
        currentPassword: passForm.currentPassword,
        newPassword: passForm.newPassword
      });
      setPassSuccess("Password updated successfully.");
      setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordValidation(null);
      setTimeout(() => setIsChangingPass(false), 2000);
    } catch (err: any) {
      setPassError(err.response?.data?.detail || "Failed to update password. Verify current password.");
    }
  };

  const handlePhoneAction = async (action: 'add' | 'delete' | 'primary', payload?: any) => {
    if (!profile) return;
    try {
      if (action === 'add') {
        if (!newPhone) return;
        await api.post(`/users/${profile.userID}/phones`, { phoneNumber: normalizePhone(newPhone) });
      }
      if (action === 'delete') await api.delete(`/users/${profile.userID}/phones/${payload}`);
      if (action === 'primary') await api.put(`/users/${profile.userID}/phones/${payload}/primary`);
      setNewPhone('');
      fetchData();
    } catch (err) { 
      alert("Phone update failed."); 
    }
  };

  const normalizePhone = (p: string) => {
    let c = p.replace(/\D/g, '');
    if (c.startsWith('07')) return '+962' + c.substring(1);
    return c.startsWith('962') ? '+' + c : p;
  };

  const getAbsoluteImageUrl = (url: string | null | undefined) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    const normalizedPath = url.startsWith('/') ? url : `/${url}`;
    return `${BACKEND_URL}${normalizedPath}`;
  };

  const handleProfileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!profile || !e.target.files?.[0]) return;
    const fd = new FormData();
    fd.append('file', e.target.files[0]);
    try {
      setLoading(true);
      await api.post(`/users/${profile.userID}/images/upload`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      await refreshProfileImage();
      await fetchData();
    } catch (err) {
      alert("Image upload failed.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Loader fullScreen />;
  if (!profile) return <div className="p-20 text-center font-black">USER NOT FOUND</div>;

  return (
    <div className="max-w-7xl mx-auto px-6 py-16 space-y-16">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
        
        {/* Main Content Area */}
        <div className="lg:col-span-8 space-y-12">
          
          {/* Header Card */}
          <div className="bg-white rounded-[4rem] shadow-2xl overflow-hidden border border-slate-50 relative">
            <div className="h-72 bg-slate-900 relative">
              <div className="absolute -bottom-20 left-16 flex items-center gap-10">
                <div className="w-56 h-56 rounded-[3.5rem] bg-white p-2 shadow-2xl">
                  <div className="w-full h-full rounded-[3rem] bg-indigo-50 flex items-center justify-center text-7xl font-black text-indigo-400 overflow-hidden relative group">
                    {profileImage ? (
                      <img 
                        src={`${getAbsoluteImageUrl(profileImage)}?t=${Date.now()}`} 
                        className="w-full h-full object-cover" 
                        alt="Profile"
                      />
                    ) : (
                      <span>{profile.firstName[0]}</span>
                    )}
                    <label className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center cursor-pointer backdrop-blur-sm">
                      <Camera className="text-white" size={40} />
                      <input type="file" className="hidden" onChange={handleProfileImageUpload} />
                    </label>
                  </div>
                </div>
                <div className="pb-4">
                   <h1 className="text-5xl font-black text-white tracking-tighter mb-2">{profile.fullName}</h1>
                   <div className="flex items-center gap-2 px-6 py-2 bg-indigo-600 rounded-full text-white text-[10px] font-black uppercase tracking-widest shadow-2xl">
                      <ShieldCheck size={16} /> Verified Marketplace User
                   </div>
                </div>
              </div>
            </div>

            <div className="pt-32 p-16">
              <div className="flex justify-between items-center mb-12 border-b pb-12">
                 <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Personal Information</h3>
                 <button onClick={() => setIsEditing(!isEditing)} className="px-8 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-500 hover:bg-indigo-600 hover:text-white transition-all">
                   {isEditing ? 'Discard Changes' : 'Edit Profile'}
                 </button>
              </div>

              {isEditing ? (
                <form onSubmit={handleUpdateProfile} className="grid grid-cols-2 gap-8 animate-in slide-in-from-top-4">
                  <InputGroup label="First Name" value={profileForm.firstName} onChange={v => setProfileForm({...profileForm, firstName: v})} />
                  <InputGroup label="Last Name" value={profileForm.lastName} onChange={v => setProfileForm({...profileForm, lastName: v})} />
                  <InputGroup label="Username" value={profileForm.username} onChange={v => setProfileForm({...profileForm, username: v})} />
                  <InputGroup label="Email Address" value={profileForm.email} onChange={v => setProfileForm({...profileForm, email: v})} />
                  <div className="col-span-2 flex justify-end">
                    <button type="submit" className="bg-indigo-600 text-white px-12 py-5 rounded-2xl font-black shadow-2xl hover:bg-indigo-700 active:scale-95 transition-all">Save Changes</button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-2 gap-10">
                   <StaticDetail label="User ID" value={`#${profile.userID}`} />
                   <StaticDetail label="Username" value={profile.username} />
                   <StaticDetail label="Email Address" value={profile.email} />
                   <StaticDetail label="Account Created" value={new Date(profile.joinDate).toLocaleDateString()} />
                </div>
              )}
            </div>
          </div>

          {/* Phone Numbers Section */}
          <div className="bg-white rounded-[4rem] p-16 shadow-2xl border border-slate-50">
             <div className="flex items-center justify-between mb-12">
                <div>
                   <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter">Phone Numbers</h3>
                   <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-1">Manage your contact points</p>
                </div>
                <div className="flex gap-4">
                   <input 
                     type="tel" 
                     placeholder="07XXXXXXXX" 
                     className="px-6 py-4 bg-slate-50 rounded-2xl font-black text-sm outline-none focus:ring-4 focus:ring-indigo-50 border border-slate-100" 
                     value={newPhone} 
                     onChange={e => setNewPhone(e.target.value)} 
                   />
                   <button onClick={() => handlePhoneAction('add')} className="p-4 bg-indigo-600 text-white rounded-2xl shadow-xl hover:bg-indigo-700 active:scale-90 transition-all">
                     <Plus size={24}/>
                   </button>
                </div>
             </div>
             <div className="grid gap-6">
                {phones.map(p => (
                  <div key={p.phoneID} className={`p-8 rounded-[3rem] flex items-center justify-between transition-all border-2 ${p.isPrimary ? 'bg-indigo-50 border-indigo-200' : 'bg-slate-50/50 border-transparent hover:border-slate-100'}`}>
                    <div className="flex items-center gap-6">
                       <div className={`p-5 rounded-3xl ${p.isPrimary ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'bg-white text-slate-300 shadow-sm'}`}>
                         <Phone size={24}/>
                       </div>
                       <div>
                          <p className="text-2xl font-black text-slate-900 tracking-tight">{p.phoneNumber}</p>
                          <p className="text-[10px] font-black uppercase tracking-widest text-indigo-500 mt-1">{p.isPrimary ? 'Primary Phone' : 'Secondary Phone'}</p>
                       </div>
                    </div>
                    <div className="flex gap-3">
                       {!p.isPrimary && (
                         <button onClick={() => handlePhoneAction('primary', p.phoneID)} className="p-4 text-slate-400 hover:text-amber-500 hover:bg-white rounded-2xl transition-all shadow-sm" title="Set Primary"><Star size={20}/></button>
                       )}
                       <button onClick={() => handlePhoneAction('delete', p.phoneID)} className="p-4 text-slate-400 hover:text-rose-600 hover:bg-white rounded-2xl transition-all shadow-sm" title="Remove Phone"><Trash2 size={20}/></button>
                    </div>
                  </div>
                ))}
                {phones.length === 0 && (
                   <div className="text-center py-12 bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
                      <p className="font-black text-slate-300 uppercase text-xs tracking-widest">No phone numbers linked</p>
                   </div>
                )}
             </div>
          </div>
        </div>

        {/* Sidebar - Security Hub */}
        <div className="lg:col-span-4 space-y-10">
           <div className="bg-slate-900 rounded-[3.5rem] p-12 text-white shadow-2xl relative overflow-hidden">
              <div className="relative z-10 space-y-10">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center"><Lock size={22} className="text-indigo-400" /></div>
                   <h3 className="text-2xl font-black tracking-tight">Security Settings</h3>
                </div>
                
                <div className="space-y-6">
                   <div className="bg-white/5 p-8 rounded-[2.5rem] border border-white/10">
                      <div className="flex items-center gap-4 mb-6">
                        <Key size={30} className="text-amber-500" />
                        <div>
                           <p className="text-base font-black">Change Password</p>
                           <p className="text-[10px] uppercase text-slate-500 font-bold tracking-widest">Update your credentials</p>
                        </div>
                      </div>

                      {isChangingPass ? (
                        <form onSubmit={handleChangePassword} className="space-y-4 animate-in slide-in-from-top-4">
                           {passError && <div className="text-rose-400 text-xs font-bold flex items-center gap-2 bg-rose-500/10 p-3 rounded-xl border border-rose-500/20"><AlertCircle size={14}/> {passError}</div>}
                           {passSuccess && <div className="text-emerald-400 text-xs font-bold flex items-center gap-2 bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20"><CheckCircle2 size={14}/> {passSuccess}</div>}
                           
                           <div className="space-y-1">
                              <label className="text-[9px] uppercase font-black text-slate-500 ml-1">Current Password</label>
                              <input 
                                type="password" 
                                required
                                className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-xl outline-none focus:border-indigo-500 text-sm" 
                                value={passForm.currentPassword}
                                onChange={e => setPassForm({...passForm, currentPassword: e.target.value})}
                              />
                           </div>
                           <div className="space-y-1">
                              <label className="text-[9px] uppercase font-black text-slate-500 ml-1">New Password</label>
                              <input 
                                type="password" 
                                required
                                className={`w-full px-5 py-4 bg-white/5 border rounded-xl outline-none text-sm transition-all ${passwordValidation?.isValid ? 'border-emerald-500/50' : passError ? 'border-rose-500/50' : 'border-white/10 focus:border-indigo-500'}`}
                                value={passForm.newPassword}
                                onChange={e => {
                                  const value = e.target.value;
                                  setPassForm({...passForm, newPassword: value});
                                  const validation = validatePassword(value);
                                  setPasswordValidation(validation);
                                  if (validation.isValid) {
                                    setPassError('');
                                  }
                                }}
                                placeholder="Min 8 chars: A-Z, a-z, 0-9, special"
                              />
                              {passForm.newPassword && passwordValidation && (
                                <div className="mt-2 space-y-2">
                                  {passwordValidation.strength && (
                                    <div className="flex items-center gap-2">
                                      <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                                        <div 
                                          className={`h-full ${getPasswordStrengthBg(passwordValidation.strength)} transition-all duration-300`}
                                          style={{ width: passwordValidation.strength === 'strong' ? '100%' : passwordValidation.strength === 'medium' ? '66%' : '33%' }}
                                        />
                                      </div>
                                      <span className={`text-[8px] font-black uppercase tracking-wider ${getPasswordStrengthColor(passwordValidation.strength)}`}>
                                        {passwordValidation.strength}
                                      </span>
                                    </div>
                                  )}
                                  {passwordValidation.requirements && (
                                    <div className="grid grid-cols-2 gap-1 text-[8px]">
                                      <div className={`flex items-center gap-1 ${passwordValidation.requirements.minLength ? 'text-emerald-400' : 'text-slate-500'}`}>
                                        <CheckCircle2 size={10} className={passwordValidation.requirements.minLength ? 'fill-emerald-400 text-white' : ''} />
                                        <span className="font-bold">8+ chars</span>
                                      </div>
                                      <div className={`flex items-center gap-1 ${passwordValidation.requirements.hasUpperCase ? 'text-emerald-400' : 'text-slate-500'}`}>
                                        <CheckCircle2 size={10} className={passwordValidation.requirements.hasUpperCase ? 'fill-emerald-400 text-white' : ''} />
                                        <span className="font-bold">A-Z</span>
                                      </div>
                                      <div className={`flex items-center gap-1 ${passwordValidation.requirements.hasLowerCase ? 'text-emerald-400' : 'text-slate-500'}`}>
                                        <CheckCircle2 size={10} className={passwordValidation.requirements.hasLowerCase ? 'fill-emerald-400 text-white' : ''} />
                                        <span className="font-bold">a-z</span>
                                      </div>
                                      <div className={`flex items-center gap-1 ${passwordValidation.requirements.hasNumber ? 'text-emerald-400' : 'text-slate-500'}`}>
                                        <CheckCircle2 size={10} className={passwordValidation.requirements.hasNumber ? 'fill-emerald-400 text-white' : ''} />
                                        <span className="font-bold">0-9</span>
                                      </div>
                                      <div className={`flex items-center gap-1 col-span-2 ${passwordValidation.requirements.hasSpecialChar ? 'text-emerald-400' : 'text-slate-500'}`}>
                                        <CheckCircle2 size={10} className={passwordValidation.requirements.hasSpecialChar ? 'fill-emerald-400 text-white' : ''} />
                                        <span className="font-bold">Special (!@#$%)</span>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                           </div>
                           <div className="space-y-1">
                              <label className="text-[9px] uppercase font-black text-slate-500 ml-1">Confirm New Password</label>
                              <input 
                                type="password" 
                                required
                                className={`w-full px-5 py-4 bg-white/5 border rounded-xl outline-none text-sm transition-all ${passForm.confirmPassword && passForm.newPassword === passForm.confirmPassword ? 'border-emerald-500/50' : passForm.confirmPassword && passForm.newPassword !== passForm.confirmPassword ? 'border-rose-500/50' : 'border-white/10 focus:border-indigo-500'}`}
                                value={passForm.confirmPassword}
                                onChange={e => {
                                  setPassForm({...passForm, confirmPassword: e.target.value});
                                  setPassError('');
                                }}
                                placeholder="Re-enter new password"
                              />
                              {passForm.confirmPassword && passForm.newPassword !== passForm.confirmPassword && (
                                <p className="text-[8px] text-rose-400 font-bold mt-1">Passwords do not match</p>
                              )}
                              {passForm.confirmPassword && passForm.newPassword === passForm.confirmPassword && passwordValidation?.isValid && (
                                <p className="text-[8px] text-emerald-400 font-bold mt-1 flex items-center gap-1">
                                  <CheckCircle2 size={10} /> Passwords match
                                </p>
                              )}
                           </div>
                           <div className="flex gap-2 pt-2">
                             <button type="submit" className="flex-1 bg-indigo-600 text-white py-4 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all">Confirm Change</button>
                             <button type="button" onClick={() => setIsChangingPass(false)} className="px-4 text-slate-500 hover:text-white transition-colors">Cancel</button>
                           </div>
                        </form>
                      ) : (
                        <button 
                          onClick={() => {
                            setIsChangingPass(true);
                            setPassForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                            setPasswordValidation(null);
                            setPassError('');
                            setPassSuccess('');
                          }} 
                          className="w-full py-5 bg-white text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl hover:bg-indigo-500 hover:text-white transition-all"
                        >
                          Change Credentials
                        </button>
                      )}
                   </div>
                </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const InputGroup: React.FC<{ label: string, value: string, onChange: (v: string) => void }> = ({ label, value, onChange }) => (
  <div className="space-y-2">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
    <input 
      type="text" 
      required 
      className="w-full px-6 py-4.5 bg-slate-50 border-2 border-transparent rounded-2xl focus:border-indigo-600 focus:bg-white outline-none font-bold text-lg transition-all" 
      value={value} 
      onChange={e => onChange(e.target.value)} 
    />
  </div>
);

const StaticDetail: React.FC<{ label: string, value: string }> = ({ label, value }) => (
  <div className="p-10 bg-slate-50/50 rounded-[2.5rem] border border-slate-100 flex flex-col group hover:bg-white hover:shadow-2xl transition-all duration-500">
    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 opacity-60">{label}</span>
    <span className="text-2xl font-black text-slate-900 tracking-tighter truncate">{value}</span>
  </div>
);

export default Profile;
