
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { postService } from '../../services/postService';
import { adminService } from '../../services/adminService';
import { PostDetails as PostDetailsType, PostStatus } from '../../types/api';
import { ShieldAlert, Phone, Lock, Package, CheckCircle, AlertTriangle, ShieldCheck as VerifiedIcon } from 'lucide-react';
import Loader from '../../components/UI/Loader';
import { useAuth } from '../../context/AuthContext';
import { BACKEND_URL } from '../../services/api';

const PostDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<PostDetailsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPhone, setShowPhone] = useState(false);
  const { isAdmin } = useAuth();

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        if (id) {
          const data = await postService.getPostById(parseInt(id));
          setPost(data);
        }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchDetails();
  }, [id]);

  const getAbsoluteImageUrl = (url: string | null | undefined) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    const normalizedPath = url.startsWith('/') ? url : `/${url}`;
    return `${BACKEND_URL}${normalizedPath}`;
  };

  const formatPhone = (p?: string) => {
    if (!p) return "07X XXX XXXX";
    const c = p.replace(/\D/g, '');
    if (c.length === 12 && c.startsWith('962')) return `0${c.substring(3,5)} ${c.substring(5,8)} ${c.substring(8)}`;
    return p;
  };

  const handleModeration = async (status: PostStatus) => {
    if (!post) return;
    try {
      await adminService.updatePostStatus(post.postID, status, "Admin Review Protocol");
      const updated = await postService.getPostById(post.postID);
      setPost(updated);
      alert(`Asset state changed to ${PostStatus[status]}`);
    } catch (err) { alert("Moderation failed."); }
  };

  if (loading) return <Loader fullScreen />;
  if (!post) return <div className="text-center py-40 font-black text-slate-300 text-4xl">ASSET_NOT_FOUND</div>;

  const mainImage = getAbsoluteImageUrl(post.primaryImageUrl || post.images?.[0]?.postImageURL);

  return (
    <div className="bg-white min-h-screen pb-32">
      {/* Refined Admin HUD */}
      {isAdmin && (
        <div className="bg-slate-900 border-b-4 border-indigo-600 py-6 sticky top-[80px] z-40 shadow-2xl">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
             <div className="flex items-center gap-6">
                <div className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-xl animate-pulse">
                  <ShieldAlert size={28} />
                </div>
                <div>
                  <h4 className="text-white font-black text-xl tracking-tighter uppercase leading-none">Admin Worksurface</h4>
                  <p className="text-indigo-400 text-[9px] font-black uppercase tracking-[0.4em] mt-2">Listing State: {PostStatus[post.status]}</p>
                </div>
             </div>
             <div className="flex items-center gap-3">
                <button onClick={() => handleModeration(PostStatus.Active)} className="px-8 py-3 bg-emerald-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-emerald-600 active:scale-95 transition-all">Approve</button>
                <button onClick={() => handleModeration(PostStatus.Rejected)} className="px-8 py-3 bg-amber-500 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-amber-600 active:scale-95 transition-all">Reject</button>
                <div className="w-px h-8 bg-white/10 mx-2"></div>
                <button onClick={() => adminService.deletePost(post.postID).then(() => navigate('/browse'))} className="px-8 py-3 bg-rose-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-rose-700 active:scale-95 transition-all">Purge</button>
             </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-20">
        <div className="grid lg:grid-cols-12 lg:gap-20 items-start">
          
          {/* Visual Display */}
          <div className="lg:col-span-7 space-y-16">
            <div className="bg-slate-50 rounded-[4rem] overflow-hidden shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] aspect-[4/3] border-[14px] border-white group relative">
              {mainImage ? (
                <img src={mainImage} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-[2s]" alt={post.postTitle} />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-300">
                  <Package size={120} className="opacity-40" />
                  <span className="text-[10px] font-black uppercase tracking-widest mt-4">Unrendered Asset</span>
                </div>
              )}
            </div>

            <div className="bg-white rounded-[4rem] p-16 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.03)] border border-slate-50 relative">
              <div className="flex items-center gap-3 mb-10">
                 <VerifiedIcon size={24} className="text-indigo-600" />
                 <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.4em]">Asset Intelligence Report</h2>
              </div>
              <div className="bg-slate-50/70 p-12 rounded-[3rem] border border-slate-100/50">
                <p className="text-slate-600 leading-[1.8] font-bold text-2xl italic">"{post.postDescription}"</p>
              </div>
            </div>
          </div>

          {/* Asset Pricing & Action Column */}
          <div className="lg:col-span-5 space-y-12 lg:sticky lg:top-40">
            <div className="bg-white rounded-[4.5rem] p-16 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.08)] border border-slate-50 space-y-12">
              <div className="space-y-4">
                <span className="bg-indigo-600 text-white px-8 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.4em] shadow-xl shadow-indigo-100">
                  {post.categoryName}
                </span>
                <h1 className="text-7xl font-black text-slate-900 tracking-tighter leading-[0.95]">
                  {post.postTitle}
                </h1>
              </div>

              {/* Pricing Block - Unified Alignment */}
              <div className="bg-slate-900 p-12 rounded-[3.5rem] shadow-2xl flex items-center justify-between border-b-8 border-indigo-600 group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                <div className="relative z-10">
                   <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.5em] mb-3">Market Value</p>
                   <div className="flex items-end gap-3">
                      <span className="text-7xl font-black text-white tracking-tighter leading-none">{post.price.toLocaleString()}</span>
                      <span className="text-indigo-500 text-3xl font-black mb-1">JD</span>
                   </div>
                </div>
                <div className="w-px h-16 bg-white/10 mx-6"></div>
                <div className="relative z-10 text-right">
                   <p className="text-white/20 text-[10px] font-black uppercase tracking-widest mb-1">Protocol</p>
                   <p className="text-indigo-400 text-[11px] font-black uppercase tracking-widest leading-tight">Authentic<br/>Market<br/>Asset</p>
                </div>
              </div>

              {/* Security Access Button */}
              <div className="space-y-8">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.6em] text-center">Private Secure Communication Channel</p>
                <button 
                  onClick={() => setShowPhone(!showPhone)} 
                  className={`w-full py-10 rounded-[4rem] flex flex-col items-center justify-center transition-all shadow-[0_30px_60px_-15px_rgba(0,0,0,0.1)] active:scale-95 ${showPhone ? 'bg-[#25D366] text-white' : 'bg-slate-50 text-slate-900 hover:bg-slate-100'}`}
                >
                  {!showPhone ? (
                    <div className="flex items-center gap-6 font-black text-3xl tracking-tight">
                      <Lock size={32} className="text-slate-400" /> Access Seller Line
                    </div>
                  ) : (
                    <div className="animate-in zoom-in-95 text-center">
                       <div className="flex items-center gap-5 text-5xl font-black tracking-tighter">
                         <Phone size={40} className="fill-white"/> 
                         {formatPhone(post.ownerPhone)}
                       </div>
                       <p className="mt-4 text-[10px] uppercase tracking-widest font-black opacity-80 bg-black/10 px-6 py-2 rounded-full">Initiate Direct WhatsApp Protocol</p>
                    </div>
                  )}
                </button>
              </div>
            </div>

            {/* Merchant Identity Card */}
            <div className="bg-white rounded-[4rem] p-12 shadow-xl border border-slate-50 flex items-center gap-10">
              <div className="w-28 h-28 rounded-[3.5rem] bg-indigo-600 text-white flex items-center justify-center font-black text-5xl shadow-2xl">
                {post.ownerFirstName[0]}
              </div>
              <div>
                <div className="flex items-center gap-4 text-3xl font-black text-slate-900 tracking-tighter">
                  {post.ownerFullName}
                  <VerifiedIcon size={32} className="text-indigo-500" />
                </div>
                <p className="text-[11px] font-black text-indigo-500 uppercase tracking-widest mt-1.5 opacity-80">Certified Global Merchant</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PostDetails;
