
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { postService } from '../../services/postService';
import { adminService } from '../../services/adminService';
import { PostDetails as PostDetailsType, PostStatus } from '../../types/api';
import { ShieldAlert, Phone, Package, ShieldCheck as VerifiedIcon, Star, MessageSquare, Send, ArrowLeft, PenLine, Trash2 } from 'lucide-react';
import Loader from '../../components/UI/Loader';
import { useAuth } from '../../context/AuthContext';
import { BACKEND_URL } from '../../services/api';

const PostDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAdmin, isAuthenticated } = useAuth();

  const [post, setPost] = useState<PostDetailsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [showPhone, setShowPhone] = useState(false);
  
  // Review form states
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(5);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  const fetchDetails = async () => {
    try {
      if (id) {
        const data = await postService.getPostById(parseInt(id));
        setPost(data);
      }
    } catch (err) { 
      console.error("Failed to load post details", err); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const getAbsoluteImageUrl = (url: string | null | undefined) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    const normalizedPath = url.startsWith('/') ? url : `/${url}`;
    return `${BACKEND_URL}${normalizedPath}`;
  };

  const formatPhone = (p?: string | null) => {
    if (!p) return "07X XXX XXXX";
    // Stripping all but digits
    const c = p.replace(/\D/g, '');
    // Handle Jordanian Format: 962791234567 -> 079 123 4567
    if (c.length >= 9 && (c.startsWith('962') || c.startsWith('0'))) {
       let clean = c.startsWith('962') ? '0' + c.substring(3) : c;
       return `${clean.substring(0,3)} ${clean.substring(3,6)} ${clean.substring(6)}`;
    }
    return p;
  };

  const handleWhatsApp = () => {
    if (!post?.ownerPrimaryPhone && !post?.whatsAppLink) {
      alert("This seller has not provided a valid WhatsApp connection.");
      return;
    }

    // Use backend link if available, otherwise generate a fresh one
    if (post.whatsAppLink) {
      window.open(post.whatsAppLink, '_blank');
      return;
    }

    const cleanPhone = post.ownerPrimaryPhone!.replace(/\D/g, '');
    const message = encodeURIComponent(`Hi ${post.ownerFirstName}! I am interested in your listing: "${post.postTitle}" on TijarahJo.`);
    window.open(`https://wa.me/${cleanPhone}?text=${message}`, '_blank');
  };

  const handleModeration = async (status: PostStatus) => {
    if (!post) return;
    try {
      await adminService.updatePostStatus(post.postID, status, "Admin Manual Override");
      await fetchDetails();
      alert(`Asset state changed to ${PostStatus[status]}`);
    } catch (err) { 
      alert("Moderation update failed."); 
    }
  };

  const handleOwnerDelete = async () => {
    if (!post) return;
    const confirmed = window.confirm(`Are you sure you want to delete "${post.postTitle}"? This action cannot be undone.`);
    if (!confirmed) return;
    
    setDeleting(true);
    try {
      await postService.deletePost(post.postID);
      alert("Your listing has been deleted.");
      navigate('/my-posts');
    } catch (err) {
      // Check if deleted despite error
      try {
        await postService.getPostById(post.postID);
        alert("Failed to delete the listing. Please try again.");
      } catch (verifyErr: any) {
        // Post not found means it was deleted
        if (verifyErr.response?.status === 404) {
          alert("Your listing has been deleted.");
          navigate('/my-posts');
          return;
        }
        alert("Failed to delete the listing. Please try again.");
      }
    } finally {
      setDeleting(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!post || !user) return;
    if (!reviewText.trim()) {
      alert("Please enter a review description.");
      return;
    }

    setSubmittingReview(true);
    try {
      await postService.createReview(post.postID, {
        userID: user.userID,
        rating,
        reviewText: reviewText.trim()
      });
      await fetchDetails();
      setReviewText('');
      setRating(5);
      alert("Thank you! Your review has been added to the public record.");
    } catch (err) {
      alert("Failed to submit review. You might have already reviewed this item.");
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <Loader fullScreen />;
  if (!post) return <div className="text-center py-40 font-black text-slate-300 text-4xl">ASSET_NOT_FOUND</div>;

  const allImages = post.images?.filter(img => !img.isDeleted) || [];
  const currentImage = allImages.length > 0 
    ? getAbsoluteImageUrl(allImages[selectedImageIndex]?.postImageURL)
    : getAbsoluteImageUrl(post.primaryImageUrl);

  return (
    <div className="bg-white min-h-screen pb-32">
      {/* Admin HUD */}
      {isAdmin && (
        <div className="bg-slate-900 border-b-4 border-indigo-600 py-6 sticky top-[80px] z-40 shadow-2xl">
          <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
             <div className="flex items-center gap-6">
                <div className="w-14 h-14 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-xl animate-pulse">
                  <ShieldAlert size={28} />
                </div>
                <div>
                  <h4 className="text-white font-black text-xl tracking-tighter uppercase leading-none">Moderation Protocol</h4>
                  <p className="text-indigo-400 text-[9px] font-black uppercase tracking-[0.4em] mt-2">State: {PostStatus[post.status]}</p>
                </div>
             </div>
             <div className="flex items-center gap-3">
                <button onClick={() => adminService.deletePost(post.postID).then(() => navigate('/browse'))} className="px-8 py-3 bg-rose-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-rose-700 transition-all">Delete Post</button>
             </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-10">
        <button onClick={() => navigate(-1)} className="mb-10 flex items-center gap-2 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-indigo-600 transition-colors">
          <ArrowLeft size={16} /> Back to Marketplace
        </button>

        <div className="grid lg:grid-cols-12 lg:gap-20 items-start">
          
          {/* Visual Display */}
          <div className="lg:col-span-7 space-y-16">
            {/* Main Image */}
            <div className="bg-slate-50 rounded-[4rem] overflow-hidden shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)] aspect-[4/3] border-[14px] border-white group relative">
              {currentImage ? (
                <img src={currentImage} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-[2s]" alt={post.postTitle} />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-300">
                  <Package size={120} className="opacity-40" />
                </div>
              )}
            </div>

            {/* Image Thumbnails Gallery */}
            {allImages.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-4 px-2">
                {allImages.map((img, index) => (
                  <button
                    key={img.postImageID}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`shrink-0 w-24 h-24 rounded-2xl overflow-hidden border-4 transition-all ${
                      selectedImageIndex === index 
                        ? 'border-indigo-600 ring-4 ring-indigo-100 scale-105' 
                        : 'border-white hover:border-indigo-300'
                    }`}
                  >
                    <img 
                      src={getAbsoluteImageUrl(img.postImageURL)!} 
                      alt={`${post.postTitle} - ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Content & Description */}
            <div className="bg-white rounded-[4rem] p-12 sm:p-16 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.03)] border border-slate-50 relative">
              <div className="flex items-center gap-3 mb-10">
                 <VerifiedIcon size={24} className="text-indigo-600" />
                 <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.4em]">Item Description</h2>
              </div>
              <div className="bg-slate-50/70 p-10 rounded-[3rem] border border-slate-100/50">
                <p className="text-slate-700 leading-relaxed font-bold text-2xl whitespace-pre-wrap">{post.postDescription}</p>
              </div>
            </div>

            {/* Reviews Section */}
            <div id="reviews" className="bg-white rounded-[4rem] p-12 sm:p-16 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.03)] border border-slate-50 space-y-12">
               <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                     <MessageSquare size={24} className="text-indigo-600" />
                     <h2 className="text-2xl font-black text-slate-900 tracking-tight">Verified Feedback</h2>
                  </div>
                  <div className="flex items-center gap-2 px-6 py-2 bg-slate-50 rounded-full border border-slate-100">
                     <Star size={18} className="text-amber-500 fill-amber-500" />
                     <span className="text-xl font-black text-slate-900">{post.averageRating?.toFixed(1) || "0.0"}</span>
                     <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">({post.reviewCount} reviews)</span>
                  </div>
               </div>

               {/* Add Review Form */}
               {isAuthenticated && (
                 <form onSubmit={handleSubmitReview} className="bg-slate-50/50 p-10 rounded-[3rem] border border-slate-100 space-y-6">
                    <div className="flex items-center gap-6">
                       <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Your Experience:</p>
                       <div className="flex gap-2">
                          {[1,2,3,4,5].map(star => (
                            <button 
                              key={star} 
                              type="button"
                              onClick={() => setRating(star)}
                              className={`transition-all ${rating >= star ? 'text-amber-500 scale-110' : 'text-slate-200 hover:text-amber-200'}`}
                            >
                               <Star size={24} fill={rating >= star ? 'currentColor' : 'none'} />
                            </button>
                          ))}
                       </div>
                    </div>
                    <div className="relative">
                       <textarea 
                         required
                         rows={3}
                         placeholder="How was the item? Was the seller professional?"
                         className="w-full px-8 py-6 rounded-[2rem] bg-white border border-slate-200 focus:border-indigo-600 focus:ring-4 focus:ring-indigo-50 outline-none font-bold text-slate-700 transition-all shadow-inner"
                         value={reviewText}
                         onChange={e => setReviewText(e.target.value)}
                       />
                       <button 
                         type="submit" 
                         disabled={submittingReview}
                         className="absolute bottom-4 right-4 bg-indigo-600 text-white p-4 rounded-2xl shadow-xl hover:bg-indigo-700 transition-all disabled:opacity-50"
                       >
                          {submittingReview ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Send size={20} />}
                       </button>
                    </div>
                 </form>
               )}

               {/* Reviews List */}
               <div className="space-y-8">
                  {post.reviews && post.reviews.length > 0 ? post.reviews.map(review => (
                    <div key={review.reviewID} className="flex gap-6 items-start animate-in slide-in-from-bottom-4">
                       <div className="w-16 h-16 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-2xl shrink-0 border border-indigo-100 shadow-sm">
                          {review.reviewerFullName?.[0] || 'U'}
                       </div>
                       <div className="flex-1 bg-slate-50/30 p-8 rounded-[2.5rem] border border-slate-50">
                          <div className="flex justify-between items-center mb-4">
                             <h4 className="font-black text-slate-900 tracking-tight text-lg">{review.reviewerFullName || 'Anonymous User'}</h4>
                             <div className="flex gap-1 text-amber-500">
                                {[...Array(5)].map((_, i) => <Star key={i} size={14} fill={i < review.rating ? "currentColor" : "none"} className={i < review.rating ? "" : "text-slate-200"} />)}
                             </div>
                          </div>
                          <p className="text-slate-600 font-medium leading-relaxed">{review.reviewText}</p>
                          <div className="mt-4 pt-4 border-t border-slate-100/50">
                             <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{new Date(review.createdAt).toLocaleDateString('en-JO', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                          </div>
                       </div>
                    </div>
                  )) : (
                    <div className="text-center py-20 bg-slate-50/50 rounded-[3rem] border border-dashed border-slate-200">
                       <MessageSquare size={48} className="mx-auto mb-4 text-slate-200" />
                       <p className="font-black text-[10px] uppercase tracking-widest text-slate-400">Be the first to review this listing</p>
                    </div>
                  )}
               </div>
            </div>
          </div>

          {/* Pricing & Contact Column */}
          <div className="lg:col-span-5 space-y-12 lg:sticky lg:top-40">
            <div className="bg-white rounded-[4.5rem] p-12 sm:p-16 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.08)] border border-slate-50 space-y-12">
              <div className="space-y-4">
                <span className="bg-indigo-600 text-white px-8 py-2.5 rounded-full text-[10px] font-black uppercase tracking-[0.4em] shadow-xl shadow-indigo-100">
                  {post.categoryName}
                </span>
                <h1 className="text-6xl sm:text-7xl font-black text-slate-900 tracking-tighter leading-[0.95]">
                  {post.postTitle}
                </h1>
              </div>

              {/* Pricing Block */}
              <div className="bg-slate-900 p-10 sm:p-12 rounded-[3.5rem] shadow-2xl flex items-center justify-between border-b-8 border-indigo-600 group relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-indigo-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
                <div className="relative z-10">
                   <p className="text-indigo-400 text-[10px] font-black uppercase tracking-[0.5em] mb-3">Market Value</p>
                   <div className="flex items-end gap-3">
                      <span className="text-6xl sm:text-7xl font-black text-white tracking-tighter leading-none">{post.price.toLocaleString()}</span>
                      <span className="text-indigo-500 text-3xl font-black mb-1">JD</span>
                   </div>
                </div>
                <div className="w-px h-16 bg-white/10 mx-6"></div>
                <div className="relative z-10 text-right">
                   <p className="text-white/20 text-[10px] font-black uppercase tracking-widest mb-1">Status</p>
                   <p className="text-indigo-400 text-[11px] font-black uppercase tracking-widest leading-tight">Verified<br/>Quality<br/>Asset</p>
                </div>
              </div>

              {/* Contact Actions */}
              <div className="space-y-6">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.6em] text-center">Contact Protocol</p>
                
                {/* Phone reveal button */}
                <button 
                  onClick={() => setShowPhone(!showPhone)} 
                  className={`w-full py-8 rounded-[3rem] flex items-center justify-center transition-all shadow-xl active:scale-95 border-2 ${showPhone ? 'bg-indigo-50 border-indigo-200 text-indigo-900' : 'bg-slate-50 border-transparent text-slate-900 hover:bg-slate-100'}`}
                >
                  <Phone size={24} className={`mr-4 ${showPhone ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span className="font-black text-xl tracking-tight">
                    {showPhone ? formatPhone(post.ownerPrimaryPhone) : "View Seller Phone"}
                  </span>
                </button>

                {/* WhatsApp Direct */}
                <button 
                  onClick={handleWhatsApp} 
                  className="w-full py-8 bg-[#25D366] text-white rounded-[3rem] flex flex-col items-center justify-center transition-all shadow-2xl shadow-[#25D366]/30 hover:brightness-110 active:scale-95 group"
                >
                   <div className="flex items-center gap-4 font-black text-2xl tracking-tighter">
                      <MessageSquare size={28} className="fill-white group-hover:scale-110 transition-transform"/> 
                      Chat on WhatsApp
                   </div>
                   <p className="mt-2 text-[9px] uppercase tracking-widest font-black opacity-80">Immediate Buyer Handshake</p>
                </button>

                {!post.hasOwnerPhone && !post.whatsAppLink && (
                  <div className="bg-amber-50 border border-amber-100 p-6 rounded-3xl">
                     <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest flex items-center gap-2">
                        <ShieldAlert size={14}/> Seller has no linked phone number
                     </p>
                  </div>
                )}
              </div>
            </div>

            {/* Edit/Delete Post Buttons - Only for Owner */}
            {isAuthenticated && user?.userID === post.ownerUserID && (
              <div className="flex gap-4">
                <button
                  onClick={() => navigate(`/edit-post/${post.postID}`)}
                  className="flex-1 py-6 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-[3rem] flex items-center justify-center gap-4 transition-all shadow-2xl shadow-orange-200 hover:shadow-orange-300 hover:brightness-110 active:scale-[0.98] group"
                >
                  <PenLine size={24} className="group-hover:rotate-12 transition-transform" />
                  <span className="font-black text-xl tracking-tight">Edit Listing</span>
                </button>
                <button
                  onClick={handleOwnerDelete}
                  disabled={deleting}
                  className="py-6 px-8 bg-gradient-to-r from-rose-500 to-red-600 text-white rounded-[3rem] flex items-center justify-center gap-3 transition-all shadow-2xl shadow-rose-200 hover:shadow-rose-300 hover:brightness-110 active:scale-[0.98] group disabled:opacity-50"
                >
                  {deleting ? (
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Trash2 size={24} className="group-hover:scale-110 transition-transform" />
                  )}
                </button>
              </div>
            )}

            {/* Merchant Identity Card */}
            <div className="bg-white rounded-[4rem] p-10 shadow-xl border border-slate-50 flex items-center gap-8 group hover:bg-indigo-50 transition-all">
              <div className="w-24 h-24 rounded-[3rem] bg-indigo-600 text-white flex items-center justify-center font-black text-4xl shadow-2xl shrink-0 group-hover:rotate-3 transition-transform">
                {post.ownerFirstName[0]}
              </div>
              <div className="flex-1 overflow-hidden">
                <div className="flex items-center gap-3 text-2xl font-black text-slate-900 tracking-tighter">
                  <span className="truncate">{post.ownerFullName}</span>
                  <VerifiedIcon size={24} className="text-indigo-500 shrink-0" />
                </div>
                <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mt-1 opacity-80">Jordanian Verified Seller</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default PostDetails;
