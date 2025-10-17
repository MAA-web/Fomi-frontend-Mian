"use client";

import { useState } from 'react';
import Header from "@/components/layout/Header";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import CommunityGalleryGrid from "@/components/pages/gallery/CommunityGalleryGrid";
import ImageModal from "@/components/pages/gallery/ImageModal";

export default function GalleryPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const totalPages = 5;

  // Handle opening modal with image data
  const openCustomModal = (imageData, index) => {
    setSelectedImage(imageData);
    setSelectedImageIndex(index);
    setIsModalOpen(true);
  };

  // Handle closing modal
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedImage(null);
    setSelectedImageIndex(0);
  };

  // Handle navigation in modal
  const handlePrevious = () => {
    // This would need to be implemented with the actual image list
    // For now, we'll just close the modal
    closeModal();
  };

  const handleNext = () => {
    // This would need to be implemented with the actual image list
    // For now, we'll just close the modal
    closeModal();
  };

  return (
    <div className="min-h-screen bg-[#fbfaf7]">
      <Header />
      
      <div className="px-10 pt-6">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-4xl mx-auto">
            <input
              type="text"
              placeholder="Search community gallery..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-6 py-4 bg-white rounded-2xl border border-gray-200 shadow-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C15F3C] focus:border-transparent"
            />
            <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          </div>
        </div>

        {/* Community Gallery Grid */}
        <div className="mb-12">
          <CommunityGalleryGrid
            blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
            openCustomModal={openCustomModal}
            visibleCount={50}
          />
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-center space-x-4 mb-8">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          </button>
          
          <span className="text-sm text-gray-600 font-medium">
            {currentPage}/{totalPages}
          </span>
          
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center border border-gray-200 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Image Modal */}
      <ImageModal
        isOpen={isModalOpen}
        onClose={closeModal}
        imageData={selectedImage}
        currentIndex={selectedImageIndex}
        onPrevious={handlePrevious}
        onNext={handleNext}
        hasPrevious={false} // Would need to be calculated based on actual image list
        hasNext={false} // Would need to be calculated based on actual image list
      />
    </div>
  );
}




