
import React, { useState } from 'react';
import { authService } from '../../services/authService';
import { useAuth } from '../../context/AuthContext';
import { UserPlus, Mail, Lock, User as UserIcon, AlertCircle, ArrowRight, Phone, CheckCircle2 } from 'lucide-react';
import { validatePassword, getPasswordStrengthColor, getPasswordStrengthBg } from '../../utils/passwordValidation';

const Register: React.FC = () => {
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phoneNumber: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState<ReturnType<typeof validatePassword> | null>(null);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    // Name validation (No numbers allowed, supports English/Arabic)
    const nameRegex = /^[a-zA-Z\u0621-\u064A\s]{2,30}$/;
    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required.";
    } else if (!nameRegex.test(formData.firstName.trim())) {
      newErrors.firstName = "First name must not contain numbers or special characters.";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required.";
    } else if (!nameRegex.test(formData.lastName.trim())) {
      newErrors.lastName = "Last name must not contain numbers or special characters.";
    }

    // Username validation
    const userRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!userRegex.test(formData.username)) {
      newErrors.username = "Username must be 3-20 characters (letters, numbers, underscores).";
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    // Jordan Phone Number validation (077, 078, 079)
    const jordanPhoneRegex = /^(\+962|0)?7[789]\d{7}$/;
    const cleanedPhone = formData.phoneNumber.replace(/[\s-]/g, '');
    if (!jordanPhoneRegex.test(cleanedPhone)) {
      newErrors.phoneNumber = "Enter a valid Jordan mobile number (077, 078, or 079).";
    }

    // Password validation
    const passwordValidationResult = validatePassword(formData.password);
    if (!passwordValidationResult.isValid) {
      newErrors.password = passwordValidationResult.error || "Password does not meet requirements.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const normalizePhoneNumber = (phone: string) => {
    let cleaned = phone.replace(/[\s-]/g, '');
    if (cleaned.startsWith('07')) return '+962' + cleaned.substring(1);
    if (cleaned.startsWith('7')) return '+962' + cleaned;
    return cleaned.startsWith('+') ? cleaned : '+' + cleaned;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      const payload = { 
        ...formData, 
        phoneNumber: normalizePhoneNumber(formData.phoneNumber) 
      };
      await authService.register(payload);
      
      // Auto-login after successful registration
      await login({ login: formData.username, password: formData.password });
      
      window.location.href = '#/';
    } catch (err: any) {
      setErrors({ server: err.response?.data?.detail || 'Registration failed. This username or email might already be in use.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4">
      <div className="max-w-xl w-full space-y-8 bg-white p-12 rounded-[3.5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] border border-slate-100">
        <div className="text-center">
          <div className="mx-auto h-24 w-24 bg-indigo-600 rounded-[2rem] flex items-center justify-center text-white shadow-2xl shadow-indigo-200 animate-bounce-slow">
            <UserPlus size={44} />
          </div>
          <h2 className="mt-8 text-4xl font-black text-slate-900 tracking-tighter">Create Account</h2>
          <p className="mt-3 text-slate-500 font-bold uppercase text-[10px] tracking-[0.3em]">Join Jordan's Elite Marketplace</p>
        </div>

        <form className="mt-10 space-y-6" onSubmit={handleSubmit}>
          {errors.server && (
            <div className="bg-rose-50 border border-rose-100 text-rose-600 p-5 rounded-2xl flex items-center gap-3 text-sm font-black animate-shake">
              <AlertCircle size={20} /> {errors.server}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">First Name</label>
              <input 
                type="text" 
                required 
                placeholder="e.g. Ahmad"
                className={`w-full px-6 py-4 bg-slate-50 border-2 rounded-2xl transition-all outline-none font-bold ${errors.firstName ? 'border-rose-200 bg-rose-50/30' : 'border-transparent focus:border-indigo-600 focus:bg-white'}`} 
                value={formData.firstName} 
                onChange={(e) => setFormData({...formData, firstName: e.target.value})} 
              />
              {errors.firstName && <p className="text-[10px] text-rose-500 font-bold ml-1 mt-1">{errors.firstName}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Last Name</label>
              <input 
                type="text" 
                required
                placeholder="e.g. Mansour"
                className={`w-full px-6 py-4 bg-slate-50 border-2 rounded-2xl transition-all outline-none font-bold ${errors.lastName ? 'border-rose-200 bg-rose-50/30' : 'border-transparent focus:border-indigo-600 focus:bg-white'}`} 
                value={formData.lastName} 
                onChange={(e) => setFormData({...formData, lastName: e.target.value})} 
              />
              {errors.lastName && <p className="text-[10px] text-rose-500 font-bold ml-1 mt-1">{errors.lastName}</p>}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Username</label>
            <input 
              type="text" 
              required 
              placeholder="Unique handle"
              className={`w-full px-6 py-4 bg-slate-50 border-2 rounded-2xl transition-all outline-none font-bold ${errors.username ? 'border-rose-200 bg-rose-50/30' : 'border-transparent focus:border-indigo-600 focus:bg-white'}`} 
              value={formData.username} 
              onChange={(e) => setFormData({...formData, username: e.target.value})} 
            />
            {errors.username && <p className="text-[10px] text-rose-500 font-bold ml-1 mt-1">{errors.username}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
            <input 
              type="email" 
              required 
              placeholder="yourname@example.com"
              className={`w-full px-6 py-4 bg-slate-50 border-2 rounded-2xl transition-all outline-none font-bold ${errors.email ? 'border-rose-200 bg-rose-50/30' : 'border-transparent focus:border-indigo-600 focus:bg-white'}`} 
              value={formData.email} 
              onChange={(e) => setFormData({...formData, email: e.target.value})} 
            />
            {errors.email && <p className="text-[10px] text-rose-500 font-bold ml-1 mt-1">{errors.email}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Phone Number (Jordan)</label>
            <div className="relative">
              <Phone className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="tel" 
                required 
                placeholder="077, 078, or 079"
                className={`w-full pl-14 pr-6 py-4 bg-slate-50 border-2 rounded-2xl transition-all outline-none font-bold ${errors.phoneNumber ? 'border-rose-200 bg-rose-50/30' : 'border-transparent focus:border-indigo-600 focus:bg-white'}`} 
                value={formData.phoneNumber} 
                onChange={(e) => setFormData({...formData, phoneNumber: e.target.value})} 
              />
            </div>
            {errors.phoneNumber && <p className="text-[10px] text-rose-500 font-bold ml-1 mt-1">{errors.phoneNumber}</p>}
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                type="password" 
                required 
                placeholder="Minimum 8 characters with uppercase, lowercase, number, and special character"
                className={`w-full pl-14 pr-6 py-4 bg-slate-50 border-2 rounded-2xl transition-all outline-none font-bold ${errors.password ? 'border-rose-200 bg-rose-50/30' : passwordValidation?.isValid ? 'border-emerald-200 bg-emerald-50/30' : 'border-transparent focus:border-indigo-600 focus:bg-white'}`} 
                value={formData.password} 
                onChange={(e) => {
                  const value = e.target.value;
                  setFormData({...formData, password: value});
                  const validation = validatePassword(value);
                  setPasswordValidation(validation);
                  if (validation.isValid && errors.password) {
                    const newErrors = {...errors};
                    delete newErrors.password;
                    setErrors(newErrors);
                  }
                }} 
              />
            </div>
            {formData.password && passwordValidation && (
              <div className="mt-2 space-y-2">
                {passwordValidation.strength && (
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${getPasswordStrengthBg(passwordValidation.strength)} transition-all duration-300`}
                        style={{ width: passwordValidation.strength === 'strong' ? '100%' : passwordValidation.strength === 'medium' ? '66%' : '33%' }}
                      />
                    </div>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${getPasswordStrengthColor(passwordValidation.strength)}`}>
                      {passwordValidation.strength}
                    </span>
                  </div>
                )}
                {passwordValidation.requirements && (
                  <div className="grid grid-cols-2 gap-1 text-[9px]">
                    <div className={`flex items-center gap-1.5 ${passwordValidation.requirements.minLength ? 'text-emerald-600' : 'text-slate-400'}`}>
                      <CheckCircle2 size={12} className={passwordValidation.requirements.minLength ? 'fill-emerald-600 text-white' : ''} />
                      <span className="font-bold">8+ characters</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${passwordValidation.requirements.hasUpperCase ? 'text-emerald-600' : 'text-slate-400'}`}>
                      <CheckCircle2 size={12} className={passwordValidation.requirements.hasUpperCase ? 'fill-emerald-600 text-white' : ''} />
                      <span className="font-bold">Uppercase</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${passwordValidation.requirements.hasLowerCase ? 'text-emerald-600' : 'text-slate-400'}`}>
                      <CheckCircle2 size={12} className={passwordValidation.requirements.hasLowerCase ? 'fill-emerald-600 text-white' : ''} />
                      <span className="font-bold">Lowercase</span>
                    </div>
                    <div className={`flex items-center gap-1.5 ${passwordValidation.requirements.hasNumber ? 'text-emerald-600' : 'text-slate-400'}`}>
                      <CheckCircle2 size={12} className={passwordValidation.requirements.hasNumber ? 'fill-emerald-600 text-white' : ''} />
                      <span className="font-bold">Number</span>
                    </div>
                    <div className={`flex items-center gap-1.5 col-span-2 ${passwordValidation.requirements.hasSpecialChar ? 'text-emerald-600' : 'text-slate-400'}`}>
                      <CheckCircle2 size={12} className={passwordValidation.requirements.hasSpecialChar ? 'fill-emerald-600 text-white' : ''} />
                      <span className="font-bold">Special character (!@#$%^&*)</span>
                    </div>
                  </div>
                )}
              </div>
            )}
            {errors.password && <p className="text-[10px] text-rose-500 font-bold ml-1 mt-1">{errors.password}</p>}
          </div>

          <div className="pt-6">
            <button 
              type="submit" 
              disabled={loading} 
              className="w-full py-5 bg-indigo-600 text-white rounded-[2rem] font-black text-xl shadow-2xl shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-6 h-6 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                  Finalizing...
                </>
              ) : (
                <>
                  Register & Start Selling <ArrowRight size={24} />
                </>
              )}
            </button>
          </div>
        </form>

        <p className="text-center text-sm font-bold text-slate-500">
          Already a member? <a href="#/login" className="text-indigo-600 hover:underline">Log in to your account</a>
        </p>
      </div>
    </div>
  );
};

export default Register;
