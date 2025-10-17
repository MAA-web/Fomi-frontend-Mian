"use client";

import { useState, useEffect, useRef } from 'react';
import { Home, ImageIcon, Video, Wrench, Edit, Palette, Folder, GalleryHorizontalEnd, HelpCircle, Wand2, Users, Box, User, Square, Settings, CreditCard, Bug, LogOut, Sun, Moon, Sparkles, Bookmark } from "lucide-react"
import { Dock, DockIcon } from '../ui/dock';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import CreditsDisplay from '../ui/CreditsDisplay';
import generationApi from '../../lib/api/generation';
import { useTheme } from '../../lib/ThemeContext';

export default function Header() {
  const [showHomeDropdown, setShowHomeDropdown] = useState(false);
  const [showImageDropdown, setShowImageDropdown] = useState(false);
  const [showVideoDropdown, setShowVideoDropdown] = useState(false);
  const [showAssetsDropdown, setShowAssetsDropdown] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [firebaseId, setFirebaseId] = useState(null);
  const homeDropdownRef = useRef(null);
  const imageDropdownRef = useRef(null);
  const videoDropdownRef = useRef(null);
  const assetsDropdownRef = useRef(null);
  const userMenuRef = useRef(null);
  const pathname = usePathname();
  const dropdownTimeoutRef = useRef(null);
  const imageDropdownTimeoutRef = useRef(null);
  const videoDropdownTimeoutRef = useRef(null);
  const assetsDropdownTimeoutRef = useRef(null);
  const { isDarkMode, toggleTheme } = useTheme();

  // Common styles for interactive elements
  const iconStyle = "w-[22px] h-[22px] text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white cursor-pointer transition-colors hover:bg-transparent"
  const buttonStyle = "text-[10px] text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"

  const router = useRouter();

  // Get Firebase ID for credits display
  useEffect(() => {
    const getFirebaseId = async () => {
      try {
        const id = await generationApi.getFirebaseId();
        setFirebaseId(id);
      } catch (error) {
        console.error('Error getting Firebase ID:', error);
      }
    };
    getFirebaseId();
  }, []);

  const navigateToImageGen = () => {
    console.log('🚀 Navigating to ImageGen');
    router.push('/ImageGen');
    setTimeout(() => setShowHomeDropdown(false), 100);
  };

  const navigateToMyGenerations = () => {
    setShowUserMenu(false);
    router.push('/mygenerations');
  };

  const navigateToGallery = () => {
    router.push('/gallery');
  };

  const navigateToEnhance = () => {
    setShowHomeDropdown(false);
    router.push('/Upscale');
  };

  const navigateToTrain = () => {
    setShowHomeDropdown(false);
    router.push('/train');
  };

  const navigateToVideo = () => {
    setShowHomeDropdown(false);
    router.push('/video');
  };

  const navigateToInpaint = () => {
    setShowHomeDropdown(false);
    router.push('/inpaint');
  };

  const navigateToEdit = () => {
    setShowHomeDropdown(false);
    router.push('/edit');
  };

  const navigateToCanvas = () => {
    setShowHomeDropdown(false);
    router.push('/canvas');
  };

  const navigateToPricing = () => {
    setShowUserMenu(false);
    router.push('/pricing');
  };

  const navigateToProfile = () => {
    setShowUserMenu(false);
    router.push('/profile');
  };

  const navigateToSettings = () => {
    setShowUserMenu(false);
    router.push('/settings');
  };

  const navigateToHome = () => {
    router.push('/');
  };

  const toggleHomeDropdown = () => {
    // Only allow dropdown on homepage
    if (pathname === '/') {
      setShowHomeDropdown(!showHomeDropdown);
    }
  };

  const openHomeDropdown = () => {
    // Only allow dropdown on homepage
    if (pathname === '/') {
      // Clear any existing timeout
      if (dropdownTimeoutRef.current) {
        clearTimeout(dropdownTimeoutRef.current);
      }
      setShowHomeDropdown(true);
    }
  };

  const closeHomeDropdown = () => {
    // Set a timeout to close the dropdown after a delay
    dropdownTimeoutRef.current = setTimeout(() => {
      setShowHomeDropdown(false);
    }, 300); // 300ms delay
  };

  const keepDropdownOpen = () => {
    // Clear the timeout when hovering over the dropdown
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }
  };

  // Image dropdown handlers
  const openImageDropdown = () => {
    if (imageDropdownTimeoutRef.current) {
      clearTimeout(imageDropdownTimeoutRef.current);
    }
    setShowImageDropdown(true);
  };

  const closeImageDropdown = () => {
    imageDropdownTimeoutRef.current = setTimeout(() => {
      setShowImageDropdown(false);
    }, 300);
  };

  const keepImageDropdownOpen = () => {
    if (imageDropdownTimeoutRef.current) {
      clearTimeout(imageDropdownTimeoutRef.current);
    }
  };

  // Video dropdown handlers
  const openVideoDropdown = () => {
    if (videoDropdownTimeoutRef.current) {
      clearTimeout(videoDropdownTimeoutRef.current);
    }
    setShowVideoDropdown(true);
  };

  const closeVideoDropdown = () => {
    videoDropdownTimeoutRef.current = setTimeout(() => {
      setShowVideoDropdown(false);
    }, 300);
  };

  const keepVideoDropdownOpen = () => {
    if (videoDropdownTimeoutRef.current) {
      clearTimeout(videoDropdownTimeoutRef.current);
    }
  };

  // Assets dropdown handlers
  const openAssetsDropdown = () => {
    if (assetsDropdownTimeoutRef.current) {
      clearTimeout(assetsDropdownTimeoutRef.current);
    }
    setShowAssetsDropdown(true);
  };

  const closeAssetsDropdown = () => {
    assetsDropdownTimeoutRef.current = setTimeout(() => {
      setShowAssetsDropdown(false);
    }, 300);
  };

  const keepAssetsDropdownOpen = () => {
    if (assetsDropdownTimeoutRef.current) {
      clearTimeout(assetsDropdownTimeoutRef.current);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showHomeDropdown && homeDropdownRef.current && !homeDropdownRef.current.contains(event.target)) {
        setShowHomeDropdown(false);
      }
      if (showImageDropdown && imageDropdownRef.current && !imageDropdownRef.current.contains(event.target)) {
        setShowImageDropdown(false);
      }
      if (showVideoDropdown && videoDropdownRef.current && !videoDropdownRef.current.contains(event.target)) {
        setShowVideoDropdown(false);
      }
      if (showAssetsDropdown && assetsDropdownRef.current && !assetsDropdownRef.current.contains(event.target)) {
        setShowAssetsDropdown(false);
      }
      if (showUserMenu && userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      try {
        document.removeEventListener('mousedown', handleClickOutside);
      } catch (error) {
        console.warn('Error during event listener cleanup:', error);
      }
    };
  }, [showHomeDropdown, showImageDropdown, showVideoDropdown, showAssetsDropdown, showUserMenu]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (dropdownTimeoutRef.current) {
        clearTimeout(dropdownTimeoutRef.current);
      }
      if (imageDropdownTimeoutRef.current) {
        clearTimeout(imageDropdownTimeoutRef.current);
      }
      if (videoDropdownTimeoutRef.current) {
        clearTimeout(videoDropdownTimeoutRef.current);
      }
      if (assetsDropdownTimeoutRef.current) {
        clearTimeout(assetsDropdownTimeoutRef.current);
      }
    };
  }, []);

  // Close dropdown when navigating away from homepage
  useEffect(() => {
    if (pathname !== '/') {
      setShowHomeDropdown(false);
    }
  }, [pathname]);
  
  return (
    // <header className="top-0 py-8 relative max-w-full px-4 z-[1000]">
    <header className="relative top-0 left-0 max-w-full h-[57px] z-100">

      <div className="flex items-center justify-between max-w-full">
        {/* Logo - Left side */}
        <div className="flex items-center flex-shrink-0 cursor-pointer px-4 py-3" onClick={() => router.push('/')}>
          <img src="/FomiIcon.png" alt="logo" className="w-[21px] h-[34px] object-cover" />
        </div>

          {/* Navigation Icons - Centered absolutely with dock effect */}
         <div className="z-1000 absolute left-1/2 transform -translate-x-1/2 -translate-y-2">
            <Dock 
              className="gap-[57px] p-0 rounded-xl "
              iconSize={22}
              iconMagnification={32}
              iconDistance={200}
              style={{}}
            >
          {/* white bar above the buttons */}
         <div className='bg-[#f6e9e3] w-full h-[10px] rounded-2xl absolute top-2'></div>
              
            <DockIcon>
              <div className="pt-4 relative group hover:bg-transparent" style={{ background: 'transparent' }}>
                <div className="relative inline-block hover:bg-transparent" style={{ background: 'transparent' }}>

                  {/* Animated line above icon on hover */}
                  <div className={`absolute top-[-16px] rounded-2xl left-1/2 -translate-x-1/2 w-[67px] h-[11px] group-hover:bg-[#fae1d4] ${pathname === '/' ? 'bg-[#fcd5c1]' : ''}`}></div>
   
                  <Home 
                    className={`${iconStyle} ${pathname === '/' ? 'hover:text-gray-900' : ''}`}
                    onMouseEnter={openHomeDropdown}
                    onMouseLeave={closeHomeDropdown}
                    onClick={navigateToHome}
                  />
                </div>
              </div>
            </DockIcon>
            <DockIcon>
              <div className="pt-4 relative group hover:bg-transparent" ref={imageDropdownRef} style={{ background: 'transparent' }}>
                <div className="relative inline-block hover:bg-transparent" style={{ background: 'transparent' }}>
                  {/* Animated line above icon on hover */}
                  {/* <span className="absolute -top-1 left-0 w-full h-[2px] bg-gradient-to-r from-[#C15F3C] to-[#F59B7B] transform scale-x-0 origin-right transition-transform duration-300 ease-out group-hover:scale-x-100 group-hover:origin-left"></span> */}
                  <div className={`absolute top-[-16px] rounded-2xl left-1/2 -translate-x-1/2 w-[67px] h-[11px] group-hover:bg-[#fae1d4] ${pathname === '/ImageGen' ? 'bg-[#fcd5c1]' : ''}`}></div>
                  
                  <ImageIcon 
                    className={iconStyle} 
                    onMouseEnter={openImageDropdown}
                    onMouseLeave={closeImageDropdown}
                    onClick={navigateToImageGen}
                  />
                </div>
              </div>
            </DockIcon>
            <DockIcon>
              <div className="relative pt-4 group hover:bg-transparent" ref={videoDropdownRef} style={{ background: 'transparent' }}>
                <div className="relative inline-block hover:bg-transparent" style={{ background: 'transparent' }}>
                  {/* Animated line above icon on hover */}
                  {/* <span className="absolute -top-1 left-0 w-full h-[2px] bg-gradient-to-r from-[#C15F3C] to-[#F59B7B] transform scale-x-0 origin-right transition-transform duration-300 ease-out group-hover:scale-x-100 group-hover:origin-left"></span> */}
                  <div className={`absolute top-[-16px] rounded-2xl left-1/2 -translate-x-1/2 w-[67px] h-[11px] group-hover:bg-[#fae1d4] ${pathname === '/video' ? 'bg-[#fcd5c1]' : ''}`}></div>

                  <Video 
                    className={iconStyle} 
                    onMouseEnter={openVideoDropdown}
                    onMouseLeave={closeVideoDropdown}
                    onClick={navigateToVideo}
                  />
                </div>
              </div>
            </DockIcon>
            <DockIcon>
              <div className="relative pt-4 group hover:bg-transparent" ref={assetsDropdownRef} style={{ background: 'transparent' }}>
                <div className="relative inline-block hover:bg-transparent" style={{ background: 'transparent' }}>
                  {/* Animated line above icon on hover */}
                  {/* <span className="absolute -top-1 left-0 w-full h-[2px] bg-gradient-to-r from-[#C15F3C] to-[#F59B7B] transform scale-x-0 origin-right transition-transform duration-300 ease-out group-hover:scale-x-100 group-hover:origin-left"></span> */}
                  <div className={`absolute top-[-15px] rounded-2xl left-1/2 -translate-x-1/2 w-[67px] h-[11px] group-hover:bg-[#fae1d4] ${pathname === '/train' ? 'bg-[#fcd5c1]' : ''}`}></div>

                  <Box 
                    className={iconStyle} 
                    onMouseEnter={openAssetsDropdown}
                    onMouseLeave={closeAssetsDropdown}
                  />
                  
                </div>
              </div>
            </DockIcon>
          </Dock>
        </div>

        {/* Right side elements */}
        <div className="flex items-center pt-4 space-x-4 flex-shrink-0 px-6 py-3">
          {/* Credits Display */}
          {/* <CreditsDisplay size="small" firebaseId={firebaseId} /> */}
          
          <button className="py-[6px] px-[8px] shrink-0 border-1 rounded-[7.25px] bg-[#FCF7F5] border-[#F4F3EE] flex items-center space-x-1 cursor-pointer" onClick={navigateToGallery}>
            <GalleryHorizontalEnd className={iconStyle} />
            <span className={buttonStyle}>Gallery</span>
          </button>

          <button 
            className="py-[6px] px-[8px] shrink-0 border-1 rounded-[7.25px] bg-[#FCF7F5] border-[#F4F3EE] flex items-center space-x-1"
            onClick={() => router.push('/collections')}
          >
            <Bookmark className={iconStyle} />
            <span className={buttonStyle}>Collections</span>
          </button>

          <button 
            className="flex items-center space-x-1"
            onClick={toggleTheme}
            aria-label="Toggle dark mode"
          >
            {isDarkMode ? (
              <Sun className={iconStyle} />
            ) : (
              <Moon className={iconStyle} />
            )}
          </button>
          <div className="relative" ref={userMenuRef}>
            <button 
              className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-purple-600 transition-colors"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <User className="w-4 h-4 text-white" />
            </button>
            
            {/* User Menu Dropdown */}
            {showUserMenu && (
              <div className="absolute top-full right-0 mt-2 w-64 backdrop-blur-xl bg-white/90 dark:bg-gray-800/90 rounded-xl shadow-2xl border border-orange-200/40 dark:border-orange-700/40 py-2 z-[99999]">
                {/* Menu Items */}
                <div className="px-2">
                  <button 
                    className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-orange-50/60 dark:hover:bg-orange-900/30 rounded-lg transition-colors cursor-pointer"
                    onClick={navigateToProfile}
                  >
                    <User className="w-4 h-4" />
                    <span>View Profile</span>
                  </button>
                  <button 
                    className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-orange-50/60 dark:hover:bg-orange-900/30 rounded-lg transition-colors cursor-pointer"
                    onClick={navigateToSettings}
                  >
                    <Settings className="w-4 h-4" />
                    <span>Manage Account</span>
                  </button>
                  <button 
                    className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-orange-50/60 dark:hover:bg-orange-900/30 rounded-lg transition-colors cursor-pointer"
                    onClick={navigateToPricing}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Plans & Pricing</span>
                  </button>
                  <button className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-orange-50/60 dark:hover:bg-orange-900/30 rounded-lg transition-colors cursor-pointer"
                    onClick={navigateToMyGenerations}>
                    <Wand2 className="w-4 h-4" />
                    <span>Your Generations</span>
                  </button>
                  <button className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-orange-50/60 dark:hover:bg-orange-900/30 rounded-lg transition-colors cursor-pointer">
                    <Bug className="w-4 h-4" />
                    <span>Report a Bug</span>
                  </button>
                </div>
                
                {/* Divider */}
                <div className="border-t border-gray-100 dark:border-gray-700 my-2"></div>
                
                {/* Credits Display */}
                <div className="px-4 py-2">
                  <CreditsDisplay size="default" showRefreshButton={true} firebaseId={firebaseId} />
                </div>
                
                {/* Divider */}
                <div className="border-t border-gray-100 dark:border-gray-700 my-2"></div>
                
                {/* Logout */}
                <div className="px-2">
                  <button className="w-full flex items-center space-x-3 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors cursor-pointer">
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Home Dropdown Menu - Outside dock structure */}
      {showHomeDropdown && (
        <div 
          ref={homeDropdownRef}
          className="fixed top-24 left-1/2 transform -translate-x-1/2 backdrop-blur-xl bg-[#f9f3f0]/90 dark:bg-gray-800/90 rounded-xl shadow-2xl border border-orange-200/40 dark:border-orange-700/40 py-6 min-w-[600px] z-[99999]"
          onMouseEnter={keepDropdownOpen}
          onMouseLeave={closeHomeDropdown}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="grid grid-cols-3 gap-8 px-6">
            {/* Generate Column */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Generate</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-2 hover:bg-orange-50/70 dark:hover:bg-orange-900/40 cursor-pointer rounded-lg transition-colors" onClick={navigateToImageGen}>
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                    <ImageIcon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Image</span>
                </div>
                
                <div className="flex items-center gap-3 p-2 hover:bg-orange-50/70 dark:hover:bg-orange-900/40 cursor-pointer rounded-lg transition-colors" onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); navigateToVideo(); }}>
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                    <Video className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Video</span>
                </div>
                
                <div className="flex items-center gap-3 p-2 hover:bg-orange-50/70 dark:hover:bg-orange-900/40 cursor-pointer rounded-lg transition-colors" onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); navigateToCanvas(); }}>
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-300 to-blue-500 flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Canvas</span>
                </div>
              </div>
            </div>

            {/* Edit Column */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Edit</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-2 hover:bg-orange-50/70 dark:hover:bg-orange-900/40 cursor-pointer rounded-lg transition-colors" onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); navigateToEnhance(); }}>
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center">
                    <Wand2 className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Upscale</span>
                </div>
                
                <div className="flex items-center gap-3 p-2 hover:bg-orange-50/70 dark:hover:bg-orange-900/40 cursor-pointer rounded-lg transition-colors" onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); navigateToEdit(); }}>
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                    <Edit className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Edit</span>
                </div>
                
                <div className="flex items-center gap-3 p-2 hover:bg-orange-50/70 dark:hover:bg-orange-900/40 cursor-pointer rounded-lg transition-colors" onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); navigateToInpaint(); }}>
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center">
                    <Palette className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Inpaint</span>
                </div>
              </div>
            </div>

            {/* Assets Column */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Assets</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-2 hover:bg-orange-50/70 dark:hover:bg-orange-900/40 cursor-pointer rounded-lg transition-colors" onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); navigateToTrain(); }}>
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                    <Folder className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Train</span>
                </div>
                
                <div className="flex items-center gap-3 p-2 hover:bg-orange-50/70 dark:hover:bg-orange-900/40 cursor-pointer rounded-lg transition-colors" onClick={() => router.push('/characters')}>
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Consistent Characters</span>
                </div>
                
                <div className="flex items-center gap-3 p-2 hover:bg-orange-50/70 dark:hover:bg-orange-900/40 cursor-pointer rounded-lg transition-colors" onClick={() => router.push('/3d')}>
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                    <Box className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">3D</span>
                </div>
                
                <div className="flex items-center gap-3 p-2 hover:bg-orange-50/70 dark:hover:bg-orange-900/40 cursor-pointer rounded-lg transition-colors" onClick={() => router.push('/avatar')}>
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Avatar</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Dropdown Menu */}
      {showImageDropdown && (
        <div 
          className="fixed top-24 left-1/2 transform -translate-x-1/2 backdrop-blur-xl bg-[#f9f3f0]/90 dark:bg-gray-800/90 rounded-xl shadow-2xl border border-orange-200/40 dark:border-orange-700/40 py-6 min-w-[250px] z-[99999]"
          onMouseEnter={keepImageDropdownOpen}
          onMouseLeave={closeImageDropdown}
        >
          <div className="px-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-2 hover:bg-orange-50/70 dark:hover:bg-orange-900/40 cursor-pointer rounded-lg transition-colors" onClick={navigateToImageGen}>
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                  <ImageIcon className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Image Generation</span>
              </div>
              
              <div className="flex items-center gap-3 p-2 hover:bg-orange-50/70 dark:hover:bg-orange-900/40 cursor-pointer rounded-lg transition-colors" onClick={navigateToEnhance}>
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center">
                  <Wand2 className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Upscale</span>
              </div>
              
              <div className="flex items-center gap-3 p-2 hover:bg-orange-50/70 dark:hover:bg-orange-900/40 cursor-pointer rounded-lg transition-colors" onClick={navigateToEdit}>
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center">
                  <Edit className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Edit Image</span>
              </div>
              
              <div className="flex items-center gap-3 p-2 hover:bg-orange-50/70 dark:hover:bg-orange-900/40 cursor-pointer rounded-lg transition-colors" onClick={navigateToInpaint}>
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-pink-400 to-pink-600 flex items-center justify-center">
                  <Palette className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Inpaint</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Video Dropdown Menu */}
      {showVideoDropdown && (
        <div 
          className="fixed top-24 left-1/2 transform -translate-x-1/2 backdrop-blur-xl bg-[#f9f3f0]/90 dark:bg-gray-800/90 rounded-xl shadow-2xl border border-orange-200/40 dark:border-orange-700/40 py-6 min-w-[250px] z-[99999]"
          onMouseEnter={keepVideoDropdownOpen}
          onMouseLeave={closeVideoDropdown}
        >
          <div className="px-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-2 hover:bg-orange-50/70 dark:hover:bg-orange-900/40 cursor-pointer rounded-lg transition-colors" onClick={navigateToVideo}>
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
                  <Video className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Video Generation</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assets Dropdown Menu */}
      {showAssetsDropdown && (
        <div 
          className="fixed top-24 left-1/2 transform -translate-x-1/2 backdrop-blur-xl bg-[#f9f3f0]/90 dark:bg-gray-800/90 rounded-xl shadow-2xl border border-orange-200/40 dark:border-orange-700/40 py-6 min-w-[250px] z-[99999]"
          onMouseEnter={keepAssetsDropdownOpen}
          onMouseLeave={closeAssetsDropdown}
        >
          <div className="px-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-2 hover:bg-orange-50/70 dark:hover:bg-orange-900/40 cursor-pointer rounded-lg transition-colors" onClick={navigateToTrain}>
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                  <Folder className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Train</span>
              </div>
              
              <div className="flex items-center gap-3 p-2 hover:bg-orange-50/70 dark:hover:bg-orange-900/40 cursor-pointer rounded-lg transition-colors" onClick={() => router.push('/characters')}>
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Consistent Characters</span>
              </div>
              
              <div className="flex items-center gap-3 p-2 hover:bg-orange-50/70 dark:hover:bg-orange-900/40 cursor-pointer rounded-lg transition-colors" onClick={() => router.push('/3d')}>
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center">
                  <Box className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">3D</span>
              </div>
              
              <div className="flex items-center gap-3 p-2 hover:bg-orange-50/70 dark:hover:bg-orange-900/40 cursor-pointer rounded-lg transition-colors" onClick={() => router.push('/avatar')}>
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">Avatar</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  )
}
