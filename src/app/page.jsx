'use client';

import Image from 'next/image';
import Lottie from 'lottie-react';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Palette, Users, Box, User, Square, ChevronDown, ChevronUp, Heart } from 'lucide-react';
import Header  from '../components/layout/Header';
// import Header1  from '../components/layout/Header1';
import ImageMarquee from '../components/pages/homepage/ImageMarquee';
import Footer from '../components/pages/homepage/Footer';
import EditShowcase from '../components/pages/homepage/EditShowcase';
import Text2ImgShowcase from '../components/pages/homepage/Text2ImgShowcase';
import UpscaleShowcase from '../components/pages/homepage/UpscaleShowcase';
import VideoShowcase from '../components/pages/homepage/VideoShowcase';
import VideoUpscaleShowcase from '../components/pages/homepage/VideoUpscaleShowcase';
import Img2VideoShowcase from '../components/pages/homepage/Img2VideoShowcase';
import ConsistentCharactersShowcase from '../components/pages/homepage/ConsistentCharactersShowcase';
import styles from './homepage.module.css';

// Import Lottie animations
import trainAnimation from '/public/icons/train.json';
import imageAnimation from '/public/icons/image.json';
import videoAnimation from '/public/icons/video.json';
import editAnimation from '/public/icons/edit.json';
import upscaleAnimation from '/public/icons/upscale.json';

export default function HomePage() {
  const [hoveredButton, setHoveredButton] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);
  const [loadingGallery, setLoadingGallery] = useState(true);
  const router = useRouter();

  // Fetch community gallery images
  useEffect(() => {
    const fetchGalleryImages = async () => {
      try {
        const response = await fetch('https://api.tarum.ai/asset-service/community/dummy-gallery-23');
        if (!response.ok) throw new Error('Failed to fetch gallery');
        const data = await response.json();
        // Take first 20 images for homepage
        setGalleryImages(data.slice(0, 20));
        setLoadingGallery(false);
      } catch (error) {
        console.error('Failed to load gallery images:', error);
        setGalleryImages([]);
        setLoadingGallery(false);
      }
    };

    fetchGalleryImages();
  }, []);

  // Feature information data
  const featureData = {
    train: {
      word: "train",
      pronunciation: "/treɪn/",
      description: "Train your own AI models with custom datasets to create personalized content that matches your unique style and requirements.",
      route: "/train"
    },
    image: {
      word: "image",
      pronunciation: "/ˈɪmɪdʒ/",
      description: "Generate stunning AI images from text descriptions using advanced machine learning models with multiple style options.",
      route: "/ImageGen"
    },
    video: {
      word: "video",
      pronunciation: "/ˈvɪdioʊ/",
      description: "Create dynamic AI-generated videos from text prompts with smooth motion and high quality output.",
      route: "/video"
    },
    edit: {
      word: "edit",
      pronunciation: "/ˈedɪt/",
      description: "Edit and modify your AI-generated images with precision tools and advanced editing capabilities.",
      route: "/edit"
    },
    enhance: {
      word: "enhance",
      pronunciation: "/ɪnˈhæns/",
      description: "Upscale and enhance your images to higher resolutions with AI-powered quality improvement.",
      route: "/Upscale"
    }
  };

  const handleFeatureClick = (featureKey) => {
    setSelectedFeature(featureKey);
  };

  const handleFeatureNavigation = (route) => {
    router.push(route);
  };

  const navigateToImageGen = () => {
    router.push('/ImageGen');
  };

  const navigateToTrain = () => {
    router.push('/train');
  };

  const navigateToGallery = () => {
    router.push('/gallery');
  };

  const navigateToCanvas = () => {
    router.push('/canvas');
  };

  const navigateToInpaint = () => {
    router.push('/inpaint');
  };

  const navigateToEdit = () => {
    router.push('/edit');
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
    
    // Smooth scroll down when expanding
    if (!isExpanded) {
      setTimeout(() => {
        window.scrollTo({
          top: window.scrollY + 200,
          behavior: 'smooth'
        });
      }, 150); // Reduced delay for more responsive feel
    }
  };

  return (
    <div className={`${styles.container} px-4`}>
      <Header />


      {/* Main Content */}
      <main className={styles.main}>
        {/* Content Area */}
        <div className={styles.content}>
          {/* Title Section */}
          <div className={styles.titleSection}>
            <h1 className={styles.title}>Figment of my imagination</h1>
            <div className={styles.subtitle}>
              Let's <button className={styles.exploreBtn}>Explore</button> FOMI
            </div>
          </div>

          {/* Image Gallery */}
          <div className={styles.gallery}>
            {/* Hero Image - Centered */}
            <div className={styles.heroImage}>
              {/* EditShowcase - positioned on the left */}
              <div style={{ position: 'absolute', left: '280px', top: '20%', transform: 'translateY(-50%)' }}>
                <EditShowcase />
              </div>
              {/* Text2ImgShowcase - positioned on the right */}
              <div style={{ position: 'absolute', left: '130px', top: '105%', transform: 'translateY(-50%)' }}>
                <Text2ImgShowcase />
              </div>
              {/* UpscaleShowcase - positioned to replace Rectangle 22 */}
              <div style={{ position: 'absolute', left: '320px', top: '110%', transform: 'translateY(-50%)' }}>
                <UpscaleShowcase />
              </div>
              {/* VideoUpscaleShowcase - new video comparison showcase */}
              <div style={{ position: 'absolute', right: '110px', top: '130%', transform: 'translateY(-50%)' }}>
                <VideoUpscaleShowcase />
              </div>
              {/* VideoShowcase - positioned to replace Group 5 */}
              <div style={{ position: 'absolute', right: '220px', top: '70%', transform: 'translateY(-50%)' }}>
                <VideoShowcase />
              </div>
              {/* ConsistentCharactersShowcase - slideshow showcase */}
              <div style={{ position: 'absolute', left: '550px', top: '140%', transform: 'translateY(-50%)' }}>
                <ConsistentCharactersShowcase />
              </div>
              <Image src="/collage/5.png" alt="Hero Image" width={400} height={240} className={styles.imageContent} />
            </div>

            {/* Action Buttons Layout */}
            <div className={`${styles.actionButtonsLayout} ${isExpanded ? styles.expanded : ''}`}>
              <div className={`${styles.leftButtonGroup} ${isExpanded ? styles.compact : ''}`}>
                <button 
                  className={`${styles.actionButton} ${isExpanded ? styles.compactButton : ''}`}
                  onMouseEnter={() => setHoveredButton('train')}
                  onMouseLeave={() => setHoveredButton(null)}
                  onClick={() => handleFeatureClick('train')}
                >
                  <div className={`${styles.iconContainer} ${styles.train}`}>
                    <Lottie 
                      animationData={trainAnimation} 
                      className={styles.lottieIcon}
                      loop={hoveredButton === 'train'}
                      autoplay={hoveredButton === 'train'}
                      style={{ width: '36px', height: '36px' }}
                    />
                  </div>
                  <span>Train</span>
                </button>
                <button 
                  className={`${styles.actionButton} ${isExpanded ? styles.compactButton : ''}`}
                  onMouseEnter={() => setHoveredButton('image')}
                  onMouseLeave={() => setHoveredButton(null)}
                  onClick={() => handleFeatureClick('image')}
                >
                  <div className={`${styles.iconContainer} ${styles.image}`}>
                    <Lottie 
                      animationData={imageAnimation} 
                      className={styles.lottieIcon}
                      loop={hoveredButton === 'image'}
                      autoplay={hoveredButton === 'image'}
                      style={{ width: '36px', height: '36px' }}
                    />
                  </div>
                  <span>Image</span>
                </button>
                <button 
                  className={`${styles.actionButton} ${isExpanded ? styles.compactButton : ''}`}
                  onMouseEnter={() => setHoveredButton('video')}
                  onMouseLeave={() => setHoveredButton(null)}
                  onClick={() => handleFeatureClick('video')}
                >
                  <div className={`${styles.iconContainer} ${styles.video}`}>
                    <Lottie 
                      animationData={videoAnimation} 
                      className={styles.lottieIcon}
                      loop={hoveredButton === 'video'}
                      autoplay={hoveredButton === 'video'}
                      style={{ width: '36px', height: '36px' }}
                    />
                  </div>
                  <span>Video</span>
                </button>
                
                {/* Additional buttons for left side when expanded */}
                {isExpanded && (
                  <>
                    <button 
                      className={styles.sideButton}
                      onMouseEnter={() => setHoveredButton('inpaint')}
                      onMouseLeave={() => setHoveredButton(null)}
                      onClick={navigateToInpaint}
                    >
                      <div className={`${styles.iconContainer} ${styles.inpaint}`}>
                        <Palette className={styles.additionalIcon} />
                      </div>
                      <span>Inpaint</span>
                    </button>
                    <button 
                      className={styles.sideButton}
                      onMouseEnter={() => setHoveredButton('characters')}
                      onMouseLeave={() => setHoveredButton(null)}
                    >
                      <div className={`${styles.iconContainer} ${styles.characters}`}>
                        <Users className={styles.additionalIcon} />
                      </div>
                      <span>Consistent Characters</span>
                    </button>
                    <button 
                      className={styles.sideButton}
                      onMouseEnter={() => setHoveredButton('3d')}
                      onMouseLeave={() => setHoveredButton(null)}
                    >
                      <div className={`${styles.iconContainer} ${styles.threeD}`}>
                        <Box className={styles.additionalIcon} />
                      </div>
                      <span>3D</span>
                    </button>
                  </>
                )}
              </div>
              
              <div className={`${styles.centerImageContainer} ${isExpanded ? styles.expandedCenter : ''}`}>
                <Image src="/collage/Rectangle.png" alt="Center Image" width={800} height={550} className={styles.centerImage} />
                
                {/* Feature Information Display - Direct Text on Center Image */}
                {selectedFeature && featureData[selectedFeature] && (
                  <>
                    {/* Word and Pronunciation */}
                    <div className={styles.featureWordOverlay}>
                      {featureData[selectedFeature].word}
                    </div>
                    <div className={styles.featurePronunciationOverlay}>
                      {featureData[selectedFeature].pronunciation}
                    </div>
                    
                    {/* Simple Description */}
                    <div className={styles.featureDescriptionOverlay}>
                      {featureData[selectedFeature].description}
                    </div>
                    
                    {/* White Pill Button - Bottom Right */}
                    <button 
                      className={styles.featurePillButton}
                      onClick={() => handleFeatureNavigation(featureData[selectedFeature].route)}
                    >
                      Try {featureData[selectedFeature].word}
                    </button>
                  </>
                )}
                
                {/* Scattered Collage Images Around Center Image */}
                <div className={styles.collageImage} style={{ position: 'absolute', top: '-430px', right: '110px', zIndex: 5 }}>
                  <Image src="/collage/hero/Rectangle 21.png" alt="Collage 2" width={140} height={105} className={styles.collageImg} style={{ width: '120px', height: '170px' }} />
                </div>
                {/* Img2VideoShowcase - positioned to replace Rectangle 28 w.r.t to center image*/}
                <div style={{ position: 'absolute', top: '-90px', left: '75%', transform: 'translateX(-50%)' }}>
                  <Img2VideoShowcase /> 
                </div>
                
                <button 
                  className={styles.expandButton}
                  onClick={toggleExpanded}
                  onMouseEnter={() => setHoveredButton('expand')}
                  onMouseLeave={() => setHoveredButton(null)}
                >
                  {isExpanded ? (
                    <ChevronUp className={styles.expandIcon} />
                  ) : (
                    <ChevronDown className={styles.expandIcon} />
                  )}
                </button>
              </div>
              
              <div className={`${styles.rightButtonGroup} ${isExpanded ? styles.compact : ''}`}>
                <button 
                  className={`${styles.actionButton} ${isExpanded ? styles.compactButton : ''}`}
                  onMouseEnter={() => setHoveredButton('enhance')}
                  onMouseLeave={() => setHoveredButton(null)}
                  onClick={() => handleFeatureClick('enhance')}
                >
                  <div className={`${styles.iconContainer} ${styles.enhance}`}>
                    <Lottie 
                      animationData={upscaleAnimation} 
                      className={styles.lottieIcon}
                      loop={hoveredButton === 'enhance'}
                      autoplay={hoveredButton === 'enhance'}
                      style={{ width: '36px', height: '36px' }}
                    />
                  </div>
                  <span>Upscale</span>
                </button>
                <button 
                  className={`${styles.actionButton} ${isExpanded ? styles.compactButton : ''}`}
                  onMouseEnter={() => setHoveredButton('edit')}
                  onMouseLeave={() => setHoveredButton(null)}
                  onClick={() => handleFeatureClick('edit')}
                >
                  <div className={`${styles.iconContainer} ${styles.edit}`}>
                    <Lottie 
                      animationData={editAnimation} 
                      className={styles.lottieIcon}
                      loop={hoveredButton === 'edit'}
                      autoplay={hoveredButton === 'edit'}
                      style={{ width: '36px', height: '36px' }}
                    />
                  </div>
                  <span>Edit</span>
                </button>
                <button 
                  className={`${styles.actionButton} ${isExpanded ? styles.compactButton : ''}`}
                  onMouseEnter={() => setHoveredButton('train2')}
                  onMouseLeave={() => setHoveredButton(null)}
                  onClick={() => handleFeatureClick('train')}
                >
                  <div className={`${styles.iconContainer} ${styles.train}`}>
                    <Lottie 
                      animationData={trainAnimation} 
                      className={styles.lottieIcon}
                      loop={hoveredButton === 'train2'}
                      autoplay={hoveredButton === 'train2'}
                      style={{ width: '36px', height: '36px' }}
                    />
                  </div>
                  <span>Train</span>
                </button>
                
                {/* Additional buttons for right side when expanded */}
                {isExpanded && (
                  <>
                    <button 
                      className={styles.sideButton}
                      onMouseEnter={() => setHoveredButton('avatar')}
                      onMouseLeave={() => setHoveredButton(null)}
                    >
                      <div className={`${styles.iconContainer} ${styles.avatar}`}>
                        <User className={styles.additionalIcon} />
                      </div>
                      <span>Avatar</span>
                    </button>
                    <button 
                      className={styles.sideButton}
                      onMouseEnter={() => setHoveredButton('canvas')}
                      onMouseLeave={() => setHoveredButton(null)}
                      onClick={navigateToCanvas}
                    >
                      <div className={`${styles.iconContainer} ${styles.canvas}`}>
                        <Square className={styles.additionalIcon} />
                      </div>
                      <span>Canvas</span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Pinterest-Style Gallery */}
            <div className={styles.gallerySection}>
              <div className={styles.galleryHeader}>
                <h2 className={styles.galleryTitle}>Community Gallery</h2>
                <p className={styles.gallerySubtitle}>Discover amazing AI-generated artwork from our creative community</p>
              </div>
              
              {loadingGallery ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-8 h-8 border-4 border-[#C15F3C] border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : galleryImages.length > 0 ? (
                <div className={styles.pinterestGallery}>
                  {galleryImages.map((image, index) => (
                    <div key={index} className={styles.pinterestItem}>
                      <div className={styles.imageWrapper}>
                        <img 
                          src={image.url} 
                          alt={image.prompt} 
                          className={styles.pinterestImage}
                          loading={index < 4 ? "eager" : "lazy"}
                        />
                        <div className={styles.imageOverlay}>
                          <div className={styles.artistName}>
                            {image.username}
                          </div>
                          <div className="flex items-center space-x-1">
                            <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                            <span className={styles.likesCount}>{image.likes}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No gallery images available</p>
                </div>
              )}
            </div>
          </div>
          
          {/* Gallery Call-to-Action Section */}
          <div className={styles.galleryCallToAction}>
            <div className={styles.galleryContent}>
              <h2 className={styles.galleryTitle}>Explore art by talent around the World</h2>
              <button className={styles.openGalleryButton} onClick={navigateToGallery}>
                Open Gallery
              </button>
            </div>
          </div>
        </div>
      </main>
      
      {/* Image Marquee */}
      <ImageMarquee />
      
      {/* Footer */}
      <Footer />
    </div>
  );
}