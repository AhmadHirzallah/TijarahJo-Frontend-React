
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { postService } from '../../services/postService';
import { adminService } from '../../services/adminService';
import { PostDetails as PostDetailsType, PostStatus, RoleID } from '../../types/api';
import { MapPin, Calendar, User as UserIcon, MessageCircle, Star, ShieldCheck, Share2, Edit3, Trash2, ShieldAlert, Check, X, Activity, MessageSquare } from 'lucide-react';
import Loader from '../../components/UI/Loader';
import { useAuth } from '../../context/AuthContext';

const PostDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<PostDetailsType | null>(null);
  const [loading, setLoading] = useState(true);
  const { user, isAdmin } = useAuth();
  const [newReview, setNewReview] = useState({ rating: 5, text: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        if (id) {
          const data = await postService.getPostById(parseInt(id));
          setPost(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [id]);

  const handleModeration = async (status: PostStatus) => {
    if (!post) return;
    try {
      await adminService.updatePostStatus(post.postID, status, "Admin Review Decision");
      const updated = await postService.getPostById(post.postID);
      setPost(updated);
    } catch (err) {
      alert("Moderation failed");
    }
  };

  const handleWhatsApp = () => {
    if (!post) return;
    const message = encodeURIComponent(`Hello ${post.ownerFirstName}, I saw your item "${post.postTitle}" on TijarahJo and I'm interested!`);
    window.open(`https://wa.me/962790000000?text=${message}`, '_blank');
  };

  const handleDelete = async () => {
    if (!post) return;
    if (window.confirm("Remove this listing?")) {
      try {
        if (isAdmin) {
          await adminService.deletePost(post.postID);
        } else {
          await postService.deletePost(post.postID);
        }
        navigate('/browse');
      } catch (err) {
        alert("Failed to remove listing.");
      }
    }
  };

  const handleAddReview = async () => {
    if (!user || !post) return;
    setSubmittingReview(true);
    try {
      await postService.createReview(post.postID, {
        userID: user.userID,
        rating: newReview.rating,
        reviewText: newReview.text
      });
      const data = await postService.getPostById(post.postID);
      setPost(data);
      setNewReview({ rating: 5, text: '' });
    } catch (err) {
      alert("Failed to post review");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <Loader fullScreen />;
  if (!post) return <div className="text-center py-20 font-bold text-slate-500">Post not found.</div>;

  const canEdit = isAdmin || (user?.userID === post.ownerUserID);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {isAdmin && (
        <div className="mb-10 bg-slate-900 border-4 border-slate-800 rounded-[2.5rem] p-8 flex flex-col md:flex-row items-center justify-between shadow-2xl animate-in slide-in-from-top-4 relative overflow-hidden group">
           <div className="flex items-center gap-6 relative z-10">
              <div className="p-4 bg-indigo-600 text-white rounded-2xl shadow-xl shadow-indigo-500/20">
                <ShieldAlert size={32} />
              </div>
              <div>
                <p className="text-white font-black text-xl tracking-tight uppercase tracking-[0.2em]">Admin Controls</p>
                <p className="text-slate-400 text-xs font-bold mt-1 uppercase tracking-widest">Current Status: <span className="text-indigo-400">{PostStatus[post.status]}</span></p>
              </div>
           </div>
           
           <div className="flex flex-wrap gap-3 mt-6 md:mt-0 relative z-10">
              {post.status !== PostStatus.Active && (
                <button onClick={() => handleModeration(PostStatus.Active)} className="bg-emerald-500 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all flex items-center gap-2">
                  <Check size={18} /> Accept Post
                </button>
              )}
              {post.status !== PostStatus.Rejected && (
                <button onClick={() => handleModeration(PostStatus.Rejected)} className="bg-white/10 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/20 transition-all flex items-center gap-2">
                  <X size={18} /> Refuse Post
                </button>
              )}
              <Link to={`/edit-post/${post.postID}`} className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/10">
                <Edit3 size={18} /> Edit Post
              </Link>
              <button onClick={handleDelete} className="bg-rose-600 text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-rose-700 transition-all flex items-center gap-2">
                <Trash2 size={18} /> Remove
              </button>
           </div>
        </div>
      )}

      <div className="lg:grid lg:grid-cols-12 lg:gap-12 items-start">
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-[4rem] overflow-hidden shadow-2xl aspect-[4/3] border-[10px] border-white group relative">
            <img 
              src={post.primaryImageUrl || `https://picsum.photos/1200/900?random=${post.postID}`} 
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
              alt={post.postTitle} 
            />
          </div>
          {post.images && post.images.length > 1 && (
            <div className="grid grid-cols-4 gap-6">
              {post.images.map((img, idx) => (
                <div key={idx} className="aspect-square rounded-[2rem] overflow-hidden border-4 border-white hover:border-indigo-600 transition-all cursor-pointer shadow-xl">
                   <img src={img.postImageURL} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}

          <div className="bg-white rounded-[3rem] p-12 shadow-xl space-y-12 border border-slate-50">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-black text-slate-900 uppercase tracking-[0.2em]">Item Feedback</h2>
              <div className="flex items-center gap-3 bg-amber-50 px-6 py-3 rounded-3xl text-amber-600 font-black text-2xl border border-amber-100 shadow-sm">
                <Star className="fill-current" size={28} />
                <span>{post.averageRating?.toFixed(1) || '0.0'}</span>
                <span className="text-xs text-amber-400 font-bold ml-1">({post.reviewCount})</span>
              </div>
            </div>

            {user && user.userID !== post.ownerUserID && (
              <div className="bg-slate-50 rounded-[2.5rem] p-10 space-y-8 border border-slate-100 shadow-inner">
                <h3 className="font-black text-slate-800 uppercase tracking-[0.3em] text-[10px] ml-1">Write your review</h3>
                <div className="flex items-center gap-4">
                  {[1,2,3,4,5].map(star => (
                    <button 
                      key={star} 
                      onClick={() => setNewReview(prev => ({ ...prev, rating: star }))}
                      className={`${newReview.rating >= star ? 'text-amber-500' : 'text-slate-200'} hover:scale-125 transition-all drop-shadow-sm`}
                    >
                      <Star className="fill-current" size={40} />
                    </button>
                  ))}
                </div>
                <textarea 
                  value={newReview.text}
                  onChange={(e) => setNewReview(prev => ({ ...prev, text: e.target.value }))}
                  placeholder="Tell others what you think about this item..."
                  className="w-full border-2 border-white bg-white rounded-3xl p-6 focus:ring-8 focus:ring-indigo-50 focus:border-indigo-500 shadow-xl shadow-slate-200/20 outline-none transition-all font-medium text-slate-600"
                  rows={4}
                />
                <button 
                  onClick={handleAddReview}
                  disabled={submittingReview}
                  className="w-full bg-indigo-600 text-white py-5 rounded-3xl font-black text-lg uppercase tracking-widest hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-2xl shadow-indigo-100 active:scale-[0.98]"
                >
                  {submittingReview ? 'Sending...' : 'Post Review'}
                </button>
              </div>
            )}

            <div className="space-y-10 divide-y divide-slate-100">
              {post.reviews?.map(review => (
                <div key={review.reviewID} className="pt-10 first:pt-0 group">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center text-white font-black text-xl shadow-xl border-4 border-white">
                        {(review.reviewerFullName || 'A')[0]}
                      </div>
                      <div>
                         <span className="font-black text-slate-900 text-lg block tracking-tight">{review.reviewerFullName || 'Verified User'}</span>
                         <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                           {new Date(review.createdAt).toLocaleDateString()}
                         </span>
                      </div>
                    </div>
                    <div className="flex text-amber-500 gap-1.5">
                      {[...Array(review.rating)].map((_, i) => <Star key={i} className="fill-current" size={20} />)}
                    </div>
                  </div>
                  <p className="text-slate-600 leading-relaxed font-semibold italic text-lg px-2">"{review.reviewText}"</p>
                </div>
              ))}
              {post.reviews?.length === 0 && (
                <div className="text-center py-20 text-slate-300">
                  <MessageSquare size={72} className="mx-auto mb-6 opacity-10" />
                  <p className="font-black uppercase tracking-[0.4em] text-sm">No reviews yet</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 space-y-8 mt-10 lg:mt-0 sticky top-28">
          <div className="bg-white rounded-[3.5rem] p-10 shadow-2xl space-y-8 border border-slate-50 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="bg-indigo-600 text-white px-6 py-2 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] shadow-xl shadow-indigo-500/10">
                {post.categoryName}
              </span>
              <div className="flex gap-3">
                 <button className="p-4 text-slate-400 hover:text-indigo-600 transition-all bg-slate-50 rounded-2xl border border-slate-100 shadow-sm">
                   <Share2 size={22} />
                 </button>
                 {canEdit && (
                    <Link to={`/edit-post/${post.postID}`} className="p-4 text-slate-400 hover:text-indigo-600 transition-all bg-slate-50 rounded-2xl border border-slate-100 shadow-sm">
                       <Edit3 size={22} />
                    </Link>
                 )}
              </div>
            </div>
            
            <h1 className="text-5xl font-black text-slate-900 leading-[1] tracking-tight">
              {post.postTitle}
            </h1>

            <div className="flex items-center gap-6 bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl">
              <span className="text-6xl font-black text-white tracking-tighter">${post.price.toLocaleString()}</span>
              <div className="h-12 w-[2px] bg-white/10"></div>
              <div className="space-y-1">
                 <span className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.3em] block">Asking Price</span>
                 <span className="text-white/60 text-xs font-bold uppercase tracking-widest">In Jordan</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-8 py-10 border-y border-slate-50">
              <div className="flex items-center gap-5">
                <div className="p-4 bg-indigo-50 rounded-3xl text-indigo-600 shadow-sm border border-indigo-100">
                  <MapPin size={28} />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Location</div>
                  <div className="text-base font-black text-slate-900 mt-1">Amman, JO</div>
                </div>
              </div>
              <div className="flex items-center gap-5">
                <div className="p-4 bg-indigo-50 rounded-3xl text-indigo-600 shadow-sm border border-indigo-100">
                  <Calendar size={28} />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Posted on</div>
                  <div className="text-base font-black text-slate-900 mt-1">{new Date(post.createdAt).toLocaleDateString()}</div>
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <h3 className="font-black text-slate-900 text-[10px] uppercase tracking-[0.4em] ml-2">Description</h3>
              <div className="text-slate-600 leading-relaxed whitespace-pre-wrap font-semibold text-lg bg-slate-50/50 p-8 rounded-[2.5rem] border border-slate-100/50 italic">
                {post.postDescription}
              </div>
            </div>

            <button 
              onClick={handleWhatsApp}
              className="w-full flex items-center justify-center gap-5 py-7 bg-[#25D366] hover:bg-[#1fae54] text-white rounded-[2.5rem] font-black text-2xl transition-all shadow-3xl shadow-green-100 group active:scale-[0.98]"
            >
              <MessageCircle size={32} className="group-hover:rotate-12 transition-transform" /> 
              Message on WhatsApp
            </button>
          </div>

          <div className="bg-white rounded-[3.5rem] p-10 shadow-2xl relative overflow-hidden group border border-slate-50">
             <div className="relative z-10">
               <div className="flex items-center gap-6 mb-10">
                  <div className="w-24 h-24 rounded-[2.5rem] bg-indigo-600 flex items-center justify-center text-white font-black text-4xl shadow-2xl shadow-indigo-500/20 border-4 border-white">
                    {post.ownerFirstName[0]}
                  </div>
                  <div>
                    <div className="font-black text-slate-900 flex items-center gap-2 text-2xl tracking-tight">
                      {post.ownerFullName}
                      <div className="bg-indigo-500 text-white p-1.5 rounded-full shadow-lg">
                        <ShieldCheck size={18} />
                      </div>
                    </div>
                    <div className="text-[10px] text-indigo-500 font-black uppercase tracking-[0.3em] mt-2">Trusted Seller</div>
                  </div>
               </div>
               <button className="w-full mt-10 py-5 bg-slate-900 text-white rounded-3xl font-black text-xs uppercase tracking-[0.3em] hover:bg-black transition-all shadow-2xl shadow-slate-200">
                 View Seller Profile
               </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetails;
