
import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { ShoppingBag, User as UserIcon, LogOut, LayoutDashboard, Search, Menu } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, profileImage, logout, isAdmin } = useAuth();

  return (
    <nav className="glass-nav sticky top-0 z-50 py-3">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <a href="#/" className="flex items-center gap-2 group">
            <div className="bg-blue-600 text-white p-2 rounded-lg group-hover:scale-110 transition-transform">
              <ShoppingBag size={24} />
            </div>
            <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-600">
              TijarahJo
            </span>
          </a>
        </div>

        <div className="hidden md:flex items-center flex-1 max-w-lg mx-8">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search products, categories..." 
              className="w-full bg-gray-100 border-none rounded-full py-2 pl-10 pr-4 focus:ring-2 focus:ring-blue-500 transition-all text-sm"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <a href="#/browse" className="text-gray-600 hover:text-blue-600 font-medium text-sm hidden sm:block">Explore</a>
          
          {user ? (
            <div className="flex items-center gap-3">
              {isAdmin && (
                <a href="#/admin" className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors" title="Admin Dashboard">
                  <LayoutDashboard size={20} />
                </a>
              )}
              <a href="#/create-post" className="bg-blue-600 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-blue-700 transition-shadow shadow-md">
                Sell Item
              </a>
              <div className="relative group">
                <button className="flex items-center gap-2 p-1 border rounded-full hover:bg-gray-50 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold overflow-hidden border border-gray-100">
                    {profileImage ? (
                      <img src={profileImage} alt={user.firstName} className="w-full h-full object-cover" />
                    ) : (
                      user.firstName[0]
                    )}
                  </div>
                </button>
                <div className="absolute right-0 top-full mt-2 w-48 bg-white border rounded-xl shadow-xl py-2 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all z-[60]">
                  <a href="#/profile" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-sm text-gray-700">
                    <UserIcon size={16} /> My Profile
                  </a>
                  <a href="#/my-posts" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-sm text-gray-700">
                    <ShoppingBag size={16} /> My Listings
                  </a>
                  <hr className="my-2" />
                  <button onClick={logout} className="w-full flex items-center gap-2 px-4 py-2 hover:bg-red-50 text-sm text-red-600">
                    <LogOut size={16} /> Logout
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <a href="#/login" className="text-sm font-medium text-gray-700 hover:text-blue-600">Log In</a>
              <a href="#/register" className="bg-gray-900 text-white px-5 py-2 rounded-full text-sm font-semibold hover:bg-black">Sign Up</a>
            </div>
          )}
          <button className="md:hidden p-2 text-gray-600"><Menu size={24} /></button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
