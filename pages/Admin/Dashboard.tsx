
import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/adminService';
import { categoryService } from '../../services/categoryService';
import { AdminDashboardStats, User, Post, RoleID, UserStatus, PostStatus, Category } from '../../types/api';
import Loader from '../../components/UI/Loader';
import { 
  Users, Package, Grid, Shield, TrendingUp, AlertTriangle, Check, X, 
  Search, ShieldAlert, Trash2, Ban, Eye, Settings, Plus, Edit2, 
  ChevronRight, Activity, BarChart3, Database, MessageSquare
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, AreaChart, Area } from 'recharts';
import { Link } from 'react-router-dom';

type AdminTab = 'overview' | 'users' | 'posts' | 'categories' | 'system';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  
  // Data lists
  const [userList, setUserList] = useState<User[]>([]);
  const [postList, setPostList] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filterQuery, setFilterQuery] = useState('');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryName, setCategoryName] = useState('');

  const refreshData = async () => {
    try {
      const statsData = await adminService.getDashboardStats();
      setStats(statsData);
      
      if (activeTab === 'users') {
        const { users } = await adminService.getAllUsers({ includeDeleted: true });
        setUserList(users);
      } else if (activeTab === 'posts') {
        const { posts } = await adminService.getAllPosts({ includeDeleted: true });
        setPostList(posts);
      } else if (activeTab === 'categories') {
        const cats = await categoryService.getAll();
        setCategories(cats);
      }
    } catch (err) {
      console.error("Dashboard Sync Failed", err);
    }
  };

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await refreshData();
      setLoading(false);
    };
    init();
  }, [activeTab]);

  const handleUserAction = async (userId: number, action: 'ban' | 'activate' | 'delete') => {
    if (!window.confirm(`Confirm ${action} action on user #${userId}?`)) return;
    try {
      if (action === 'ban') await adminService.updateUserStatus(userId, UserStatus.Banned);
      if (action === 'activate') await adminService.updateUserStatus(userId, UserStatus.Active);
      if (action === 'delete') await adminService.permanentDeleteUser(userId);
      await refreshData();
    } catch (err) { alert("Action failed"); }
  };

  const handlePostModeration = async (postId: number, status: PostStatus) => {
    try {
      await adminService.updatePostStatus(postId, status, "Admin Policy Review");
      await refreshData();
    } catch (err) { alert("Moderation failed"); }
  };

  const handleCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await adminService.updateCategory(editingCategory.categoryID, categoryName);
      } else {
        await adminService.createCategory(categoryName);
      }
      setShowCategoryModal(false);
      setEditingCategory(null);
      setCategoryName('');
      await refreshData();
    } catch (err) { alert("Category operation failed"); }
  };

  if (loading) return <Loader fullScreen />;
  if (!stats) return <div className="p-20 text-center font-black text-slate-400">SESSION_TERMINATED: API UNREACHABLE</div>;

  const distributionData = [
    { name: 'Active', value: stats.activePosts, color: '#4f46e5' },
    { name: 'Pending', value: stats.pendingReviewPosts, color: '#f59e0b' },
    { name: 'Draft', value: stats.draftPosts, color: '#94a3b8' },
    { name: 'Trash', value: stats.deletedPosts, color: '#f43f5e' }
  ];

  return (
    <div className="min-h-screen bg-[#fcfcfd] flex">
      {/* Sidebar Navigation */}
      <aside className="w-72 bg-slate-900 text-slate-300 flex flex-col hidden lg:flex">
        <div className="p-8">
          <div className="flex items-center gap-3 text-white mb-10">
            <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-500/20">
              <Database size={24} />
            </div>
            <span className="text-xl font-black tracking-tighter">Admin <span className="text-indigo-400">Panel</span></span>
          </div>

          <nav className="space-y-2">
            <NavItem active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} icon={<Activity size={20}/>} label="Market Stats" />
            <NavItem active={activeTab === 'users'} onClick={() => setActiveTab('users')} icon={<Users size={20}/>} label="User List" />
            <NavItem active={activeTab === 'posts'} onClick={() => setActiveTab('posts')} icon={<Package size={20}/>} label="Post List" />
            <NavItem active={activeTab === 'categories'} onClick={() => setActiveTab('categories')} icon={<Grid size={20}/>} label="Categories" />
            <NavItem active={activeTab === 'system'} onClick={() => setActiveTab('system')} icon={<Settings size={20}/>} label="System Settings" />
          </nav>
        </div>
        
        <div className="mt-auto p-8 border-t border-slate-800">
           <div className="bg-slate-800/50 rounded-2xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center text-white font-black">A</div>
              <div>
                 <p className="text-xs font-black text-white">Administrator</p>
                 <p className="text-[10px] text-slate-500 uppercase tracking-widest">Active Session</p>
              </div>
           </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-6 lg:p-12 space-y-10">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
             <h2 className="text-3xl font-black text-slate-900 tracking-tight">
               {activeTab === 'overview' && 'Market Overview'}
               {activeTab === 'users' && 'Manage Users'}
               {activeTab === 'posts' && 'Check Posts'}
               {activeTab === 'categories' && 'Manage Categories'}
               {activeTab === 'system' && 'Platform Health'}
             </h2>
             <p className="text-slate-400 font-medium text-sm">Reviewing activity and site status</p>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm lg:hidden">
               {(['overview', 'users', 'posts'] as AdminTab[]).map(t => (
                 <button key={t} onClick={() => setActiveTab(t)} className={`px-4 py-2 rounded-lg text-xs font-bold capitalize ${activeTab === t ? 'bg-slate-900 text-white' : 'text-slate-500'}`}>{t}</button>
               ))}
             </div>
             <button onClick={refreshData} className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm hover:bg-slate-50 text-slate-600 transition-all">
                <BarChart3 size={20} />
             </button>
          </div>
        </header>

        {activeTab === 'overview' && (
          <div className="space-y-10 animate-in fade-in slide-in-from-top-4 duration-700">
            {/* Summary Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
               <SummaryCard label="Total Users" value={stats.totalUsers} sub="+4% new" color="blue" icon={<Users/>} />
               <SummaryCard label="Total Postings" value={stats.totalPosts} sub="+18% growth" color="indigo" icon={<Package/>} />
               <SummaryCard label="Needs Review" value={stats.pendingReviewPosts} sub="Check soon" color="amber" icon={<ShieldAlert/>} pulse={stats.pendingReviewPosts > 0} />
               <SummaryCard label="Site Status" value="Healthy" sub="Live" color="emerald" icon={<Check/>} />
            </div>

            {/* Visual Analytics */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
               <div className="xl:col-span-2 bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl shadow-slate-200/50">
                  <div className="flex items-center justify-between mb-10">
                     <h4 className="text-xl font-black text-slate-900 flex items-center gap-2">
                        <TrendingUp size={20} className="text-indigo-600" /> Postings by Status
                     </h4>
                  </div>
                  <div className="h-[350px]">
                     <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={distributionData}>
                           <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                           <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 800}} />
                           <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11}} />
                           <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', fontWeight: 800}} />
                           <Bar dataKey="value" radius={[12, 12, 0, 0]} barSize={45}>
                              {distributionData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                           </Bar>
                        </BarChart>
                     </ResponsiveContainer>
                  </div>
               </div>

               <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden flex flex-col justify-between group">
                  <div className="relative z-10 space-y-10">
                     <h4 className="text-xl font-black flex items-center gap-2">
                        <Activity size={20} className="text-indigo-400" /> Site Health
                     </h4>
                     <div className="space-y-6">
                        <HealthBar label="Verified Users" value={stats.activeUsers} total={stats.totalUsers} color="bg-indigo-500" />
                        <HealthBar label="Public Posts" value={stats.publishedPosts} total={stats.totalPosts} color="bg-emerald-500" />
                        <HealthBar label="Customer Reviews" value={88} total={100} color="bg-amber-500" />
                     </div>
                  </div>
                  <div className="mt-12 relative z-10">
                     <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Security Check</p>
                     <p className="text-lg font-bold mt-2">All Safe</p>
                     <p className="text-xs text-slate-400 mt-2 leading-relaxed opacity-60">
                        The platform is running smoothly. No security problems found today.
                     </p>
                  </div>
               </div>
            </div>
          </div>
        )}

        {(activeTab === 'users' || activeTab === 'posts' || activeTab === 'categories') && (
          <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-8 duration-500">
             <div className="p-10 border-b border-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-6 bg-slate-50/20">
                <div className="space-y-1">
                   <h3 className="text-2xl font-black text-slate-900">
                      {activeTab === 'users' ? 'User List' : activeTab === 'posts' ? 'Post List' : 'Category List'}
                   </h3>
                   <p className="text-xs text-slate-400 font-bold uppercase tracking-[0.2em]">Record Management</p>
                </div>
                
                <div className="flex items-center gap-4">
                   <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                         type="text" 
                         placeholder="Search records..." 
                         className="pl-12 pr-6 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm w-full sm:w-80 focus:ring-4 focus:ring-indigo-100 outline-none transition-all shadow-sm"
                         value={filterQuery}
                         onChange={e => setFilterQuery(e.target.value)}
                      />
                   </div>
                   {activeTab === 'categories' && (
                     <button onClick={() => { setCategoryName(''); setEditingCategory(null); setShowCategoryModal(true); }} className="bg-indigo-600 text-white p-3.5 rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95">
                        <Plus size={20} />
                     </button>
                   )}
                </div>
             </div>

             <div className="overflow-x-auto">
                <table className="w-full text-left">
                   <thead>
                      <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] bg-slate-50/40">
                         <th className="px-10 py-6">Record Details</th>
                         <th className="px-10 py-6">{activeTab === 'users' ? 'User Role' : activeTab === 'posts' ? 'Status' : 'ID'}</th>
                         <th className="px-10 py-6">Created On</th>
                         <th className="px-10 py-6 text-right">Actions</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-50">
                      {activeTab === 'users' && userList.filter(u => u.fullName.toLowerCase().includes(filterQuery.toLowerCase())).map(user => (
                         <tr key={user.userID} className="hover:bg-indigo-50/20 transition-all group">
                            <td className="px-10 py-6">
                               <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-900 font-black border-2 border-white shadow-sm">
                                     {user.firstName[0]}
                                  </div>
                                  <div>
                                     <p className="font-black text-slate-900 group-hover:text-indigo-600 transition-colors">{user.fullName}</p>
                                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{user.email}</p>
                                  </div>
                               </div>
                            </td>
                            <td className="px-10 py-6">
                               <select 
                                  className="text-xs font-black bg-white border border-slate-200 rounded-xl px-4 py-2 outline-none focus:border-indigo-500"
                                  value={user.roleID}
                                  onChange={(e) => adminService.updateUserRole(user.userID, parseInt(e.target.value) as RoleID).then(refreshData)}
                               >
                                  <option value={RoleID.Admin}>Admin</option>
                                  <option value={RoleID.User}>User</option>
                                  <option value={RoleID.Moderator}>Mod</option>
                               </select>
                            </td>
                            <td className="px-10 py-6">
                               <Badge status={user.status === UserStatus.Active ? 'success' : 'danger'}>{UserStatus[user.status]}</Badge>
                            </td>
                            <td className="px-10 py-6 text-right">
                               <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                  {user.status === UserStatus.Active ? (
                                    <ActionButton onClick={() => handleUserAction(user.userID, 'ban')} icon={<Ban size={18}/>} color="rose" title="Ban User" />
                                  ) : (
                                    <ActionButton onClick={() => handleUserAction(user.userID, 'activate')} icon={<Check size={18}/>} color="emerald" title="Unban User" />
                                  )}
                                  <ActionButton onClick={() => handleUserAction(user.userID, 'delete')} icon={<Trash2 size={18}/>} color="slate" title="Remove User" />
                               </div>
                            </td>
                         </tr>
                      ))}

                      {activeTab === 'posts' && postList.filter(p => p.postTitle.toLowerCase().includes(filterQuery.toLowerCase())).map(post => (
                         <tr key={post.postID} className="hover:bg-amber-50/10 transition-all group">
                            <td className="px-10 py-6">
                               <div className="flex items-center gap-4">
                                  <div className="w-20 h-14 rounded-2xl bg-slate-100 overflow-hidden border-2 border-white shadow-sm flex-shrink-0">
                                     <img src={`https://picsum.photos/200/200?random=${post.postID}`} className="w-full h-full object-cover" />
                                  </div>
                                  <div>
                                     <p className="font-black text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">{post.postTitle}</p>
                                     <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">${post.price.toLocaleString()}</p>
                                  </div>
                               </div>
                            </td>
                            <td className="px-10 py-6">
                               <Badge status={post.status === PostStatus.Active ? 'success' : post.status === PostStatus.PendingReview ? 'warning' : 'neutral'}>
                                  {PostStatus[post.status]}
                               </Badge>
                            </td>
                            <td className="px-10 py-6 font-bold text-slate-500 text-xs">
                               {new Date(post.createdAt).toLocaleDateString()}
                            </td>
                            <td className="px-10 py-6 text-right">
                               <div className="flex items-center justify-end gap-2">
                                  <Link to={`/post/${post.postID}`} className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"><Eye size={18}/></Link>
                                  {post.status === PostStatus.PendingReview && (
                                     <button onClick={() => handlePostModeration(post.postID, PostStatus.Active)} className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all">Accept</button>
                                  )}
                                  <ActionButton onClick={() => adminService.deletePost(post.postID).then(refreshData)} icon={<Trash2 size={18}/>} color="rose" title="Remove Post" />
                               </div>
                            </td>
                         </tr>
                      ))}

                      {activeTab === 'categories' && categories.filter(c => c.categoryName.toLowerCase().includes(filterQuery.toLowerCase())).map(cat => (
                         <tr key={cat.categoryID} className="hover:bg-indigo-50/10 transition-all group">
                            <td className="px-10 py-6">
                               <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 font-black">
                                     <Grid size={20} />
                                  </div>
                                  <p className="font-black text-slate-900">{cat.categoryName}</p>
                               </div>
                            </td>
                            <td className="px-10 py-6 text-xs font-bold text-slate-400 uppercase tracking-widest">#{cat.categoryID}</td>
                            <td className="px-10 py-6 font-bold text-slate-500 text-xs">{new Date(cat.createdAt).toLocaleDateString()}</td>
                            <td className="px-10 py-6 text-right">
                               <div className="flex items-center justify-end gap-2">
                                  <button onClick={() => { setEditingCategory(cat); setCategoryName(cat.categoryName); setShowCategoryModal(true); }} className="p-3 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"><Edit2 size={18}/></button>
                                  <ActionButton onClick={() => adminService.deleteCategory(cat.categoryID).then(refreshData)} icon={<Trash2 size={18}/>} color="rose" title="Delete Category" />
                               </div>
                            </td>
                         </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </div>
        )}
      </main>

      {/* Category Modal */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-6">
           <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-3xl p-10 animate-in zoom-in-95 duration-200">
              <h3 className="text-2xl font-black text-slate-900 mb-2">{editingCategory ? 'Update Category' : 'New Category'}</h3>
              <p className="text-slate-400 font-medium text-sm mb-8">Change or add a marketplace category.</p>
              
              <form onSubmit={handleCategorySubmit} className="space-y-6">
                 <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category Name</label>
                    <input 
                       required 
                       type="text" 
                       className="w-full mt-2 px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-100 transition-all font-bold" 
                       placeholder="e.g. Car Parts"
                       value={categoryName}
                       onChange={e => setCategoryName(e.target.value)}
                    />
                 </div>
                 <div className="flex items-center gap-4 pt-4">
                    <button type="button" onClick={() => setShowCategoryModal(false)} className="flex-1 py-4 font-black text-slate-500 hover:bg-slate-50 rounded-2xl transition-all">Cancel</button>
                    <button type="submit" className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all">Save</button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

// UI Sub-components
const NavItem: React.FC<{ active: boolean, onClick: () => void, icon: React.ReactNode, label: string }> = ({ active, onClick, icon, label }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-sm transition-all ${
      active ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-500/20' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800/50'
    }`}
  >
    {icon} {label}
  </button>
);

const SummaryCard: React.FC<{ label: string, value: string | number, sub: string, color: string, icon: React.ReactNode, pulse?: boolean }> = ({ label, value, sub, color, icon, pulse }) => {
  const colors: Record<string, string> = {
    blue: 'bg-blue-600 shadow-blue-100',
    indigo: 'bg-indigo-600 shadow-indigo-100',
    amber: 'bg-amber-500 shadow-amber-100',
    emerald: 'bg-emerald-500 shadow-emerald-100'
  };
  return (
    <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl shadow-slate-200/50 flex items-center gap-6 relative overflow-hidden group hover:translate-y-[-4px] transition-all">
       <div className={`${colors[color]} p-5 rounded-2xl text-white shadow-2xl ${pulse ? 'animate-pulse' : ''} transition-transform group-hover:scale-110`}>
          {icon}
       </div>
       <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
          <p className="text-3xl font-black text-slate-900 mt-1">{value.toLocaleString()}</p>
          <p className={`text-[10px] font-black mt-1 ${color === 'amber' ? 'text-amber-600' : 'text-emerald-500'}`}>{sub}</p>
       </div>
    </div>
  );
};

const HealthBar: React.FC<{ label: string, value: number, total: number, color: string }> = ({ label, value, total, color }) => (
  <div className="space-y-3">
     <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest">
        <span className="text-slate-500">{label}</span>
        <span className="text-white">{Math.round((value/total)*100)}%</span>
     </div>
     <div className="h-2 bg-white/5 rounded-full overflow-hidden">
        <div className={`${color} h-full rounded-full transition-all duration-1000`} style={{ width: `${(value/total)*100}%` }}></div>
     </div>
  </div>
);

const Badge: React.FC<{ status: 'success' | 'danger' | 'warning' | 'neutral', children: React.ReactNode }> = ({ status, children }) => {
  const styles = {
    success: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    danger: 'bg-rose-100 text-rose-700 border-rose-200',
    warning: 'bg-amber-100 text-amber-700 border-amber-200',
    neutral: 'bg-slate-100 text-slate-600 border-slate-200'
  };
  return <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${styles[status]}`}>{children}</span>;
};

const ActionButton: React.FC<{ onClick: () => void, icon: React.ReactNode, color: string, title?: string }> = ({ onClick, icon, color, title }) => {
  const colors: Record<string, string> = {
    rose: 'text-rose-400 hover:text-rose-600 hover:bg-rose-50',
    emerald: 'text-emerald-400 hover:text-emerald-600 hover:bg-emerald-50',
    slate: 'text-slate-400 hover:text-slate-900 hover:bg-slate-50',
    indigo: 'text-indigo-400 hover:text-indigo-600 hover:bg-indigo-50'
  };
  return <button onClick={onClick} className={`p-2.5 rounded-xl transition-all ${colors[color]}`} title={title}>{icon}</button>;
};

export default Dashboard;
