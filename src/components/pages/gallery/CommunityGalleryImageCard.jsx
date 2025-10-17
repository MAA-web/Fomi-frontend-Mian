"use client";

import { useState } from "react";
import { Heart, Download, Share, User } from "lucide-react";

// Fallback usernames for when user data is not available
export const fallbackUsernames = [
  "CreativeArtist", "DigitalDreamer", "PixelMaster", "ArtWizard", "VisionCraft",
  "ColorExplorer", "DesignGenius", "ImaginationLab", "VisualPoet", "ArtAlchemist",
  "CreativeSoul", "DigitalBrush", "PixelPioneer", "ArtVoyager", "DesignMaven"
];

// Local gallery images for fallback
export const galleryImagesFromFolder = [
  "/gallery/_rx8N2dN.jpg",
  "/gallery/09u0j5ik.jpg",
  "/gallery/15 Attic Bedroom Ideas for Cozy Retreats.jpg",
  "/gallery/3Yz3qNGE.jpg",
  "/gallery/4FkYmwFJ.jpg",
  "/gallery/8_eCINXe.jpg",
  "/gallery/8cUpeDq0.jpg",
  "/gallery/9Hjritoh.jpg",
  "/gallery/Aston Martin.jpg",
  "/gallery/AU32Y9Nh.jpg",
  "/gallery/B_EPaqQC.jpg",
  "/gallery/CC0O4H52.jpg",
  "/gallery/Cherry blossoms fall like the rain.jpg",
  "/gallery/cTlRiZql.jpg",
  "/gallery/Defender V8.jpg",
  "/gallery/feathers.jpg",
  "/gallery/FiR8mCO5.jpg",
  "/gallery/G9WmA6Gh.jpg",
  "/gallery/gallery__a_cyber_ninja_in_a_cyberpunk_style_standing_in_a_post-apocalyptic_desert_at_night_her_back_turned__knz1ivrhz1sefcedt3z1_0.png",
  "/gallery/gallery_carbon-footprint-technology-collage.jpg",
  "/gallery/gallery_freshness-beauty-nature-wet-drops-generated-by-ai.jpg",
  "/gallery/gallery_neon-geometric-background.jpg",
  "/gallery/gallery_view-3d-rasta-bird.jpg",
  "/gallery/gallery_view-half-robot-half-panda-bear-with-futuristic-parts.jpg",
  "/gallery/GAMING SETUP♡.jpg",
  "/gallery/hKTQ3Ws-.jpg",
  "/gallery/JKDvUPO9.jpg",
  "/gallery/kHxtWMIF.jpg",
  "/gallery/Leonardo_Phoenix_10_a_mistshrouded_abandoned_graveyard_at_nigh_3.jpg",
  "/gallery/Leonardo_Phoenix_10_Dark_gothic_alley_at_night_with_glowing_pu_3.jpg",
  "/gallery/Lucid_Realism_A_closeup_of_human_eyes_burning_with_passion_and_0.jpg",
  "/gallery/Lucid_Realism_A_crumbling_rusty_railway_bridge_stretches_acros_0.jpg",
  "/gallery/Lucid_Realism_A_dimly_lit_narrow_stone_corridor_within_a_15th__1.jpg",
  "/gallery/Lucid_Realism_A_dramatic_cliff_in_the_foreground_with_towering_1.jpg",
  "/gallery/Lucid_Realism_a_mystical_torii_gate_entrance_to_a_traditional__2.jpg",
  "/gallery/Lucid_Realism_A_serene_and_elegant_portrait_of_a_mature_woman__0.jpg",
  "/gallery/Lucid_Realism_Craft_a_mesmerizing_double_exposure_photoillustr_1.jpg",
  "/gallery/Lucid_Realism_The_train_coming_to_a_halt_just_meters_before_th_2.jpg",
  "/gallery/Mtb.jpg",
  "/gallery/nNjdgAtp.jpg",
  "/gallery/nPW13t4_.jpg",
  "/gallery/PTn42AAw.jpg",
  "/gallery/q7vxtk7t.jpg",
  "/gallery/RQMQ8fIG.jpg",
  "/gallery/sjsQOADO.jpg",
  "/gallery/U22vERYg.jpg",
  "/gallery/UISYSj4M.jpg",
  "/gallery/UveKUVQz.jpg",
  "/gallery/Wallpaper.jpg",
  "/gallery/Yin And Yang That Gives The Concept Of Life Between Good And Evil Sticker.jpg",
  "/gallery/Yy0a9H1v.jpg",
  "/gallery/zp_DdXvt.jpg",
  "/gallery/Бум.jpg",
  "/gallery/Вихрь темных тонов_ искусство, вызывающее тревогу и надежду.jpg",
  "/gallery/فروهر.jpg"
];

export default function CommunityGalleryImageCard({
  src,
  idx,
  username,
  blurDataURL,
  priority = false,
  openCustomModal,
  prompt = "A stunning AI-generated artwork with creative visual elements and vibrant colors.",
  likes = 0
}) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  const handleImageError = () => {
    setImageError(true);
  };

  const handleClick = () => {
    if (openCustomModal) {
      openCustomModal({
        url: src,
        image_id: idx,
        prompt: prompt,
        user: username ? { first_name: username.split(' ')[0], last_name: username.split(' ')[1] || '' } : null
      }, idx);
    }
  };

  return (
    <div 
      className="break-inside-avoid mb-4 group cursor-pointer"
      onClick={handleClick}
    >
      <div className="relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300">
        {/* Image Container */}
        <div className="relative">
          {!imageLoaded && !imageError && (
            <div className="w-full h-64 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
              <div className="text-gray-400 text-sm text-center px-4">
                Loading...
              </div>
            </div>
          )}
          
          {imageError ? (
            <div className="w-full h-64 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
              <div className="text-gray-400 text-sm text-center px-4">
                Image unavailable
              </div>
            </div>
          ) : (
            <img
              src={src}
              alt={prompt}
              className={`w-full h-auto object-cover transition-opacity duration-300 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={handleImageLoad}
              onError={handleImageError}
              loading={priority ? "eager" : "lazy"}
            />
          )}
          
          {/* Hover overlay with actions */}
          <div className="absolute inset-0 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <div className="flex space-x-3">
              <button 
                className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  // Handle like action
                }}
              >
                <Heart className="w-4 h-4 text-gray-600" />
              </button>
              <button 
                className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  // Handle download action
                  const link = document.createElement('a');
                  link.href = src;
                  link.download = `gallery-image-${idx}.jpg`;
                  link.click();
                }}
              >
                <Download className="w-4 h-4 text-gray-600" />
              </button>
              <button 
                className="w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-50 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  // Handle share action
                  if (navigator.share) {
                    navigator.share({
                      title: 'Check out this AI-generated artwork',
                      text: prompt,
                      url: src
                    });
                  } else {
                    navigator.clipboard.writeText(src);
                  }
                }}
              >
                <Share className="w-4 h-4 text-gray-600" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Image Info */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2 flex-1 min-w-0">
              <div className="w-6 h-6 bg-gradient-to-br from-[#C15F3C] to-[#E8A87C] rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-3 h-3 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700 truncate">
                {username || fallbackUsernames[idx % fallbackUsernames.length]}
              </span>
            </div>
            {likes > 0 && (
              <div className="flex items-center space-x-1 text-gray-600 flex-shrink-0">
                <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                <span className="text-sm font-medium">{likes}</span>
              </div>
            )}
          </div>
          <p className="text-xs text-gray-500 line-clamp-2">
            {prompt}
          </p>
        </div>
      </div>
    </div>
  );
}
