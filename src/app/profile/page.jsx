"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  Settings, 
  LogOut, 
  DollarSign, 
  Coins, 
  Heart, 
  Eye, 
  GalleryHorizontalEnd,
  Sparkles,
  Zap,
  Crown,
  TrendingUp,
  Star,
  Download,
  Share2,
  ArrowLeft,
  Home,
  Edit
} from 'lucide-react';
import { auth } from '../../lib/firebase';
import { signOut } from 'firebase/auth';
import generationApi from '../../lib/api/generation';
import activityService from '../../lib/services/activityService';
import DashboardSidebar from '../../components/dashboard/DashboardSidebar';
import DashboardCharts from '../../components/dashboard/DashboardCharts';
import RecentActivity from '../../components/dashboard/RecentActivity';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userPlan, setUserPlan] = useState(null);
  const [recentActivity, setRecentActivity] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [activityLoading, setActivityLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      console.log('👤 ProfilePage: Auth state changed, user =', user ? user.email : 'No user');
      if (user) {
        console.log('✅ ProfilePage: User found, setting user state');
        setUser(user);
      } else {
        console.log('❌ ProfilePage: No user, redirecting to /auth');
        router.push('/auth');
      }
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, [router]);

  useEffect(() => {
    async function fetchUserPlan() {
      if (!user) return; // Only fetch if user is authenticated
      
      try {
        const profile = await generationApi.getUserProfile();
        setUserPlan(profile);
        console.log("📝 Current plan:", profile?.subscription?.plan?.name);
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    }
    fetchUserPlan();
  }, [user]);

  useEffect(() => {
    async function fetchActivityData() {
      if (!user) return;
      
      setActivityLoading(true);
      try {
        // Get Firebase ID
        let firebaseId = await generationApi.getFirebaseId();
        if (!firebaseId) {
          // TEMPORARY: Use hardcoded firebaseId for testing
          console.warn('⚠️ No Firebase ID found, using hardcoded one for testing');
          firebaseId = 'QKMRjEnFcCfCCsiuOLTKrfHXz7x1';
        }

        // Fetch recent activity and user stats
        const [activities, stats] = await Promise.all([
          activityService.getRecentActivity(firebaseId, 10),
          activityService.getUserStats(firebaseId)
        ]);

        setRecentActivity(activities);
        setUserStats(stats);
        console.log("📊 Activity data loaded:", { activities: activities.length, stats });
      } catch (error) {
        console.error('Error fetching activity data:', error);
        setRecentActivity([]);
        setUserStats(null);
      } finally {
        setActivityLoading(false);
      }
    }

    fetchActivityData();
  }, [user]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleUpgrade = () => {
    router.push('/pricing');
  };

  const handleOpenGallery = () => {
    router.push('/gallery');
  };

  const handleSettings = () => {
    router.push('/settings');
  };

  const handleBackToHome = () => {
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#fbfaf7] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#C15F3C] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handle = user.displayName || user.email?.split('@')[0] || 'user';
  const displayName = user.displayName || handle;


  return (
    <div className="min-h-screen bg-[#fbfaf7] flex h-screen overflow-hidden">
      {/* Sidebar */}
      <DashboardSidebar 
        user={user}
        userPlan={userPlan}
        userStats={userStats}
      />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-8 py-6 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-gray-600">Analytics and insights for your AI generations</p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleBackToHome}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Home className="w-4 h-4" />
                <span>Home</span>
              </button>
              <button
                onClick={handleSettings}
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="flex-1 p-8 overflow-auto">
          <div className="max-w-7xl mx-auto">
          {/* Simple Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Total Generations</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {userStats ? userStats.totalGenerations : '...'}
                  </p>
                </div>
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Images Created</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {userStats ? userStats.imageGenerations : '...'}
                  </p>
                </div>
                <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                  <Image src="/icons/image.png" alt="Image" width={20} height={20} className="opacity-80" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Videos Created</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {userStats ? userStats.videoGenerations : '...'}
                  </p>
                </div>
                <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center">
                  <Image src="/icons/video.png" alt="Video" width={20} height={20} className="opacity-80" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Upscales</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {userStats ? userStats.enhancements : '...'}
                  </p>
                </div>
                <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                  <Image src="/icons/upscale.png" alt="Enhance" width={20} height={20} className="opacity-80" />
                </div>
              </div>
            </div>
          </div>

            {/* Two Column Layout - Charts and Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Charts - Takes 2 columns */}
              <div className="lg:col-span-2">
                <DashboardCharts 
                  userStats={userStats}
                  recentActivity={recentActivity}
                />
              </div>
              
              {/* Recent Activity - Takes 1 column */}
              <div>
                <RecentActivity 
                  recentActivity={recentActivity}
                  activityLoading={activityLoading}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
