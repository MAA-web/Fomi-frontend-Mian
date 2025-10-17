"use client";

import { useEffect, useState } from "react";
import {
  X,
  Heart,
  Download,
  Share,
  User,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ImageModal({
  isOpen,
  onClose,
  imageData,
  currentIndex,
  onPrevious,
  onNext,
  hasPrevious,
  hasNext,
}) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Body scroll lock
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";
    return () => (document.body.style.overflow = "unset");
  }, [isOpen]);

  // Reset state on new image
  useEffect(() => {
    if (isOpen && imageData) {
      setImageLoaded(false);
      setImageError(false);
    }
  }, [isOpen, imageData]);

  const handleImageLoad = () => setImageLoaded(true);
  const handleImageError = () => setImageError(true);

  const handleDownload = () => {
    if (imageData?.url) {
      const link = document.createElement("a");
      link.href = imageData.url;
      link.download = `gallery-image-${imageData.image_id || currentIndex}.jpg`;
      link.click();
    }
  };

  const handleShare = async () => {
    if (!imageData?.url) return;
    try {
      if (navigator.share) {
        await navigator.share({
          title: "Check out this AI-generated artwork",
          text: imageData.prompt || "A stunning AI-generated artwork",
          url: imageData.url,
        });
      } else {
        await navigator.clipboard.writeText(imageData.url);
        alert("Image link copied to clipboard!");
      }
    } catch (err) {
      console.log("Error sharing:", err);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isOpen) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && hasPrevious) onPrevious();
      if (e.key === "ArrowRight" && hasNext) onNext();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, hasPrevious, hasNext]);

  return (
    <AnimatePresence>
      {isOpen && imageData && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }} // fade-out
            transition={{ duration: 0.3 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            key="modal"
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 30 }} // fade + slide-down
            transition={{ duration: 0.35, ease: "easeInOut" }}
          >
            <div
              className="relative z-10 w-[90%] max-w-6xl max-h-[90vh] bg-neutral-900/90 backdrop-blur-xl rounded-2xl shadow-2xl flex flex-col md:flex-row overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-3 right-3 z-20 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Left Side — Details */}
              <motion.div
                key="details"
                className="flex flex-col justify-between p-6 md:w-1/2 w-full text-white overflow-y-auto"
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                <div>
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-[#C15F3C] to-[#E8A87C] rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-medium">
                      {imageData.user
                        ? `${imageData.user.first_name} ${imageData.user.last_name}`
                        : imageData.username || "Anonymous Artist"}
                    </span>
                  </div>

                  {imageData.prompt && (
                    <p className="text-gray-200 mb-6 leading-relaxed">
                      {imageData.prompt}
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-3">
                  <motion.button
                      whileTap={{ scale: 0.9 }}
                      whileHover={{ scale: 1.05 }}
                      onClick={() => {}}
                      className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all"
                    >
                      <Heart
                        className={`w-5 h-5 ${
                          imageData.isLiked ? "fill-red-500 text-red-500" : "text-white"
                        }`}
                      />
                      <span className="text-sm">
                        {imageData.likes
                          ? `${imageData.likes} ${imageData.likes === 1 ? "like" : "likes"}`
                          : "0 likes"}
                      </span>
                    </motion.button>

                  <button
                    onClick={handleDownload}
                    className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all"
                  >
                    <Download className="w-4 h-4" />
                    <span className="text-sm">Download</span>
                  </button>

                  <button
                    onClick={handleShare}
                    className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all"
                  >
                    <Share className="w-4 h-4" />
                    <span className="text-sm">Share</span>
                  </button>
                </div>
              </motion.div>

              {/* Right Side — Image */}
              <motion.div
                key="image"
                className="md:w-1/2 w-full flex items-center justify-center bg-black/40"
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 30 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                {!imageLoaded && !imageError && (
                  <div className="w-80 h-80 bg-gray-800 rounded-lg flex items-center justify-center">
                    <div className="text-white text-center">
                      <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-3"></div>
                      <p>Loading...</p>
                    </div>
                  </div>
                )}

                {imageError ? (
                  <div className="w-80 h-80 bg-gray-800 rounded-lg flex items-center justify-center text-white">
                    Image unavailable
                  </div>
                ) : (
                  <img
                    src={imageData.url}
                    alt={imageData.prompt || "Gallery image"}
                    className={`max-h-[85vh] object-contain transition-opacity duration-300 rounded-lg ${
                      imageLoaded ? "opacity-100" : "opacity-0"
                    }`}
                    onLoad={handleImageLoad}
                    onError={handleImageError}
                  />
                )}
              </motion.div>

              {/* Navigation Arrows */}
              {hasPrevious && (
                <button
                  onClick={onPrevious}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
              )}
              {hasNext && (
                <button
                  onClick={onNext}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center text-white"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}