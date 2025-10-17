'use client'

import useFirebaseAuth from "@/lib/hooks/useFirebaseAuth";
import myGenerationsApi from "@/lib/api/mygeneration";
import CommunityGalleryGrid from "@/components/pages/gallery/CommunityGalleryGrid"; // Import the grid component
import ImageModal from "@/components/pages/gallery/ImageModal"; // Import the modal component
import { useState, useEffect } from "react";

export default function MyGallaryPage() {
    const { user, isAuthenticated, getCurrentUser, getIdToken, isLoading } = useFirebaseAuth();
    const [uid, setUid] = useState(null);
    const [generations, setGenerations] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (isAuthenticated) {
                console.log("User is authenticated");
            } else {
                console.log("User is not authenticated yet.");
            }
            const currentUser = await getCurrentUser();
            setUid(currentUser ? currentUser.uid : null);

            const idToken = await getIdToken();

            console.log("Current user (from getCurrentUser):", currentUser);
            console.log("ID Token (from getIdToken):", idToken);
        };

        fetchData();
    }, []);

    useEffect(() => {
        if (uid) {
            myGenerationsApi.getGenerationsByUserId(uid)
                .then(data => {
                    console.log("User gallery data:", data);
                    setGenerations(data);
                })
                .catch(error => {
                    console.error("Error fetching user gallery:", error);
                });
        }
    }, [uid]);

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
        <div>
            <h1>My Gallery Page</h1>
            {uid ? (
                <div>
                    {/* <p>Welcome, {user.email}!</p> */}
                    {generations && (
                        <CommunityGalleryGrid
                            images={generations} // Pass the generations data
                            openCustomModal={openCustomModal} // Pass the modal function
                            visibleCount={50}
                        />
                    )}
                </div>
            ) : (
                <div>Please log in to view your gallery.</div>
            )}
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