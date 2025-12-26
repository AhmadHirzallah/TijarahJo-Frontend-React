
import React, { Suspense, lazy } from 'react';
// Changed import from 'react-router-dom' to 'react-router' to fix export missing errors
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Layout/Navbar';
import Loader from './components/UI/Loader';

// Lazy loading components
const Home = lazy(() => import('./pages/Public/Home'));
const Browse = lazy(() => import('./pages/Public/Browse'));
const PostDetails = lazy(() => import('./pages/Public/PostDetails'));
const Login = lazy(() => import('./pages/Auth/Login'));
const Register = lazy(() => import('./pages/Auth/Register'));
const CreatePost = lazy(() => import('./pages/User/CreatePost'));
const EditPost = lazy(() => import('./pages/User/EditPost'));
const Profile = lazy(() => import('./pages/User/Profile'));
const MyPosts = lazy(() => import('./pages/User/MyPosts'));
const AdminDashboard = lazy(() => import('./pages/Admin/Dashboard'));

const ProtectedRoute: React.FC<{ children: React.ReactNode; adminOnly?: boolean }> = ({ children, adminOnly }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  if (loading) return <Loader fullScreen />;
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (adminOnly && !isAdmin) return <Navigate to="/" />;
  return <>{children}</>;
};

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen flex flex-col">
    <Navbar />
    <div className="flex-grow">
      {children}
    </div>
    <footer className="bg-white border-t py-12">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <p className="text-gray-400 font-medium">© 2024 TijarahJo. Developed for Graduation Project Excellence.</p>
      </div>
    </footer>
  </div>
);

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Suspense fallback={<Loader fullScreen />}>
          <Routes>
            <Route path="/" element={<Layout><Home /></Layout>} />
            <Route path="/browse" element={<Layout><Browse /></Layout>} />
            <Route path="/post/:id" element={<Layout><PostDetails /></Layout>} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route path="/create-post" element={<ProtectedRoute><Layout><CreatePost /></Layout></ProtectedRoute>} />
            <Route path="/edit-post/:id" element={<ProtectedRoute><Layout><EditPost /></Layout></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>} />
            <Route path="/my-posts" element={<ProtectedRoute><Layout><MyPosts /></Layout></ProtectedRoute>} />
            
            <Route path="/admin" element={<ProtectedRoute adminOnly><Layout><AdminDashboard /></Layout></ProtectedRoute>} />
            
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Suspense>
      </Router>
    </AuthProvider>
  );
};

export default App;
