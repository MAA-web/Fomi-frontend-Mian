"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import Masonry from "react-masonry-css";
import CommunityGalleryImageCard, { fallbackUsernames } from "./CommunityGalleryImageCard";

const CommunityGalleryGrid = ({
  blurDataURL,
  openCustomModal,
  usernames = fallbackUsernames,
}) => {
  const [images, setImages] = useState([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const loaderRef = useRef(null);

  // 👇 Fetch function — simulates paginated fetching
  const fetchImages = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);

    try {
      const res = await fetch(
        `https://api.tarum.ai/asset-service/community/dummy-gallery-23`,
        { headers: { "Content-Type": "application/json" } }
      );

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = await res.json();

      // Transform to match expected card data
      const newImages = data.map((item, idx) => ({
        url: item.url,
        image_id: `${page}-${idx}`,
        prompt: item.prompt,
        likes: item.likes,
        username: item.username,
        type: item.type,
      }));

      // If no new data came back, stop loading more
      if (newImages.length === 0) {
        setHasMore(false);
        return;
      }

      // Append new batch to previous images
      setImages((prev) => [...prev, ...newImages]);
      setPage((prev) => prev + 1);
    } catch (err) {
      console.error("❌ Failed to fetch:", err);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [page, loading, hasMore]);

  // 👇 Intersection Observer — triggers fetch when near bottom
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first.isIntersecting && hasMore && !loading) {
          fetchImages();
        }
      },
      { threshold: 0.5 } // trigger slightly before bottom
    );

    const currentLoader = loaderRef.current;
    if (currentLoader) observer.observe(currentLoader);

    return () => {
      if (currentLoader) observer.unobserve(currentLoader);
    };
  }, [fetchImages, hasMore, loading]);

  // 👇 Initial fetch
  useEffect(() => {
    fetchImages();
  }, []);

  return (
    <div>
      <Masonry
        breakpointCols={{ default: 5, 1200: 4, 900: 3, 600: 2, 0: 1 }}
        className="my-masonry-grid gap-4"
        columnClassName="my-masonry-grid_column"
      >
        {images.map((img, idx) => (
          <CommunityGalleryImageCard
            key={img.image_id || idx}
            src={img.url}
            idx={idx}
            username={img.username || usernames[idx % usernames.length]}
            blurDataURL={blurDataURL}
            priority={idx === 0}
            openCustomModal={() => openCustomModal(img, idx)}
            prompt={img.prompt}
            likes={img.likes}
          />
        ))}
      </Masonry>

      {/* 👇 Scroll trigger + loading indicator */}
      <div ref={loaderRef} className="flex justify-center py-10">
        {loading && (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#C15F3C]"></div>
            <p className="text-gray-500 mt-2">Loading more images...</p>
          </div>
        )}
        {!hasMore && !loading && (
          <p className="text-gray-400 text-sm mt-4">🎉 No more images to load.</p>
        )}
      </div>
    </div>
  );
};

export default CommunityGalleryGrid;
