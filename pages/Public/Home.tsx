
import React, { useEffect, useState } from 'react';
import { ShoppingCart, ArrowRight, ShieldCheck, Zap, Heart, Sparkles, Smartphone, Car, Home as HomeIcon, Shirt, Coffee, Cpu, Globe, Users, MapPin, Shield } from 'lucide-react';
import { categoryService } from '../../services/categoryService';
import { postService } from '../../services/postService';
import { Category, PostDetails } from '../../types/api';
import Loader from '../../components/UI/Loader';
import ErrorState from '../../components/UI/ErrorState';
import { useAuth } from '../../context/AuthContext';

const Home: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [latestPosts, setLatestPosts] = useState<PostDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, user, profileImage } = useAuth();

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [catData, postData] = await Promise.all([
        categoryService.getAll(),
        postService.getPosts({ rowsPerPage: 8 }) 
      ]);
      setCategories(catData.slice(0, 8));
      setLatestPosts(postData.items);
    } catch (err: any) {
      console.error("Home loading error", err);
      setError(err.message === "Network Error" ? "Marketplace servers are currently unavailable." : "Global catalog failed to initialize.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const getCategoryIcon = (name: string) => {
    const n = name.toLowerCase();
    if (n.includes('elect')) return <Smartphone size={28} />;
    if (n.includes('vehic')) return <Car size={28} />;
    if (n.includes('real')) return <HomeIcon size={28} />;
    if (n.includes('fash')) return <Shirt size={28} />;
    if (n.includes('food')) return <Coffee size={28} />;
    return <Cpu size={28} />;
  };

  const categoryColors = [
    'from-pink-500/10 to-rose-500/10 text-pink-600 border-pink-100',
    'from-blue-500/10 to-indigo-500/10 text-blue-600 border-blue-100',
    'from-emerald-500/10 to-teal-500/10 text-emerald-600 border-emerald-100',
    'from-purple-500/10 to-violet-500/10 text-purple-600 border-purple-100',
    'from-orange-500/10 to-amber-500/10 text-orange-600 border-orange-100',
    'from-cyan-500/10 to-sky-500/10 text-cyan-600 border-cyan-100',
    'from-rose-500/10 to-red-500/10 text-rose-600 border-rose-100',
    'from-amber-500/10 to-yellow-500/10 text-amber-600 border-amber-100'
  ];

  if (loading) return <Loader fullScreen />;
  if (error) return <div className="min-h-screen flex items-center justify-center"><ErrorState message={error} onRetry={fetchData} /></div>;

  return (
    <div className="space-y-32 pb-32 bg-white selection:bg-indigo-100 selection:text-indigo-900">
      {/* Dynamic Hero Section */}
      <section className="relative overflow-hidden pt-24 pb-32 sm:pt-40 lg:pb-48">
        <div className="absolute inset-0 z-0">
           <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-50 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/3 opacity-50"></div>
           <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-50 rounded-full blur-[120px] translate-y-1/3 -translate-x-1/4 opacity-50"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="lg:grid lg:grid-cols-12 lg:gap-24 items-center">
            <div className="sm:text-center lg:text-left lg:col-span-7">
              <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.3em] mb-10 shadow-2xl shadow-indigo-100">
                <Globe size={14} className="text-indigo-400" /> Marketplace Jordan
              </div>
              
              <h1 className="text-6xl font-black tracking-tight text-slate-900 sm:text-8xl leading-[0.95] mb-10">
                {isAuthenticated ? (
                  <>
                    <span className="block text-indigo-600 mb-2">Welcome back, {user?.firstName}</span>
                    <span className="text-slate-900">Find what you need.</span>
                  </>
                ) : (
                  <>Buy and Sell <span className="text-indigo-600">Anything</span> in Jordan.</>
                )}
              </h1>
              
              <p className="text-xl text-slate-500 leading-relaxed max-w-2xl font-medium mb-12">
                Join thousands of buyers and sellers in Jordan's top marketplace. Buy your favorite items or sell what you don't need in just minutes.
              </p>
              
              <div className="flex flex-wrap gap-6 sm:justify-center lg:justify-start">
                <a href="#/browse" className="px-12 py-5 rounded-[2rem] bg-indigo-600 text-white font-black text-lg hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-200 hover:-translate-y-1 active:scale-95">
                  Browse Items
                </a>
                {isAuthenticated ? (
                  <a href="#/create-post" className="px-12 py-5 rounded-[2rem] bg-white border-2 border-slate-100 text-slate-900 font-black text-lg hover:bg-slate-50 transition-all hover:-translate-y-1 flex items-center gap-3">
                    <Zap size={20} className="text-amber-500" /> Sell Your Item
                  </a>
                ) : (
                  <a href="#/register" className="px-12 py-5 rounded-[2rem] bg-slate-900 text-white font-black text-lg hover:bg-black transition-all hover:-translate-y-1">
                    Join TijarahJo
                  </a>
                )}
              </div>
            </div>

            <div className="hidden lg:block lg:col-span-5 relative">
              <div className="relative group">
                <div className="absolute inset-0 bg-indigo-600 rounded-[4rem] blur-[60px] opacity-20 group-hover:opacity-40 transition-opacity duration-1000"></div>
                <div className="relative aspect-[4/5] rounded-[3.5rem] overflow-hidden shadow-2xl rotate-2 border-[12px] border-white transition-all duration-700 group-hover:rotate-0 group-hover:scale-105">
                  <img className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&q=80" alt="Marketplace" />
                </div>
                
                {isAuthenticated && profileImage && (
                  <div className="absolute -top-10 -right-10 bg-white p-4 rounded-[2rem] shadow-2xl border border-slate-100 -rotate-3 animate-bounce-slow">
                     <img src={profileImage} className="w-20 h-20 rounded-2xl object-cover" />
                  </div>
                )}

                <div className="absolute -bottom-12 -left-12 bg-white p-8 rounded-[2.5rem] shadow-2xl border border-slate-100 -rotate-6">
                   <div className="flex items-center gap-5">
                      <div className="bg-indigo-600 text-white p-4 rounded-2xl shadow-xl shadow-indigo-100"><ShieldCheck size={32} /></div>
                      <div>
                         <p className="font-black text-slate-900 text-xl tracking-tight">Safe Deals</p>
                         <p className="text-[10px] text-indigo-500 font-black uppercase tracking-widest mt-1">Verified Community</p>
                      </div>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modern Categories Visualization */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="space-y-2">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">Explore Categories</h2>
            <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-xs">Find what you're looking for</p>
          </div>
          <div className="h-[2px] flex-1 bg-slate-100 rounded-full mx-10 hidden md:block"></div>
          <p className="text-slate-500 font-medium max-w-xs text-right hidden lg:block">The best place to find used and new items in Jordan's largest trade community.</p>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-8">
          {categories.map((cat, i) => (
            <a key={cat.categoryID} href={`#/browse?category=${cat.categoryID}`} className="group block text-center space-y-5">
              <div className={`w-full aspect-square rounded-[2.5rem] flex items-center justify-center transition-all duration-500 group-hover:shadow-2xl group-hover:-translate-y-3 bg-gradient-to-br border-2 border-white shadow-lg ${categoryColors[i % categoryColors.length]}`}>
                <div className="transition-transform duration-500 group-hover:scale-125">
                  {getCategoryIcon(cat.categoryName)}
                </div>
              </div>
              <p className="font-black text-slate-900 text-sm tracking-tight group-hover:text-indigo-600 transition-colors">{cat.categoryName}</p>
            </a>
          ))}
        </div>
      </section>

      {/* Fresh Listings */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 bg-slate-50/50 skew-y-3 translate-y-20 z-0"></div>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row items-end justify-between gap-8 mb-20">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-50 text-amber-600 text-[10px] font-black uppercase tracking-widest mb-4">
                 <Sparkles size={14} /> Newest Items
              </div>
              <h2 className="text-5xl font-black text-slate-900 tracking-tight">Recent Deals</h2>
              <p className="text-slate-500 font-medium mt-3 text-lg">Fresh listings posted by sellers near you.</p>
            </div>
            <a href="#/browse" className="group flex items-center gap-4 bg-white px-8 py-4 rounded-2xl text-sm font-black text-indigo-600 shadow-xl border border-slate-100 hover:bg-indigo-600 hover:text-white transition-all">
              See All Items <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {latestPosts.map((post, i) => (
              <a key={post.postID} href={`#/post/${post.postID}`} className="bg-white rounded-[3rem] overflow-hidden group border-2 border-white shadow-lg hover:shadow-[0_35px_60px_-15px_rgba(0,0,0,0.1)] transition-all duration-500 hover:-translate-y-4 flex flex-col">
                <div className="relative h-72 overflow-hidden">
                  <img src={post.primaryImageUrl || `https://picsum.photos/800/800?random=${post.postID}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt={post.postTitle} />
                  <div className="absolute top-6 left-6 bg-white/95 backdrop-blur-xl px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 shadow-2xl">
                    {post.categoryName}
                  </div>
                  <button className="absolute top-6 right-6 w-12 h-12 rounded-2xl bg-white/90 backdrop-blur-xl flex items-center justify-center text-slate-400 hover:text-rose-500 transition-all shadow-lg active:scale-90">
                    <Heart size={24} />
                  </button>
                </div>
                <div className="p-8 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-black text-slate-900 leading-snug group-hover:text-indigo-600 transition-colors line-clamp-2">{post.postTitle}</h3>
                    <div className="mt-4 flex items-center gap-2">
                       <MapPin size={14} className="text-indigo-400" />
                       <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Amman</span>
                    </div>
                  </div>
                  <div className="mt-8 pt-8 border-t border-slate-50 flex items-center justify-between">
                    <div>
                       <p className="text-3xl font-black text-slate-900 tracking-tighter">${post.price.toLocaleString()}</p>
                    </div>
                    <div className="w-14 h-14 rounded-3xl bg-indigo-50 flex items-center justify-center text-indigo-600 opacity-0 group-hover:opacity-100 transition-all translate-x-10 group-hover:translate-x-0 shadow-lg shadow-indigo-100">
                       <ArrowRight size={28} />
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 mb-20">
         <div className="grid grid-cols-1 md:grid-cols-3 gap-12 bg-slate-900 rounded-[4rem] p-16 sm:p-24 text-white relative overflow-hidden shadow-3xl shadow-slate-200 group">
            <div className="relative z-10 space-y-6">
               <div className="bg-indigo-600/30 w-16 h-16 rounded-2xl flex items-center justify-center text-indigo-400 mb-4 border border-indigo-500/20">
                  <Users size={32} />
               </div>
               <h3 className="text-6xl font-black tracking-tighter">10K+</h3>
               <p className="text-indigo-400 font-black uppercase tracking-[0.3em] text-xs">Happy Sellers</p>
               <p className="text-sm text-slate-400 font-medium leading-relaxed opacity-80">Thousands of people trust TijarahJo to sell their products daily.</p>
            </div>
            <div className="relative z-10 space-y-6">
               <div className="bg-indigo-600/30 w-16 h-16 rounded-2xl flex items-center justify-center text-indigo-400 mb-4 border border-indigo-500/20">
                  <ShoppingCart size={32} />
               </div>
               <h3 className="text-6xl font-black tracking-tighter">50K+</h3>
               <p className="text-indigo-400 font-black uppercase tracking-[0.3em] text-xs">Items Sold</p>
               <p className="text-sm text-slate-400 font-medium leading-relaxed opacity-80">We have successfully connected thousands of buyers and sellers.</p>
            </div>
            <div className="relative z-10 space-y-6">
               <div className="bg-indigo-600/30 w-16 h-16 rounded-2xl flex items-center justify-center text-indigo-400 mb-4 border border-indigo-500/20">
                  <Shield size={32} />
               </div>
               <h3 className="text-6xl font-black tracking-tighter">100%</h3>
               <p className="text-indigo-400 font-black uppercase tracking-[0.3em] text-xs">Trusted Trade</p>
               <p className="text-sm text-slate-400 font-medium leading-relaxed opacity-80">Our team works hard to keep the marketplace safe and clean for everyone.</p>
            </div>
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 blur-[150px] rounded-full group-hover:bg-indigo-500/20 transition-all duration-1000"></div>
         </div>
      </section>
    </div>
  );
};

export default Home;
