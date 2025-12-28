
import React, { useEffect, useState } from 'react';
import { ArrowRight, Zap, Sparkles, Smartphone, Car, Home as HomeIcon, Shirt, Coffee, Cpu, Globe, MapPin, Package } from 'lucide-react';
import { categoryService } from '../../services/categoryService';
import { postService } from '../../services/postService';
import { Category, PostDetails } from '../../types/api';
import Loader from '../../components/UI/Loader';
import ErrorState from '../../components/UI/ErrorState';
import { useAuth } from '../../context/AuthContext';
import { BACKEND_URL } from '../../services/api';

const Home: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [latestPosts, setLatestPosts] = useState<PostDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, user } = useAuth();

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

  const getAbsoluteImageUrl = (url: string | null | undefined) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    const normalizedPath = url.startsWith('/') ? url : `/${url}`;
    return `${BACKEND_URL}${normalizedPath}`;
  };

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
      <section className="relative overflow-hidden pt-24 pb-32 sm:pt-40 lg:pb-48">
        <div className="absolute inset-0 z-0">
           <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-50 rounded-full blur-[150px] -translate-y-1/2 translate-x-1/3 opacity-50"></div>
           <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-50 rounded-full blur-[120px] translate-y-1/3 -translate-x-1/4 opacity-50"></div>
        </div>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="lg:grid lg:grid-cols-12 lg:gap-24 items-center">
            <div className="sm:text-center lg:text-left lg:col-span-7">
              <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.3em] mb-10 shadow-2xl">
                <Globe size={14} className="text-indigo-400" /> Jordan's Professional Marketplace
              </div>
              <h1 className="text-6xl font-black tracking-tight text-slate-900 sm:text-8xl leading-[0.95] mb-10">
                {isAuthenticated ? (
                  <>
                    <span className="block text-indigo-600 mb-2">Hello, {user?.firstName}</span>
                    <span className="text-slate-900">Your marketplace is ready.</span>
                  </>
                ) : (
                  <>The Professional <span className="text-indigo-600">C2C Platform</span> for Quality Assets.</>
                )}
              </h1>
              <p className="text-xl text-slate-500 leading-relaxed max-w-2xl font-medium mb-12">
                Buy and sell with confidence. Join a community of verified traders in Jordan using our secure peer-to-peer exchange.
              </p>
              <div className="flex flex-wrap gap-6 sm:justify-center lg:justify-start">
                <a href="#/browse" className="px-12 py-5 rounded-[2rem] bg-indigo-600 text-white font-black text-lg hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-200 hover:-translate-y-1 active:scale-95">
                  Explore Now
                </a>
                {isAuthenticated ? (
                  <a href="#/create-post" className="px-12 py-5 rounded-[2rem] bg-white border-2 border-slate-100 text-slate-900 font-black text-lg hover:bg-slate-50 transition-all hover:-translate-y-1 flex items-center gap-3">
                    <Zap size={20} className="text-amber-500" /> Post an Item
                  </a>
                ) : (
                  <a href="#/register" className="px-12 py-5 rounded-[2rem] bg-slate-900 text-white font-black text-lg hover:bg-black transition-all hover:-translate-y-1">
                    Join Community
                  </a>
                )}
              </div>
            </div>
            <div className="hidden lg:block lg:col-span-5 relative">
              <div className="relative group">
                <div className="absolute inset-0 bg-indigo-600 rounded-[4rem] blur-[60px] opacity-20 group-hover:opacity-40 transition-opacity duration-1000"></div>
                <div className="relative aspect-[4/5] rounded-[3.5rem] overflow-hidden shadow-2xl rotate-2 border-[12px] border-white transition-all duration-700 group-hover:rotate-0 group-hover:scale-105">
                  <img className="w-full h-full object-cover" src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&q=80" alt="Professional Workspace" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div className="space-y-2">
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">Browse by Category</h2>
            <p className="text-slate-400 font-bold uppercase tracking-[0.2em] text-xs">Standardized Classifications</p>
          </div>
          <div className="h-[2px] flex-1 bg-slate-100 rounded-full mx-10 hidden md:block"></div>
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

      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 bg-slate-50/50 skew-y-3 translate-y-20 z-0"></div>
        <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
          <div className="flex flex-col md:flex-row items-end justify-between gap-8 mb-20">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-50 text-amber-600 text-[10px] font-black uppercase tracking-widest mb-4">
                 <Sparkles size={14} /> Newest Listings
              </div>
              <h2 className="text-5xl font-black text-slate-900 tracking-tight">Recent Marketplace Activity</h2>
              <p className="text-slate-500 font-medium mt-3 text-lg">See what's being traded right now.</p>
            </div>
            <a href="#/browse" className="group flex items-center gap-4 bg-white px-8 py-4 rounded-2xl text-sm font-black text-indigo-600 shadow-xl border border-slate-100 hover:bg-indigo-600 hover:text-white transition-all">
              View All <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
            </a>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {latestPosts.filter(post => !post.isDeleted).length === 0 ? (
              <div className="col-span-full flex flex-col items-center justify-center py-20 text-center">
                <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                  <Package size={48} className="text-slate-300" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">No Listings Yet</h3>
                <p className="text-gray-500 max-w-md mb-6">
                  Be the first to list an item on the marketplace!
                </p>
                {isAuthenticated && (
                  <a 
                    href="#/create-post" 
                    className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition"
                  >
                    Create Your First Listing
                  </a>
                )}
              </div>
            ) : (
              latestPosts.filter(post => !post.isDeleted).map((post) => {
              const postRawImage = post.primaryImageUrl || (post.images && post.images.length > 0 ? post.images[0].postImageURL : null);
              const postImage = getAbsoluteImageUrl(postRawImage);
              return (
                <a key={post.postID} href={`#/post/${post.postID}`} className="bg-white rounded-[3rem] overflow-hidden group border-2 border-white shadow-lg hover:shadow-[0_35px_60px_-15px_rgba(0,0,0,0.1)] transition-all duration-500 hover:-translate-y-4 flex flex-col">
                  <div className="relative h-72 overflow-hidden bg-slate-50">
                    {postImage ? (
                      <img src={postImage} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt={post.postTitle} />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-300">
                        <Package size={64} className="mb-2 opacity-40 group-hover:scale-110 transition-transform" />
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-60">No Media</span>
                      </div>
                    )}
                    <div className="absolute top-6 left-6 bg-white/95 backdrop-blur-xl px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 shadow-2xl">
                      {post.categoryName}
                    </div>
                  </div>
                  <div className="p-8 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-xl font-black text-slate-900 leading-snug group-hover:text-indigo-600 transition-colors line-clamp-2">{post.postTitle}</h3>
                      <div className="mt-4 flex items-center gap-2">
                         <MapPin size={14} className="text-indigo-400" />
                         <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Amman, Jordan</span>
                      </div>
                    </div>
                    <div className="mt-8 pt-8 border-t border-slate-50 flex items-center justify-between">
                      <div>
                         <p className="text-3xl font-black text-slate-900 tracking-tighter">{post.price.toLocaleString()} JD</p>
                      </div>
                      <div className="w-14 h-14 rounded-3xl bg-indigo-50 flex items-center justify-center text-indigo-600 opacity-0 group-hover:opacity-100 transition-all translate-x-10 group-hover:translate-x-0 shadow-lg shadow-indigo-100">
                         <ArrowRight size={28} />
                      </div>
                    </div>
                  </div>
                </a>
              );
            })
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
