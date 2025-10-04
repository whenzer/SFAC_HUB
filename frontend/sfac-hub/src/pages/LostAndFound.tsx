import React, { useEffect, useRef, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import './LostAndFound.css';
import SFACLogo from '../assets/images/SFAC-Logo.png';
import ProtectedLayout from '../utils/ProtectedLayout';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Atom } from 'react-loading-indicators';
import fetchWithRefresh from '../utils/apiService';

type ReportType = 'Lost' | 'Found';


/* REST API types ###

get protected/lostandfound
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZHBpYyI6eyJmaWxlbmFtZSI6IkNBQkFOR0lTX09VVFBVVC5wbmciLCJpbWFnZSI6Imh0dHBzOi8vcmVzLmNsb3VkaW5hcnkuY29tL2R4bDh3a3hlaC9pbWFnZS91cGxvYWQvdjE3NTg4NTcwMzYvc2ZhY191c2Vycy9DQUJBTkdJU19PVVRQVVQucG5nIn0sIl9pZCI6IjY4ZDYwNzRjYTljOTNhNjJlM2IwYjExNiIsImZpcnN0bmFtZSI6IldoZW56ZXIiLCJtaWRkbGVuYW1lIjoiIiwibGFzdG5hbWUiOiJDYWJhbmdpcyIsImVtYWlsIjoia2xlZDBuZzEyM0BnbWFpbC5jb20iLCJ2ZXJpZmllZEVtYWlsIjp0cnVlLCJ2ZXJpZmllZElEIjp0cnVlLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NTk1NTg5ODMsImV4cCI6MTc1OTU1OTg4M30.u1AB4R82jw-a70DzwkYPf0n4qhaCClqnseXRVBcO8Cg
###

POST /protected/lostandfound/:id/like
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZHBpYyI6eyJmaWxlbmFtZSI6IkNBQkFOR0lTX09VVFBVVC5wbmciLCJpbWFnZSI6Imh0dHBzOi8vcmVzLmNsb3VkaW5hcnkuY29tL2R4bDh3a3hlaC9pbWFnZS91cGxvYWQvdjE3NTg4NTcwMzYvc2ZhY191c2Vycy9DQUJBTkdJU19PVVRQVVQucG5nIn0sIl9pZCI6IjY4ZDYwNzRjYTljOTNhNjJlM2IwYjExNiIsImZpcnN0bmFtZSI6IldoZW56ZXIiLCJtaWRkbGVuYW1lIjoiIiwibGFzdG5hbWUiOiJDYWJhbmdpcyIsImVtYWlsIjoia2xlZDBuZzEyM0BnbWFpbC5jb20iLCJ2ZXJpZmllZEVtYWlsIjp0cnVlLCJ2ZXJpZmllZElEIjp0cnVlLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NTk1NTUwMjUsImV4cCI6MTc1OTU1NTkyNX0.CYrQNLpgglGz5qaQ0uM_a6TBl8Ck87O6KInhHrYUfTY

###

POST /protected/lostandfound/:id/unlike
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZHBpYyI6eyJmaWxlbmFtZSI6IkNBQkFOR0lTX09VVFBVVC5wbmciLCJpbWFnZSI6Imh0dHBzOi8vcmVzLmNsb3VkaW5hcnkuY29tL2R4bDh3a3hlaC9pbWFnZS91cGxvYWQvdjE3NTg4NTcwMzYvc2ZhY191c2Vycy9DQUJBTkdJU19PVVRQVVQucG5nIn0sIl9pZCI6IjY4ZDYwNzRjYTljOTNhNjJlM2IwYjExNiIsImZpcnN0bmFtZSI6IldoZW56ZXIiLCJtaWRkbGVuYW1lIjoiIiwibGFzdG5hbWUiOiJDYWJhbmdpcyIsImVtYWlsIjoia2xlZDBuZzEyM0BnbWFpbC5jb20iLCJ2ZXJpZmllZEVtYWlsIjp0cnVlLCJ2ZXJpZmllZElEIjp0cnVlLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NTk1NTUwMjUsImV4cCI6MTc1OTU1NTkyNX0.CYrQNLpgglGz5qaQ0uM_a6TBl8Ck87O6KInhHrYUfTY

###

POST /protected/lostandfound/68e0a7516f40c66a583e3104/comment
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZHBpYyI6eyJmaWxlbmFtZSI6IkNBQkFOR0lTX09VVFBVVC5wbmciLCJpbWFnZSI6Imh0dHBzOi8vcmVzLmNsb3VkaW5hcnkuY29tL2R4bDh3a3hlaC9pbWFnZS91cGxvYWQvdjE3NTg4NTcwMzYvc2ZhY191c2Vycy9DQUJBTkdJU19PVVRQVVQucG5nIn0sIl9pZCI6IjY4ZDYwNzRjYTljOTNhNjJlM2IwYjExNiIsImZpcnN0bmFtZSI6IldoZW56ZXIiLCJtaWRkbGVuYW1lIjoiIiwibGFzdG5hbWUiOiJDYWJhbmdpcyIsImVtYWlsIjoia2xlZDBuZzEyM0BnbWFpbC5jb20iLCJ2ZXJpZmllZEVtYWlsIjp0cnVlLCJ2ZXJpZmllZElEIjp0cnVlLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NTk1NTUwMjUsImV4cCI6MTc1OTU1NTkyNX0.CYrQNLpgglGz5qaQ0uM_a6TBl8Ck87O6KInhHrYUfTY

{
    "comment": "This is a test comment"
}

###

DELETE /protected/lostandfound/:postid/comment/:commentid
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZHBpYyI6eyJmaWxlbmFtZSI6IkNBQkFOR0lTX09VVFBVVC5wbmciLCJpbWFnZSI6Imh0dHBzOi8vcmVzLmNsb3VkaW5hcnkuY29tL2R4bDh3a3hlaC9pbWFnZS91cGxvYWQvdjE3NTg4NTcwMzYvc2ZhY191c2Vycy9DQUJBTkdJU19PVVRQVVQucG5nIn0sIl9pZCI6IjY4ZDYwNzRjYTljOTNhNjJlM2IwYjExNiIsImZpcnN0bmFtZSI6IldoZW56ZXIiLCJtaWRkbGVuYW1lIjoiIiwibGFzdG5hbWUiOiJDYWJhbmdpcyIsImVtYWlsIjoia2xlZDBuZzEyM0BnbWFpbC5jb20iLCJ2ZXJpZmllZEVtYWlsIjp0cnVlLCJ2ZXJpZmllZElEIjp0cnVlLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NTk1NTUwMjUsImV4cCI6MTc1OTU1NTkyNX0.CYrQNLpgglGz5qaQ0uM_a6TBl8Ck87O6KInhHrYUfTY

###

POST /protected/lostandfound/post
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZHBpYyI6eyJmaWxlbmFtZSI6IkNBQkFOR0lTX09VVFBVVC5wbmciLCJpbWFnZSI6Imh0dHBzOi8vcmVzLmNsb3VkaW5hcnkuY29tL2R4bDh3a3hlaC9pbWFnZS91cGxvYWQvdjE3NTg4NTcwMzYvc2ZhY191c2Vycy9DQUJBTkdJU19PVVRQVVQucG5nIn0sIl9pZCI6IjY4ZDYwNzRjYTljOTNhNjJlM2IwYjExNiIsImZpcnN0bmFtZSI6IldoZW56ZXIiLCJtaWRkbGVuYW1lIjoiIiwibGFzdG5hbWUiOiJDYWJhbmdpcyIsImVtYWlsIjoia2xlZDBuZzEyM0BnbWFpbC5jb20iLCJ2ZXJpZmllZEVtYWlsIjp0cnVlLCJ2ZXJpZmllZElEIjp0cnVlLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NTk1NTU5OTgsImV4cCI6MTc1OTU1Njg5OH0.GoWjyxiLo9quCcEcs-SLHSBDfilo8XiwduJk_iQa-O8

{
    "content": {
        "postType": "Lost",
        "briefTitle": "Lost Wallet",
        "description": "Black leather wallet with ID and credit cards",
        "category": "Accessories",
        "location": "Library - 2nd Floor",
        "photo": {
            "filename": "wallet.png",
            "image": "base64encodedstring"
        }
    }
}
    */
type LostFoundPost = {
  id: string;
  type: ReportType;
  title: string;
  category: string;
  location: string;
  description: string;
  photoUrl?: string;
  author: { name: string };
  createdAt: string;
  stats: { likes: number; comments: number; views: number };
  claimedBy?: string | null;
  likedByMe: boolean;
};

const CATEGORIES = [
  'Electronics',
  'Clothing',
  'Books & Materials',
  'Accessories',
  'Documents',
  'Other',
];

const initialForm = {
  type: 'Lost' as ReportType,
  title: '',
  category: '',
  location: '',
  description: '',
  photoFile: null as File | null,
  photoPreview: '' as string,
};

const LostAndFound = () => {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'Active' | 'Claimed' | 'Create'>('Active');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [likedPosts, setLikedPosts] = useState<Record<string, boolean>>({});
  const [commentInput, setCommentInput] = useState<Record<string, string>>({});
  const [showComments, setShowComments] = useState<Record<string, boolean>>({});

  const [feed, setFeed] = useState<LostFoundPost[]>([]);

  const filteredFeed = feed.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !categoryFilter || post.category === categoryFilter;
    const matchesTab = activeTab === 'Claimed' ? !!post.claimedBy : !post.claimedBy;
    
    return matchesSearch && matchesCategory && matchesTab;
  });

  function validate(): boolean {
    const next: Record<string, string> = {};
    if (!form.title.trim()) next.title = 'Title is required';
    if (!form.category) next.category = 'Select a category';
    if (!form.location.trim()) next.location = 'Location is required';
    if (!form.description.trim()) next.description = 'Description is required';
    if (form.description && form.description.trim().length < 30)
      next.description = 'Please provide at least 30 characters';
    if (!form.photoFile) next.photoFile = 'Please attach a photo';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function resetForm() {
    setForm(initialForm);
    setErrors({});
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function handleImageToDataUrl(file: File): Promise<string> {
    const bitmap = await createImageBitmap(file);
    const canvas = document.createElement('canvas');
    const maxDim = 1600;
    const ratio = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
    canvas.width = Math.round(bitmap.width * ratio);
    canvas.height = Math.round(bitmap.height * ratio);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas not supported');
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.86);
    return dataUrl;
  }


  // const onLike = (id: string) => {
  //   // Toggle like status
  //   const isCurrentlyLiked = likedPosts[id] || false;
  //   setLikedPosts(prev => ({ ...prev, [id]: !isCurrentlyLiked }));
    
  //   // Update like count in feed
  //   setFeed(prev => prev.map(post => {
  //     if (post.id === id) {
  //       const newLikes = isCurrentlyLiked 
  //         ? Math.max(0, post.stats.likes - 1) 
  //         : post.stats.likes + 1;
  //       return {
  //         ...post,
  //         stats: { ...post.stats, likes: newLikes }
  //       };
  //     }
  //     return post;
  //   }));
  // };

  // const onComment = (id: string) => {
  //   // Toggle comment section visibility
  //   setShowComments(prev => ({ ...prev, [id]: !prev[id] }));
  //   setFeed((prev) => prev.map((p) => (p.id === id ? { ...p, stats: { ...p.stats, comments: p.stats.comments + 1 } } : p)));
  // };
  
  // const submitComment = (id: string) => {
  //   if (!commentInput[id]?.trim()) return;
    
  //   // Add comment to post
  //   setFeed(prev => prev.map(post => {
  //     if (post.id === id) {
  //       return {
  //         ...post,
  //         stats: { 
  //           ...post.stats, 
  //           comments: post.stats.comments + 1 
  //         }
  //       };
  //     }
  //     return post;
  //   }));
    
  //   // Clear comment input
  //   setCommentInput(prev => ({ ...prev, [id]: '' }));
  // };

  function onClaim(id: string) {
    setFeed((prev) => prev.map((p) => (p.id === id && p.type === 'Found' ? { ...p, claimedBy: 'You' } : p)));
  }

  return (
    <ProtectedLayout endpoint="/protected/lostandfound">
      {({ user, isLoading, logout, extraData }) => {

        useEffect(() => {
          console.log('Extra Data:', extraData);
          if (extraData?.data) {
            const posts: LostFoundPost[] = extraData.data.map((item: any) => ({
              id: item._id,
              type: item.content.postType,
              title: item.content.briefTitle,
              category: item.content.category,
              location: item.content.location,
              description: item.content.description,
              photoUrl: item.content.photo?.image,
              author: { name: `${item.user?.firstname ?? ''} ${item.user?.lastname ?? ''}`.trim() || 'Unknown' },
              createdAt: item.createdAt,
              likedByMe: item.content.likes?.likedbyme || false,
              stats: {
                likes: item.content.likes?.count || 0,
                comments: item.content.comments?.length || 0,
                views: 0,
              },
              claimedBy: item.content.status === 'Claimed' ? 'Someone' : null,
            } as LostFoundPost));
            setFeed(posts);

            const initialLikes: Record<string, boolean> = {};
            posts.forEach(p => { initialLikes[p.id] = p.likedByMe });
            setLikedPosts(initialLikes);
          }
        }, [extraData]);

        // submitpost now here 
        async function submitPost(user: any) {
          if (!validate()) return;
          setSubmitting(true);
          try {
            let photoDataUrl: string | undefined;
            if (form.photoFile) {
              photoDataUrl = await handleImageToDataUrl(form.photoFile);
            }
            const payload = {
              postType: form.type,
              briefTitle: form.title.trim(),
              category: form.category,
              location: form.location.trim(),
              description: form.description.trim(),
              photo: {
                filename: form.photoFile?.name || 'photo.jpg',
                image: photoDataUrl,
              },
            };
            try {
              await fetchWithRefresh('/protected/lostandfound/post', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: payload }),
              });
            } catch (_) {}
            setIsCreateOpen(false);
            setActiveTab('Active');
            resetForm();
            
          } catch (e) {
            console.error(e);
          } finally {
            setSubmitting(false);
          }
        }

        //like and unlike functions
        async function onLike(id: string) {
          // Toggle like status
          const isCurrentlyLiked = likedPosts[id] || false;
          setLikedPosts(prev => ({ ...prev, [id]: !isCurrentlyLiked }));
          try {
            if (isCurrentlyLiked) {
              await fetchWithRefresh(`/protected/lostandfound/${id}/unlike`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
              });
            } else {
              await fetchWithRefresh(`/protected/lostandfound/${id}/like`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
              });
            }   
            // Update like count in feed
            setFeed(prev => prev.map(post => {
              if (post.id === id) {
                const newLikes = isCurrentlyLiked 
                  ? Math.max(0, post.stats.likes - 1) 
                  : post.stats.likes + 1;
                return {
                  ...post,
                  stats: { ...post.stats, likes: newLikes }
                };
              }
              return post;
            }
            ));
          } catch (e) {
            console.error(e);
          }
        }

        // submit comment function
        async function submitComment(id: string) {
          if (!commentInput[id]?.trim()) return;
          try {
            await fetchWithRefresh(`/protected/lostandfound/${id}/comment`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ comment: commentInput[id].trim() }),
            });
            // Add comment to post
            setFeed(prev => prev.map(post => {
              if (post.id === id) {
                return {
                  ...post,
                  stats: { 
                    ...post.stats, 
                    comments: post.stats.comments + 1
                  }
                };
              }
              return post;
            }));
            
            // Clear comment input
            setCommentInput(prev => ({ ...prev, [id]: '' }));
          } catch (e) {
            console.error(e);
          }
        }

        // on comment function
        function onComment(id: string) {
          // Toggle comment section visibility
          setShowComments(prev => ({ ...prev, [id]: !prev[id] }));
        }

        if (isLoading) {
          return (
            <div className="loading-screen">
              <img src={SFACLogo} alt="SFAC Logo" className="loading-logo" />
              <div className="loading-text">Loading Lost & Found</div>
              <Atom color="#ffffff" size="medium"/>
            </div>
          );
        }

        return (
          <div className="lf-dashboard">
            {user && <Header user={user} logout={logout} />}

            <main className="lf-main">
              <div className="lf-container">
                <nav className="lf-breadcrumb">
                  <Link to="/dashboard" className="breadcrumb-link">Dashboard</Link>
                  <span className="lf-breadcrumb-separator">/</span>
                  <span className="lf-breadcrumb-current">Lost & Found</span>
                </nav>

                <div className="lf-header">
                  <div className="lf-header-content">
                    <div className="lf-header-icon">
                      <svg width="32" height="32" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
                      </svg>
                    </div>
                    <div className="lf-header-text">
                      <h1 className="lf-title">Lost & Found</h1>
                      <p className="lf-subtitle">Community-driven system to help recover lost items</p>
                    </div>
                  </div>
                </div>

                <div className="lf-tabs">
                  <button 
                    className={`lf-tab ${activeTab === 'Active' ? 'lf-tab--active' : ''}`}
                    onClick={() => setActiveTab('Active')}
                  >
                    Active Posts
                  </button>
                  <button 
                    className={`lf-tab ${activeTab === 'Claimed' ? 'lf-tab--active' : ''}`}
                    onClick={() => setActiveTab('Claimed')}
                  >
                    Claimed Items
                  </button>
                  <button 
                    className="lf-create-btn"
                    onClick={() => { setActiveTab('Create'); setIsCreateOpen(true); }}
                  >
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
                    </svg>
                    Create Post
                  </button>
                </div>

                <div className="lf-filters">
                  <div className="lf-search">
                    <svg className="lf-search-icon" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"/>
                    </svg>
                    <input 
                      type="text"
                      aria-label="Search posts"
                      placeholder="Search posts..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="lf-search-input"
                    />
                  </div>
                  <select 
                    aria-label="Category filter"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="lf-category-filter"
                  >
                    <option value="">All Categories</option>
                    {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>

                {activeTab !== 'Create' && (
                  <div className="lf-feed">
                    {filteredFeed.length === 0 ? (
                      <div className="lf-empty-state">
                        <svg width="64" height="64" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
                        </svg>
                        <h3>No posts found</h3>
                        <p>Try adjusting your search or create a new post</p>
                      </div>
                    ) : (
                      filteredFeed.map((post) => (
                        <article key={post.id} className="lf-post" data-type={post.type}>
                          <header className="lf-post-header">
                            <div className="lf-post-avatar" aria-hidden>
                              {post.author.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="lf-post-meta">
                              <div className="lf-post-author">
                                <strong>{post.author.name}</strong>
                                <span className={`lf-badge lf-badge--${post.type.toLowerCase()}`}>
                                  {post.type}
                                </span>
                              </div>
                              <time className="lf-post-time">
                                {new Date(post.createdAt).toLocaleString()}
                              </time>
                            </div>
                          </header>
                          
                          <div className="lf-post-content">
                            <h3 className="lf-post-title">{post.title}</h3>
                            <div className="lf-post-details">
                              {post.location} • {post.category}
                            </div>
                            <p className="lf-post-description">{post.description}</p>
                          </div>
                          
                          {post.photoUrl && (
                            <div className="lf-post-image">
                              <img 
                                src={post.photoUrl} 
                                alt={post.title}
                                loading="lazy"
                                className="responsive-image"
                              />
                            </div>
                          )}
                          
                          <footer className="lf-post-footer">
                            <div className="lf-post-actions">
                              <button 
                                className={`lf-action-btn ${likedPosts[post.id] ? 'lf-action-btn--active' : ''}`}
                                onClick={() => onLike(post.id)}
                                aria-label="Like post"
                              >
                                <span>{likedPosts[post.id] ? '❤️' : '👍'}</span>
                                {likedPosts[post.id] ? 'Liked' : 'Like'} {post.stats.likes > 0 && `(${post.stats.likes})`}
                              </button>
                              <button 
                                className={`lf-action-btn ${showComments[post.id] ? 'lf-action-btn--active' : ''}`}
                                onClick={() => onComment(post.id)}
                                aria-label="Comment on post"
                              >
                                <span>💬</span>
                                Comment {post.stats.comments > 0 && `(${post.stats.comments})`}
                              </button>
                              {post.type === 'Found' && !post.claimedBy && (
                                <button 
                                  className="lf-action-btn lf-action-btn--claim"
                                  onClick={() => onClaim(post.id)}
                                  aria-label="Claim item"
                                >
                                  <span>✅</span>
                                  Claim
                                </button>
                              )}
                              {post.claimedBy && (
                                <span className="lf-badge lf-badge--claimed">
                                  Claimed by {post.claimedBy}
                                </span>
                              )}
                            </div>
                            <div className="lf-post-views">
                              {post.stats.views} views
                            </div>
                            
                            {showComments[post.id] && (
                              <div className="lf-comments-section">
                                <div className="lf-comment-form">
                                  <input
                                    type="text"
                                    placeholder="Write a comment..."
                                    value={commentInput[post.id] || ''}
                                    onChange={(e) => setCommentInput(prev => ({ ...prev, [post.id]: e.target.value }))}
                                    className="lf-comment-input"
                                  />
                                  <button 
                                    className="lf-comment-submit"
                                    onClick={() => submitComment(post.id)}
                                    disabled={!commentInput[post.id]?.trim()}
                                  >
                                    Post
                                  </button>
                                </div>
                                {post.stats.comments > 0 && (
                                  <div className="lf-comments-count">
                                    {post.stats.comments} {post.stats.comments === 1 ? 'comment' : 'comments'}
                                  </div>
                                )}
                              </div>
                            )}
                          </footer>
                        </article>
                      ))
                    )}
                  </div>
                )}

                {(isCreateOpen || activeTab === 'Create') && (
                  <div className="lf-modal-overlay" role="dialog" aria-modal="true">
                    <div className="lf-modal">
                      <div className="lf-modal-header">
                        <div className="lf-modal-icon">
                          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 5v14M5 12h14"/>
                          </svg>
                        </div>
                        <div className="lf-modal-text">
                          <h2 className="lf-modal-title">Create Post</h2>
                          <p className="lf-modal-description">
                            Share a lost or found item. Please follow the posting guidelines.
                          </p>
                        </div>
                      </div>

                      <form onSubmit={(e) => { e.preventDefault(); submitPost(user); }}>
                        <div className="lf-form">
                          <div className="lf-type-selector">
                            {(['Lost', 'Found'] as ReportType[]).map((rt) => (
                              <label 
                                key={rt} 
                                className={`lf-type-option ${form.type === rt ? 'lf-type-option--selected' : ''}`}
                                data-type={rt}
                              >
                                <input 
                                  type="radio" 
                                  name="reportType" 
                                  value={rt} 
                                  checked={form.type === rt}
                                  onChange={() => setForm({ ...form, type: rt })}
                                  className="lf-type-input"
                                />
                                <div className="lf-type-content">
                                  <div className="lf-type-title">{rt} Item</div>
                                  <div className="lf-type-description">
                                    {rt === 'Lost' ? 'I lost something' : 'I found something'}
                                  </div>
                                </div>
                              </label>
                            ))}
                          </div>

                          <div className="lf-form-group">
                            <input
                              aria-label="Title"
                              placeholder="Lost - Brief description"
                              value={form.title}
                              onChange={(e) => setForm({ ...form, title: e.target.value })}
                              className={`lf-form-input ${errors.title ? 'lf-form-input--error' : ''}`}
                            />
                            {errors.title && <div className="lf-form-error">{errors.title}</div>}
                          </div>

                          <div className="lf-form-group">
                            <select
                              aria-label="Category"
                              value={form.category}
                              onChange={(e) => setForm({ ...form, category: e.target.value })}
                              className={`lf-form-select ${errors.category ? 'lf-form-select--error' : ''}`}
                            >
                              <option value="">Select a category</option>
                              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                            </select>
                            {errors.category && <div className="lf-form-error">{errors.category}</div>}
                          </div>

                          <div className="lf-form-group">
                            <input
                              aria-label="Location"
                              placeholder="Where was it lost/found?"
                              value={form.location}
                              onChange={(e) => setForm({ ...form, location: e.target.value })}
                              className={`lf-form-input ${errors.location ? 'lf-form-input--error' : ''}`}
                            />
                            {errors.location && <div className="lf-form-error">{errors.location}</div>}
                          </div>

                          <div className="lf-form-group">
                            <textarea
                              aria-label="Description"
                              placeholder="Provide detailed description of the lost item. Include color, size, brand, distinctive features, etc."
                              value={form.description}
                              onChange={(e) => setForm({ ...form, description: e.target.value })}
                              rows={5}
                              className={`lf-form-textarea ${errors.description ? 'lf-form-textarea--error' : ''}`}
                            />
                            {errors.description && <div className="lf-form-error">{errors.description}</div>}
                          </div>

                          <div className="lf-form-group">
                            <label className={`lf-file-upload ${form.photoPreview ? 'lf-file-upload--has-image' : ''}`}>
                              <input 
                                ref={fileInputRef}
                                type="file" 
                                accept="image/*" 
                                onChange={(e) => {
                                  const f = e.target.files?.[0] || null;
                                  setForm((prev) => ({ ...prev, photoFile: f || null }));
                                  setErrors((er) => ({ ...er, photoFile: '' }));
                                  if (f) {
                                    const reader = new FileReader();
                                    reader.onload = () => setForm((prev) => ({ ...prev, photoPreview: reader.result as string }));
                                    reader.readAsDataURL(f);
                                  } else {
                                    setForm((prev) => ({ ...prev, photoPreview: '' }));
                                  }
                                }}
                                className="lf-file-input"
                              />
                              <div className="lf-file-label">
                                <svg width="20" height="20" fill="currentColor" viewBox="0 0 16 16">
                                  <path d="M.5 9.9a.5.5 0 0 1 .5.5v2.5a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2.5a.5.5 0 0 1 1 0v2.5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2v-2.5a.5.5 0 0 1 .5-.5z"/>
                                  <path d="M7.646 1.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 2.707V11.5a.5.5 0 0 1-1 0V2.707L5.354 4.854a.5.5 0 1 1-.708-.708l3-3z"/>
                                </svg>
                                {form.photoPreview ? 'Change Photo' : 'Upload Photo'}
                              </div>
                            </label>
                            {errors.photoFile && <div className="lf-form-error">{errors.photoFile}</div>}
                            
                            {form.photoPreview && (
                              <div className="lf-image-preview">
                                <div className="lf-photo-preview-container">
                                  <img src={form.photoPreview} alt="Preview" />
                                  <button 
                                    type="button" 
                                    className="lf-photo-remove-btn"
                                    onClick={() => {
                                      setForm({
                                        ...form,
                                        photoFile: null,
                                        photoPreview: ''
                                      });
                                      if (fileInputRef.current) fileInputRef.current.value = '';
                                    }}
                                    aria-label="Remove photo"
                                  >
                                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                                    </svg>
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="lf-guidelines">
                            <strong>Posting Guidelines</strong>
                            <ul>
                              <li>Be as descriptive as possible to help identify the item</li>
                              <li>Include the specific location where it was lost/found</li>
                              <li>For found items, do not include identifying details publicly</li>
                              <li>Contact information will be shared only after verification</li>
                            </ul>
                          </div>

                          <div className="lf-modal-footer">
                            <button 
                              type="button" 
                              className="lf-btn lf-btn--secondary"
                              onClick={() => { setIsCreateOpen(false); setActiveTab('Active'); resetForm(); }}
                            >
                              Cancel
                            </button>
                            <button 
                              disabled={submitting}
                              type="submit" 
                              className="lf-btn lf-btn--primary"
                            >
                              {submitting ? (
                                <>
                                  <div className="lf-spinner"></div>
                                  Posting...
                                </>
                              ) : (
                                '+ Post'
                              )}
                            </button>
                          </div>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            </main>

            <Footer />
          </div>
        );
      }}
    </ProtectedLayout>
  );
};

export default LostAndFound;