
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShoppingBag, User as UserIcon, LogOut, LayoutDashboard, ChevronDown } from 'lucide-react';
import { BACKEND_URL } from '../../services/api';

const Navbar: React.FC = () => {
  const { user, profileImage, logout, isAdmin } = useAuth();

  const getAbsoluteImageUrl = (url: string | null | undefined) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    const normalizedPath = url.startsWith('/') ? url : `/${url}`;
    return `${BACKEND_URL}${normalizedPath}`;
  };

  return (
    <nav className="glass-nav sticky top-0 z-50 py-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <a href="#/" className="flex items-center gap-3 group">
            <div className="bg-indigo-600 text-white p-2.5 rounded-xl group-hover:rotate-6 transition-transform shadow-xl shadow-indigo-100">
              <ShoppingBag size={24} />
            </div>
            <span className="text-2xl font-black tracking-tighter text-slate-900">
              Tijarah<span className="text-indigo-600">Jo</span>
            </span>
          </a>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-5">
          <a href="#/browse" className="text-slate-500 hover:text-indigo-600 font-bold text-xs uppercase tracking-[0.2em] hidden lg:block mr-2 transition-colors">Explore Marketplace</a>
          
          <div className="h-8 w-px bg-slate-100 hidden sm:block mx-2"></div>

          {user ? (
            <div className="flex items-center gap-3">
              {isAdmin && (
                <a href="#/admin" className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all" title="Admin Dashboard">
                  <LayoutDashboard size={20} />
                </a>
              )}
              
              <div className="relative group">
                <button className="flex items-center gap-3 pl-1.5 pr-4 py-1.5 bg-white border border-slate-100 rounded-[1.5rem] hover:border-indigo-100 hover:shadow-lg hover:shadow-indigo-50/50 transition-all">
                  <div className="w-12 h-12 rounded-[1rem] bg-indigo-600 flex items-center justify-center text-white font-black overflow-hidden shadow-md ring-4 ring-slate-50">
                    {profileImage ? (
                      <img 
                        src={`${getAbsoluteImageUrl(profileImage)}?t=${Date.now()}`} 
                        alt={user.firstName} 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <span className="text-lg">{user.firstName[0]}</span>
                    )}
                  </div>
                  <div className="text-left hidden sm:block">
                    <p className="text-sm font-black text-slate-900 leading-tight">{user.firstName}</p>
                    <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest">Active Profile</p>
                  </div>
                  <ChevronDown size={14} className="text-slate-400 group-hover:rotate-180 transition-transform ml-1" />
                </button>
                
                {/* Dropdown Menu */}
                <div className="absolute right-0 top-full mt-4 w-64 bg-white border border-slate-100 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] py-4 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all z-[60] scale-95 group-hover:scale-100 origin-top-right">
                  <div className="px-6 py-3 mb-3 border-b border-slate-50">
                     <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Personal Hub</p>
                  </div>
                  <div className="space-y-1 px-2">
                    <a href="#/profile" className="flex items-center gap-4 px-5 py-3 hover:bg-indigo-50 rounded-2xl text-sm font-bold text-slate-700 transition-all group/item">
                      <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg group-hover/item:bg-indigo-600 group-hover/item:text-white transition-colors">
                        <UserIcon size={18} />
                      </div>
                      Account Settings
                    </a>
                    <a href="#/my-posts" className="flex items-center gap-4 px-5 py-3 hover:bg-indigo-50 rounded-2xl text-sm font-bold text-slate-700 transition-all group/item">
                      <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg group-hover/item:bg-indigo-600 group-hover/item:text-white transition-colors">
                        <ShoppingBag size={18} />
                      </div>
                      My Listings
                    </a>
                  </div>
                  <div className="px-4 mt-4 pt-4 border-t border-slate-50">
                    <button onClick={logout} className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-rose-50 hover:bg-rose-100 text-sm font-black text-rose-600 rounded-2xl transition-all">
                      <LogOut size={18} /> Sign Out
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <a href="#/login" className="text-sm font-black text-slate-500 hover:text-indigo-600 px-2 transition-colors">Log In</a>
              <a href="#/register" className="bg-slate-900 text-white px-8 py-3.5 rounded-[1.25rem] text-sm font-black hover:bg-indigo-600 transition-all shadow-xl shadow-slate-100 active:scale-95">Start Selling</a>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
