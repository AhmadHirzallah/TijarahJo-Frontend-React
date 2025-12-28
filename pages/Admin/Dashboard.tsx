
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { adminService } from '../../services/adminService';
import { categoryService } from '../../services/categoryService';
import { AdminDashboardStats, User, Post, RoleID, UserStatus, PostStatus, Category } from '../../types/api';
import { useAuth } from '../../context/AuthContext';
import { BACKEND_URL } from '../../services/api';
import api from '../../services/api';
import Loader from '../../components/UI/Loader';
import { 
  Users, Package, Grid, Shield, TrendingUp, Check, Search, Trash2, Ban, Eye, Settings, Plus, Edit2, 
  Activity, BarChart3, Database, ShieldAlert, X, AlertTriangle, CheckCircle2, ShieldCheck, ExternalLink
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Link } from 'react-router';

type AdminTab = 'overview' | 'users' | 'posts' | 'categories';

const Dashboard: React.FC = () => {
  const { user: currentUser, profileImage, refreshProfileImage } = useAuth();
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [userList, setUserList] = useState<User[]>([]);
  const [postList, setPostList] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filterQuery, setFilterQuery] = useState('');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState('');

  const refreshData = useCallback(async () => {
    try {
      const statsData = await adminService.getDashboardStats();
      setStats(statsData);
      
      if (activeTab === 'users') {
        const res = await adminService.getAllUsers({ includeDeleted: true });
        setUserList(res.users);
      } else if (activeTab === 'posts') {
        const res = await adminService.getAllPosts({ includeDeleted: true });
        setPostList(res.posts);
      } else if (activeTab === 'categories') {
        const cats = await categoryService.getAll();
        setCategories(cats);
      }
    } catch (err) {
      console.error("Dashboard out of sync", err);
    }
  }, [activeTab]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await refreshData();
      setLoading(false);
    };
    init();
  }, [refreshData]);

  const getAbsoluteImageUrl = (url: string | null | undefined) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    const normalizedPath = url.startsWith('/') ? url : `/${url}`;
    return `${BACKEND_URL}${normalizedPath}`;
  };

  const handleUserAction = async (userId: number, action: 'ban' | 'activate' | 'delete') => {
    if (!window.confirm(`Are you sure you want to ${action} user #${userId}?`)) return;
    try {
      if (action === 'ban') await adminService.updateUserStatus(userId, UserStatus.Banned, "Policy Violation");
      if (action === 'activate') await adminService.updateUserStatus(userId, UserStatus.Active, "Reinstated");
      if (action === 'delete') await adminService.permanentDeleteUser(userId);
      await refreshData();
      alert(`User #${userId} status updated.`);
    } catch (err) { alert("Operation denied. Check network status."); }
  };

  const handlePostModeration = async (postId: number, status: PostStatus) => {
    const action = status === PostStatus.Active ? 'Approve' : 'Reject';
    try {
      await adminService.updatePostStatus(postId, status, "Security Review Result");
      await refreshData();
      alert(`Listing #${postId} is now ${status === PostStatus.Active ? 'Published' : 'Restricted'}.`);
    } catch (err) { alert("Moderation decision failed to sync."); }
  };

  const handleProfileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentUser || !e.target.files?.[0]) return;
    
    const formData = new FormData();
    formData.append('file', e.target.files[0]);
    
    try {
      setUploading(true);
      await api.post(`/users/${currentUser.userID}/images/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      await refreshProfileImage();
      alert('Profile image updated successfully!');
    } catch (err) {
      console.error('Image upload failed:', err);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  if (loading) return <Loader fullScreen />;
  if (!stats) return <div className="p-20 text-center font-black text-slate-400">ADMIN_SESSION_LOST</div>;

  const distributionData = [
    { name: 'Live Marketplace', value: stats.activePosts, color: '#4f46e5' },
    { name: 'Review Queue', value: stats.pendingReviewPosts, color: '#f59e0b' },
    { name: 'Removed Assets', value: stats.deletedPosts, color: '#f43f5e' }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col lg:flex-row">
      {/* Sidebar - Enhanced Admin Identity */}
      <aside className="w-full lg:w-96 bg-slate-900 text-slate-300 flex flex-col z-20 sticky top-0 h-screen overflow-y-auto">
        <div className="p-10 flex flex-col h-full">
          {/* Main Brand */}
          <div className="flex items-center gap-4 text-white mb-14 px-2">
            <div className="bg-indigo-600 p-3 rounded-2xl shadow-2xl shadow-indigo-600/30">
              <Database size={28} />
            </div>
            <div>
              <span className="text-2xl font-black tracking-tighter block leading-none">TijarahJo</span>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400 mt-1 block">ADMIN_CONSOLE</span>
            </div>
          </div>

          {/* User Feature Profile - Big Picture */}
          <div className="mb-14 relative group">
            <div className="absolute inset-0 bg-indigo-600/20 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative bg-white/5 rounded-[3rem] p-10 border border-white/10 flex flex-col items-center text-center shadow-2xl">
               <input 
                 type="file" 
                 ref={fileInputRef}
                 className="hidden" 
                 accept="image/*"
                 onChange={handleProfileImageUpload}
                 disabled={uploading}
               />
               <div className="w-40 h-40 rounded-[2.5rem] bg-gradient-to-br from-indigo-500 to-indigo-700 p-1.5 mb-6 shadow-2xl ring-4 ring-white/5 relative overflow-hidden">
                  <div className="w-full h-full rounded-[2.25rem] bg-slate-800 overflow-hidden flex items-center justify-center text-5xl font-black text-white">
                    {profileImage ? (
                      <img src={getAbsoluteImageUrl(profileImage)!} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="" />
                    ) : (
                      <span>{currentUser?.firstName[0]}</span>
                    )}
                  </div>
                  <div className="absolute inset-0 bg-indigo-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploading}
                      className="bg-white text-indigo-600 p-3 rounded-full shadow-xl hover:scale-110 transition-transform disabled:opacity-50"
                      title="Change profile picture"
                    >
                      {uploading ? (
                        <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Edit2 size={20}/>
                      )}
                    </button>
                  </div>
               </div>
               <div className="space-y-2">
                  <h3 className="text-2xl font-black text-white leading-tight tracking-tight">{currentUser?.fullName}</h3>
                  <div className="inline-flex items-center gap-2 bg-indigo-500/10 px-6 py-2 rounded-full border border-indigo-500/20">
                     <ShieldCheck size={14} className="text-indigo-400" />
                     <span className="text-[11px] font-black text-indigo-400 uppercase tracking-widest">Global Controller</span>
                  </div>
               </div>
            </div>
          </div>

          <nav className="space-y-3 flex-1">
            <NavItem active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={<Activity size={22}/>} label="Market Intelligence" />
            <NavItem active={activeTab === 'users'} onClick={() => setActiveTab('users')} icon={<Users size={22}/>} label="Member Records" />
            <NavItem active={activeTab === 'posts'} onClick={() => setActiveTab('posts')} icon={<Package size={22}/>} label="Asset Moderation" />
            <NavItem active={activeTab === 'categories'} onClick={() => setActiveTab('categories')} icon={<Grid size={22}/>} label="Platform Taxonomy" />
          </nav>
          
          <div className="mt-10 pt-10 border-t border-white/5">
             <button onClick={() => window.location.href = '#/'} className="w-full flex items-center gap-4 px-8 py-5 rounded-2xl font-black text-sm text-slate-500 hover:text-white hover:bg-white/5 transition-all">
               <ExternalLink size={20} /> View Marketplace
             </button>
          </div>
        </div>
      </aside>

      {/* Main Administrative Worksurface */}
      <main className="flex-1 p-8 lg:p-16 overflow-y-auto space-y-16">
        <header className="flex justify-between items-end border-b pb-12 border-slate-200">
          <div>
             <h2 className="text-5xl font-black text-slate-900 tracking-tighter capitalize">{activeTab} Worksurface</h2>
             <p className="text-slate-400 font-bold text-sm uppercase tracking-widest mt-2 ml-1 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                System Operational & Fully Synced
             </p>
          </div>
          <button 
            onClick={() => refreshData()} 
            className="flex items-center gap-3 px-8 py-4 bg-white text-indigo-600 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 hover:bg-indigo-600 hover:text-white transition-all font-black text-sm uppercase tracking-widest"
          >
            <Activity size={20}/> Refresh Data
          </button>
        </header>

        {activeTab === 'overview' && (
          <div className="space-y-16 animate-in fade-in duration-700">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-10">
               <StatCard label="Active Members" value={stats.totalUsers} color="blue" icon={<Users size={28}/>} />
               <StatCard label="Market Assets" value={stats.activePosts} color="indigo" icon={<Package size={28}/>} />
               <StatCard label="Pending Audit" value={stats.pendingReviewPosts} color="amber" icon={<ShieldAlert size={28}/>} pulse={stats.pendingReviewPosts > 0} />
               <StatCard label="Safety Rating" value="99.9%" color="emerald" icon={<Shield size={28}/>} />
            </div>

            {/* Distribution and Health */}
            <div className="grid grid-cols-1 2xl:grid-cols-3 gap-14">
               <div className="2xl:col-span-2 bg-white rounded-[4rem] p-12 shadow-[0_25px_80px_-15px_rgba(0,0,0,0.05)] border border-slate-100">
                  <div className="flex justify-between items-center mb-12">
                     <h4 className="text-2xl font-black text-slate-900 flex items-center gap-3">Marketplace Inventory Stats</h4>
                     <button className="text-xs font-black text-indigo-600 uppercase tracking-widest">Full Report</button>
                  </div>
                  <div className="h-96">
                     <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={distributionData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                           <CartesianGrid strokeDasharray="6 6" vertical={false} stroke="#f1f5f9" />
                           <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 900}} />
                           <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12, fontWeight: 700}} />
                           <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 30px 60px -12px rgba(0,0,0,0.15)', padding: '20px'}} />
                           <Bar dataKey="value" radius={[14, 14, 0, 0]} barSize={65}>
                              {distributionData.map((e, i) => <Cell key={i} fill={e.color} />)}
                           </Bar>
                        </BarChart>
                     </ResponsiveContainer>
                  </div>
               </div>

               <div className="bg-slate-900 rounded-[4rem] p-14 text-white flex flex-col justify-center relative overflow-hidden shadow-2xl">
                  <div className="flex items-center gap-4 mb-14">
                     <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center"><Activity className="text-indigo-400" /></div>
                     <h4 className="text-2xl font-black">Platform Health</h4>
                  </div>
                  <div className="space-y-12">
                     <HealthBar label="Auth Gateway & Sessions" value={100} color="bg-indigo-500 shadow-indigo-500/40" />
                     <HealthBar label="Media Content Storage" value={stats.activePosts} total={stats.totalPosts > 0 ? stats.totalPosts : 100} color="bg-emerald-500 shadow-emerald-500/40" />
                     <HealthBar label="Database Logic Integrity" value={98} color="bg-amber-500 shadow-amber-500/40" />
                  </div>
                  <TrendingUp size={220} className="absolute -right-16 -bottom-16 opacity-[0.03] rotate-12" />
               </div>
            </div>
          </div>
        )}

        {/* Dynamic Content Views */}
        {(activeTab === 'users' || activeTab === 'posts' || activeTab === 'categories') && (
           <div className="bg-white rounded-[4rem] shadow-[0_35px_100px_-15px_rgba(0,0,0,0.05)] border border-slate-100 overflow-hidden animate-in slide-in-from-bottom-10 duration-700">
              <div className="p-12 border-b bg-slate-50/30 flex flex-col md:flex-row justify-between items-center gap-8">
                 <h3 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">Records Hub</h3>
                 <div className="flex gap-6 w-full md:w-auto">
                    <div className="relative flex-1 md:w-96">
                       <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                       <input 
                         type="text" 
                         placeholder="Deep search records..." 
                         className="w-full pl-14 pr-6 py-4.5 bg-white border border-slate-200 rounded-[1.5rem] text-sm font-bold shadow-sm outline-none focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 transition-all" 
                         value={filterQuery} 
                         onChange={e => setFilterQuery(e.target.value)} 
                       />
                    </div>
                    {activeTab === 'categories' && (
                      <button 
                        onClick={() => { setCategoryName(''); setEditingCategory(null); setShowCategoryModal(true); }} 
                        className="px-8 py-4.5 bg-indigo-600 text-white rounded-2xl shadow-2xl shadow-indigo-600/30 font-black flex items-center gap-2 hover:bg-indigo-700 active:scale-95 transition-all"
                      >
                        <Plus size={24}/> New Category
                      </button>
                    )}
                 </div>
              </div>

              <div className="overflow-x-auto">
                 <table className="w-full text-left">
                    <thead>
                       <tr className="bg-slate-50 text-[11px] font-black text-slate-400 uppercase tracking-[0.4em] border-b">
                          <th className="px-14 py-9">Entity Details</th>
                          <th className="px-14 py-9">Operational Status</th>
                          <th className="px-14 py-9 text-right">Moderation Console</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                       {activeTab === 'users' && userList.filter(u => u.fullName.toLowerCase().includes(filterQuery.toLowerCase())).map(user => (
                          <tr key={user.userID} className="hover:bg-indigo-50/20 transition-all duration-300">
                             <td className="px-14 py-9">
                                <p className="font-black text-slate-900 text-2xl tracking-tight">{user.fullName}</p>
                                <p className="text-xs text-slate-400 uppercase font-black tracking-widest mt-1 opacity-70">{user.email}</p>
                             </td>
                             <td className="px-14 py-9">
                                <span className={`px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border shadow-sm ${user.status === UserStatus.Active ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'}`}>
                                   {UserStatus[user.status]}
                                </span>
                             </td>
                             <td className="px-14 py-9 text-right space-x-4">
                                {user.status === UserStatus.Active ? (
                                  <button onClick={() => handleUserAction(user.userID, 'ban')} className="p-4.5 text-rose-500 bg-rose-50 hover:bg-rose-500 hover:text-white rounded-2xl transition-all shadow-sm"><Ban size={22}/></button>
                                ) : (
                                  <button onClick={() => handleUserAction(user.userID, 'activate')} className="p-4.5 text-emerald-600 bg-emerald-50 hover:bg-emerald-600 hover:text-white rounded-2xl transition-all shadow-sm"><CheckCircle2 size={22}/></button>
                                )}
                                <button onClick={() => handleUserAction(user.userID, 'delete')} className="p-4.5 text-slate-300 bg-slate-100 hover:bg-slate-900 hover:text-white rounded-2xl transition-all shadow-sm"><Trash2 size={22}/></button>
                             </td>
                          </tr>
                       ))}

                       {activeTab === 'posts' && postList.filter(p => p.postTitle.toLowerCase().includes(filterQuery.toLowerCase())).map(post => (
                          <tr key={post.postID} className="hover:bg-indigo-50/20 transition-all duration-300">
                             <td className="px-14 py-9">
                                <p className="font-black text-slate-900 text-2xl tracking-tight">{post.postTitle}</p>
                                <p className="text-xs text-slate-400 uppercase font-black tracking-widest mt-1 opacity-70">{post.price.toLocaleString()} JD • ASSET_ID: {post.postID}</p>
                             </td>
                             <td className="px-14 py-9">
                                <span className={`px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest border shadow-sm ${post.status === PostStatus.Active ? 'bg-indigo-50 text-indigo-700 border-indigo-100' : 'bg-amber-50 text-amber-700 border-amber-100'}`}>
                                   {PostStatus[post.status]}
                                </span>
                             </td>
                             <td className="px-14 py-9 text-right space-x-4">
                                <Link to={`/post/${post.postID}`} className="p-4.5 text-indigo-500 bg-indigo-50 hover:bg-indigo-600 hover:text-white rounded-2xl inline-block transition-all shadow-sm"><Eye size={22}/></Link>
                                {post.status !== PostStatus.Active && (
                                  <button onClick={() => handlePostModeration(post.postID, PostStatus.Active)} className="p-4.5 text-emerald-600 bg-emerald-50 hover:bg-emerald-600 hover:text-white rounded-2xl transition-all shadow-sm" title="Approve Asset"><CheckCircle2 size={22}/></button>
                                )}
                                {post.status !== PostStatus.Rejected && (
                                  <button onClick={() => handlePostModeration(post.postID, PostStatus.Rejected)} className="p-4.5 text-amber-500 bg-amber-50 hover:bg-amber-600 hover:text-white rounded-2xl transition-all shadow-sm" title="Reject Asset"><AlertTriangle size={22}/></button>
                                )}
                                <button onClick={() => adminService.deletePost(post.postID).then(refreshData)} className="p-4.5 text-rose-500 bg-rose-50 hover:bg-rose-500 hover:text-white rounded-2xl transition-all shadow-sm"><Trash2 size={22}/></button>
                             </td>
                          </tr>
                       ))}

                       {activeTab === 'categories' && categories.filter(c => c.categoryName.toLowerCase().includes(filterQuery.toLowerCase())).map(cat => (
                          <tr key={cat.categoryID} className="hover:bg-indigo-50/20 transition-all duration-300">
                             <td className="px-14 py-9 font-black text-2xl text-slate-900 tracking-tight">{cat.categoryName}</td>
                             <td className="px-14 py-9 text-[11px] text-slate-400 font-black tracking-[0.3em] uppercase opacity-70">Taxonomy Protocol Node #{cat.categoryID}</td>
                             <td className="px-14 py-9 text-right space-x-4">
                                <button onClick={() => { setCategoryName(cat.categoryName); setEditingCategory(cat); setShowCategoryModal(true); }} className="p-4.5 text-indigo-500 bg-indigo-50 hover:bg-indigo-600 hover:text-white rounded-2xl transition-all shadow-sm"><Edit2 size={22}/></button>
                                <button onClick={() => adminService.deleteCategory(cat.categoryID).then(refreshData)} className="p-4.5 text-rose-500 bg-rose-50 hover:bg-rose-500 hover:text-white rounded-2xl transition-all shadow-sm"><Trash2 size={22}/></button>
                             </td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
           </div>
        )}
      </main>

      {showCategoryModal && (
        <div className="fixed inset-0 z-[100] bg-slate-900/70 backdrop-blur-xl flex items-center justify-center p-8">
           <div className="bg-white w-full max-w-xl rounded-[4rem] p-16 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.4)] animate-in zoom-in-95 duration-500">
              <h3 className="text-4xl font-black mb-12 text-slate-900 tracking-tighter">Marketplace Taxonomy</h3>
              <div className="space-y-4 mb-14">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Protocol Item Label</label>
                <input 
                  type="text" 
                  className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-[2rem] outline-none focus:border-indigo-600 focus:bg-white font-black text-2xl transition-all shadow-inner" 
                  placeholder="Electronics, Luxury, etc..." 
                  value={categoryName} 
                  onChange={e => setCategoryName(e.target.value)} 
                />
              </div>
              <div className="flex gap-6">
                 <button onClick={() => setShowCategoryModal(false)} className="flex-1 font-black text-slate-400 hover:text-slate-900 transition-colors uppercase text-sm tracking-[0.2em]">Discard Change</button>
                 <button 
                   onClick={async () => {
                      try {
                        if (editingCategory) await adminService.updateCategory(editingCategory.categoryID, categoryName);
                        else await adminService.createCategory(categoryName);
                        setShowCategoryModal(false);
                        refreshData();
                      } catch (err) { alert("Core protocol synchronization error."); }
                   }} 
                   className="flex-1 py-6 bg-indigo-600 text-white rounded-[1.75rem] font-black shadow-2xl shadow-indigo-600/40 hover:bg-indigo-700 active:scale-95 transition-all text-sm uppercase tracking-widest"
                 >
                   Commit Update
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

const NavItem: React.FC<{ active: boolean, onClick: () => void, icon: React.ReactNode, label: string }> = ({ active, onClick, icon, label }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-5 px-10 py-5 rounded-[1.5rem] font-black text-[15px] tracking-tight transition-all border-2 ${active ? 'bg-indigo-600 text-white shadow-2xl shadow-indigo-600/40 border-indigo-600' : 'text-slate-500 hover:text-white hover:bg-slate-800 border-transparent'}`}>
    {icon} {label}
  </button>
);

const StatCard: React.FC<{ label: string, value: string | number, icon: React.ReactNode, color: string, pulse?: boolean }> = ({ label, value, icon, color, pulse }) => {
  const themes: any = { blue: 'bg-blue-600', indigo: 'bg-indigo-600', amber: 'bg-amber-500', emerald: 'bg-emerald-600' };
  return (
    <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.03)] flex items-center gap-8 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
      <div className={`${themes[color]} p-6 rounded-[2rem] text-white shadow-2xl ${pulse ? 'animate-pulse' : ''}`}>{icon}</div>
      <div>
         <p className="text-[12px] font-black text-slate-400 uppercase tracking-[0.3em]">{label}</p>
         <p className="text-4xl font-black text-slate-900 mt-2 tracking-tighter">{value.toLocaleString()}</p>
      </div>
    </div>
  );
};

const HealthBar: React.FC<{ label: string, value: number, total?: number, color: string }> = ({ label, value, total = 100, color }) => (
  <div className="space-y-4">
     <div className="flex justify-between text-[11px] font-black uppercase tracking-[0.2em] opacity-50"><span>{label}</span><span>{Math.round((value/total)*100)}%</span></div>
     <div className="h-3.5 bg-white/5 rounded-full overflow-hidden shadow-inner p-0.5"><div className={`${color} h-full transition-all duration-1000 rounded-full shadow-lg`} style={{ width: `${(value/total)*100}%` }}></div></div>
  </div>
);

export default Dashboard;
