"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  User,
  Shield,
  Bell,
  Palette,
  Globe,
  CreditCard,
  Key,
  Trash2,
  Download,
  Upload,
  Camera,
  Image as ImageIcon,
  Save,
  X,
  Eye,
  EyeOff,
  Mail,
  Lock,
  Smartphone,
  Monitor,
  Moon,
  Sun,
  Languages,
  Volume2,
  VolumeX
} from 'lucide-react';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';

export default function SettingsPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [language, setLanguage] = useState('English');
  const [volume, setVolume] = useState(80);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
      } else {
        router.push('/auth');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
    }
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

  const tabs = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'account', name: 'Account', icon: Shield },
    { id: 'preferences', name: 'Preferences', icon: Palette },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'billing', name: 'Billing', icon: CreditCard },
    { id: 'security', name: 'Security', icon: Key }
  ];

  return (
    <div className="min-h-screen bg-[#fbfaf7]">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#C15F3C] to-[#F59B7B] text-white">
        <div className="px-10 py-6">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Settings</h1>
                <p className="text-white/80">Manage your account and preferences</p>
              </div>
              <button
                onClick={() => router.push('/profile')}
                className="bg-white/20 backdrop-blur-sm border border-white/30 text-white px-4 py-2 rounded-xl font-medium hover:bg-white/30 transition-colors"
              >
                Back to Profile
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-10 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                <nav className="space-y-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-medium transition-colors ${
                        activeTab === tab.id
                          ? 'bg-[#C15F3C] text-white'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <tab.icon className="w-5 h-5" />
                      <span>{tab.name}</span>
                    </button>
                  ))}
                </nav>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200">
                {/* Profile Settings */}
                {activeTab === 'profile' && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Profile Settings</h2>
                    
                    {/* Profile Picture & Banner */}
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Profile Picture</h3>
                        <div className="flex items-center space-x-6">
                          <div className="w-24 h-24 bg-gradient-to-br from-[#C15F3C] to-[#F59B7B] rounded-2xl flex items-center justify-center">
                            <span className="text-white text-2xl font-bold">
                              {displayName.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="space-y-3">
                            <button className="bg-[#C15F3C] text-white px-4 py-2 rounded-xl font-medium hover:bg-[#A54F32] transition-colors flex items-center space-x-2">
                              <Camera className="w-4 h-4" />
                              <span>Take Photo</span>
                            </button>
                            <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-xl font-medium hover:bg-gray-200 transition-colors flex items-center space-x-2">
                              <ImageIcon className="w-4 h-4" />
                              <span>Upload Image</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Banner Image</h3>
                        <div className="w-full h-32 bg-gradient-to-r from-[#FFCEBC] to-[#F59B7B] rounded-2xl flex items-center justify-center">
                          <button className="bg-white/20 backdrop-blur-sm border border-white/30 text-white px-4 py-2 rounded-xl font-medium hover:bg-white/30 transition-colors flex items-center space-x-2">
                            <Upload className="w-4 h-4" />
                            <span>Upload Banner</span>
                          </button>
                        </div>
                      </div>

                      {/* Profile Information */}
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Display Name
                          </label>
                          <input
                            type="text"
                            defaultValue={displayName}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C15F3C] focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Username
                          </label>
                          <input
                            type="text"
                            defaultValue={handle}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C15F3C] focus:border-transparent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Bio
                          </label>
                          <textarea
                            rows={3}
                            placeholder="Tell us about yourself..."
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C15F3C] focus:border-transparent resize-none"
                          />
                        </div>
                      </div>

                      <button className="bg-[#C15F3C] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#A54F32] transition-colors flex items-center space-x-2">
                        <Save className="w-4 h-4" />
                        <span>Save Changes</span>
                      </button>
                    </div>
                  </div>
                )}

                {/* Account Settings */}
                {activeTab === 'account' && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Account Settings</h2>
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Email Address
                            </label>
                            <input
                              type="email"
                              defaultValue={user.email}
                              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C15F3C] focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Phone Number
                            </label>
                            <input
                              type="tel"
                              placeholder="+1 (555) 123-4567"
                              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C15F3C] focus:border-transparent"
                            />
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Data Export</h3>
                        <p className="text-gray-600 mb-4">Download a copy of your data</p>
                        <button className="bg-blue-500 text-white px-4 py-2 rounded-xl font-medium hover:bg-blue-600 transition-colors flex items-center space-x-2">
                          <Download className="w-4 h-4" />
                          <span>Export Data</span>
                        </button>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-red-600 mb-4">Danger Zone</h3>
                        <div className="border border-red-200 rounded-xl p-4 bg-red-50">
                          <p className="text-red-700 mb-4">Once you delete your account, there is no going back. Please be certain.</p>
                          <button className="bg-red-500 text-white px-4 py-2 rounded-xl font-medium hover:bg-red-600 transition-colors flex items-center space-x-2">
                            <Trash2 className="w-4 h-4" />
                            <span>Delete Account</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Preferences */}
                {activeTab === 'preferences' && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Preferences</h2>
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Appearance</h3>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              {darkMode ? <Moon className="w-5 h-5 text-gray-600" /> : <Sun className="w-5 h-5 text-gray-600" />}
                              <span className="font-medium">Dark Mode</span>
                            </div>
                            <button
                              onClick={() => setDarkMode(!darkMode)}
                              className={`w-12 h-6 rounded-full transition-colors ${
                                darkMode ? 'bg-[#C15F3C]' : 'bg-gray-200'
                              }`}
                            >
                              <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                                darkMode ? 'transform translate-x-6' : 'transform translate-x-1'
                              }`} />
                            </button>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Language</h3>
                        <select
                          value={language}
                          onChange={(e) => setLanguage(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C15F3C] focus:border-transparent"
                        >
                          <option value="English">English</option>
                          <option value="Spanish">Spanish</option>
                          <option value="French">French</option>
                          <option value="German">German</option>
                        </select>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Sound</h3>
                        <div className="space-y-4">
                          <div className="flex items-center space-x-4">
                            <VolumeX className="w-5 h-5 text-gray-600" />
                            <input
                              type="range"
                              min="0"
                              max="100"
                              value={volume}
                              onChange={(e) => setVolume(e.target.value)}
                              className="flex-1"
                            />
                            <Volume2 className="w-5 h-5 text-gray-600" />
                            <span className="text-sm text-gray-600 w-12">{volume}%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Notifications */}
                {activeTab === 'notifications' && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Notification Settings</h2>
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Bell className="w-5 h-5 text-gray-600" />
                          <span className="font-medium">Push Notifications</span>
                        </div>
                        <button
                          onClick={() => setNotifications(!notifications)}
                          className={`w-12 h-6 rounded-full transition-colors ${
                            notifications ? 'bg-[#C15F3C]' : 'bg-gray-200'
                          }`}
                        >
                          <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                            notifications ? 'transform translate-x-6' : 'transform translate-x-1'
                          }`} />
                        </button>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Email Notifications</span>
                          <button className="w-12 h-6 bg-[#C15F3C] rounded-full">
                            <div className="w-5 h-5 bg-white rounded-full transform translate-x-6" />
                          </button>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="font-medium">SMS Notifications</span>
                          <button className="w-12 h-6 bg-gray-200 rounded-full">
                            <div className="w-5 h-5 bg-white rounded-full transform translate-x-1" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Billing */}
                {activeTab === 'billing' && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Billing & Subscription</h2>
                    <div className="space-y-6">
                      <div className="bg-gradient-to-r from-[#FFCEBC] to-[#F59B7B] rounded-2xl p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-xl font-bold text-white mb-2">Current Plan: FOMI Free</h3>
                            <p className="text-white/90">You're using 0% of your daily compute budget</p>
                          </div>
                          <button
                            onClick={() => router.push('/pricing')}
                            className="bg-white text-[#C15F3C] px-4 py-2 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                          >
                            Upgrade Plan
                          </button>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Methods</h3>
                        <button className="bg-[#C15F3C] text-white px-4 py-2 rounded-xl font-medium hover:bg-[#A54F32] transition-colors">
                          Add Payment Method
                        </button>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Billing History</h3>
                        <p className="text-gray-600">No billing history available</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Security */}
                {activeTab === 'security' && (
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Security Settings</h2>
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Password</h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Current Password
                            </label>
                            <div className="relative">
                              <input
                                type={showPassword ? 'text' : 'password'}
                                className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C15F3C] focus:border-transparent"
                              />
                              <button
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                              >
                                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                              </button>
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              New Password
                            </label>
                            <input
                              type="password"
                              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C15F3C] focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Confirm New Password
                            </label>
                            <input
                              type="password"
                              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#C15F3C] focus:border-transparent"
                            />
                          </div>
                          <button className="bg-[#C15F3C] text-white px-4 py-2 rounded-xl font-medium hover:bg-[#A54F32] transition-colors">
                            Update Password
                          </button>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Two-Factor Authentication</h3>
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Enable 2FA</span>
                          <button className="w-12 h-6 bg-gray-200 rounded-full">
                            <div className="w-5 h-5 bg-white rounded-full transform translate-x-1" />
                          </button>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Sessions</h3>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                            <div className="flex items-center space-x-3">
                              <Monitor className="w-5 h-5 text-gray-600" />
                              <div>
                                <p className="font-medium">Windows 10 - Chrome</p>
                                <p className="text-sm text-gray-500">Last active: 2 hours ago</p>
                              </div>
                            </div>
                            <button className="text-red-500 hover:text-red-600">Revoke</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}








