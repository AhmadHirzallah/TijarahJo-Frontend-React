
import React, { useEffect, useState, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { postService } from '../../services/postService';
import { categoryService } from '../../services/categoryService';
import { PostDetails, Category } from '../../types/api';
import Loader from '../../components/UI/Loader';
import ErrorState from '../../components/UI/ErrorState';
import { Search, SlidersHorizontal, Grid, List as ListIcon, MapPin, Package, ArrowRight, Tag } from 'lucide-react';
import { BACKEND_URL } from '../../services/api';

const Browse: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [posts, setPosts] = useState<PostDetails[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const currentCategory = searchParams.get('category');
  const searchQuery = searchParams.get('q') || '';

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [catData, postData] = await Promise.all([
        categoryService.getAll(),
        postService.getPosts({
          categoryID: currentCategory ? parseInt(currentCategory) : undefined,
          rowsPerPage: 12,
          q: searchQuery
        })
      ]);
      setCategories(catData);
      setPosts(postData.items);
      setTotalCount(postData.totalCount);
    } catch (err: any) {
      console.error(err);
      setError(err.message === "Network Error" ? "Connection failed. Please verify the API server is running." : "Failed to load listings.");
    } finally {
      setLoading(false);
    }
  }, [currentCategory, searchQuery]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getAbsoluteImageUrl = (url: string | null | undefined) => {
    if (!url) return null;
    if (url.startsWith('http')) return url;
    const normalizedPath = url.startsWith('/') ? url : `/${url}`;
    return `${BACKEND_URL}${normalizedPath}`;
  };

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 flex justify-center">
        <ErrorState message={error} onRetry={fetchData} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="flex flex-col lg:flex-row gap-10">
        {/* Filter Sidebar */}
        <aside className="w-full lg:w-72 shrink-0 space-y-8">
          <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-slate-100">
            <h3 className="text-xl font-black mb-6 flex items-center gap-3 text-slate-900">
              <SlidersHorizontal size={20} className="text-indigo-600" /> Filters
            </h3>
            <div className="space-y-3">
              <button 
                onClick={() => setSearchParams({})}
                className={`w-full text-left px-5 py-3.5 rounded-2xl text-sm font-bold transition-all ${!currentCategory ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                All Categories
              </button>
              {categories.map(cat => (
                <button 
                  key={cat.categoryID}
                  onClick={() => setSearchParams({ category: cat.categoryID.toString() })}
                  className={`w-full text-left px-5 py-3.5 rounded-2xl text-sm font-bold transition-all ${currentCategory === cat.categoryID.toString() ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                  {cat.categoryName}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Main Feed */}
        <main className="flex-1 space-y-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <h1 className="text-4xl font-black text-slate-900 tracking-tight">
                {currentCategory 
                  ? categories.find(c => c.categoryID.toString() === currentCategory)?.categoryName 
                  : 'Marketplace'} 
              </h1>
              <p className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest">{totalCount} items available in Jordan</p>
            </div>
            
            <div className="flex items-center gap-4 bg-white p-2 rounded-3xl shadow-lg border border-slate-50">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-3 rounded-2xl transition-all ${viewMode === 'grid' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-400 hover:text-indigo-600'}`}
              >
                <Grid size={22} />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`p-3 rounded-2xl transition-all ${viewMode === 'list' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-400 hover:text-indigo-600'}`}
              >
                <ListIcon size={22} />
              </button>
            </div>
          </div>

          {loading ? (
            <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8" : "flex flex-col gap-6"}>
              {/* Skeleton placeholders */}
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-[3rem] overflow-hidden shadow-xl border border-slate-50 animate-pulse">
                  <div className="h-64 bg-slate-100"></div>
                  <div className="p-8 space-y-4">
                    <div className="h-6 bg-slate-100 rounded-xl w-3/4"></div>
                    <div className="h-4 bg-slate-100 rounded-xl w-1/2"></div>
                    <div className="h-8 bg-slate-100 rounded-xl w-1/3 mt-4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8" : "flex flex-col gap-6"}>
              {posts.map(post => {
                const postRawImage = post.primaryImageUrl || (post.images && post.images.length > 0 ? post.images[0].postImageURL : null);
                const cardImage = getAbsoluteImageUrl(postRawImage);
                
                if (viewMode === 'grid') {
                  return (
                    <Link key={post.postID} to={`/post/${post.postID}`} className="group bg-white rounded-[3rem] overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 border border-slate-50 flex flex-col hover:-translate-y-2">
                      <div className="relative h-64 overflow-hidden bg-slate-50">
                        {cardImage ? (
                          <img src={cardImage} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt={post.postTitle} />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-300">
                            <Package size={64} className="opacity-40" />
                          </div>
                        )}
                        <div className="absolute top-6 left-6 bg-white/95 backdrop-blur-xl px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest text-indigo-600 shadow-xl">
                          {post.categoryName}
                        </div>
                      </div>
                      <div className="p-8 flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="text-xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2 leading-tight">{post.postTitle}</h3>
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mt-4 uppercase tracking-widest">
                            <MapPin size={14} className="text-indigo-400" /> Jordan
                          </div>
                        </div>
                        <div className="mt-8 pt-8 border-t border-slate-50 flex items-center justify-between">
                          <span className="text-3xl font-black text-slate-900 tracking-tighter">{post.price.toLocaleString()} <span className="text-lg text-indigo-500 ml-1">JD</span></span>
                          <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-all">
                             <ArrowRight size={22} />
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                }

                // Professional Row (List) View
                return (
                  <Link key={post.postID} to={`/post/${post.postID}`} className="group bg-white rounded-[2.5rem] overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 border border-slate-100 flex flex-col sm:flex-row p-6 gap-8 hover:-translate-y-1">
                    <div className="w-full sm:w-64 h-48 sm:h-auto shrink-0 rounded-3xl overflow-hidden bg-slate-50">
                      {cardImage ? (
                        <img src={cardImage} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" alt={post.postTitle} />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-100 text-slate-300">
                          <Package size={48} className="opacity-40" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 flex flex-col justify-between py-2">
                       <div className="space-y-3">
                          <div className="flex items-center gap-3">
                             <span className="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">{post.categoryName}</span>
                             <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1"><Tag size={12}/> Asset ID: {post.postID}</span>
                          </div>
                          <h3 className="text-2xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight">{post.postTitle}</h3>
                          <p className="text-slate-500 text-sm font-medium line-clamp-2 leading-relaxed">{post.postDescription}</p>
                       </div>
                       <div className="flex items-center gap-4 mt-6">
                          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                            <MapPin size={16} className="text-indigo-400" /> Amman, Jordan
                          </div>
                          <div className="h-4 w-px bg-slate-100"></div>
                          <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                            Listed: {new Date(post.createdAt).toLocaleDateString()}
                          </div>
                       </div>
                    </div>
                    <div className="sm:w-48 flex flex-col items-end justify-center sm:border-l border-slate-100 sm:pl-8 text-right shrink-0">
                       <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Price Offer</p>
                       <p className="text-4xl font-black text-slate-900 tracking-tighter">{post.price.toLocaleString()} <span className="text-lg text-indigo-500">JD</span></p>
                       <button className="mt-6 w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-indigo-600 transition-all shadow-xl shadow-slate-100">
                          View Details
                       </button>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
          
          {posts.length === 0 && !loading && (
             <div className="bg-white rounded-[3.5rem] py-32 text-center border border-dashed border-slate-200">
                <Package size={80} className="mx-auto text-slate-200 mb-6" />
                <h3 className="text-2xl font-black text-slate-900">No items found</h3>
                <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-2">Try adjusting your search protocol</p>
             </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Browse;
