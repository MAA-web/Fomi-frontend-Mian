'use client';

import React from 'react';
import styles from './ImageMarquee.module.css';

const ImageMarquee = () => {
  // Array of image paths for the top row (up folder)
  const topRowImages = [
    '/marque/up/0.jpg',
    '/marque/up/1.jpg',
    '/marque/up/2.jpg',
    '/marque/up/3.jpg',
    '/marque/up/4.jpg',
    '/marque/up/5.jpg',
    '/marque/up/6.jpg',
    '/marque/up/7.jpg',
    '/marque/up/8.png',
    '/marque/up/9.jpg',
    '/marque/up/10.jpg',
    '/marque/up/11.jpg',
    '/marque/up/12.jpg',
    '/marque/up/13.jpg',
    '/marque/up/14.jpg',
    '/marque/up/15.jpg',
    '/marque/up/16.jpg',
    '/marque/up/17.jpg',
    '/marque/up/18.jpg',
    '/marque/up/19.jpg',
    '/marque/up/20.jpg',
    '/marque/up/21.jpg',
    '/marque/up/22.jpg',
    '/marque/up/23.jpg',
    '/marque/up/24.jpg',
  ];

  // Array of image paths for the bottom row (down folder)
  const bottomRowImages = [
    '/marque/down/LXWIj0lx.jpg',
    '/marque/down/Dark Fantasy #edits #walpaper #viral #fyp #art….jpg',
    '/marque/down/WALLPAPERS.jpg',
    '/marque/down/5YXVYcHD.jpg',
    '/marque/down/Click(1).jpg',
    '/marque/down/BnMv6zO8.jpg',
    '/marque/down/cDWSzzk9.jpg',
    '/marque/down/🌿💻 Laptop Aesthetic Wallpaper 🌸🌟.jpg',
    '/marque/down/a_surreal_silhouette_of_a_female_human_head_completely_wrapped_in_dark_fabric_with_vibrant_purple_b_xmjrwx9ui761lm2zx3gf_1.png',
    '/marque/down/ComfyUI_temp_qfvts_00034_.png',
    '/marque/down/ComfyUI_temp_qfvts_00090_.png',
    '/marque/down/ComfyUI_temp_qfvts_00132_.png',
    '/marque/down/ComfyUI_temp_jqvqe_00024_.png',
    '/marque/down/_a_colossal_gothic_fortress_with_towering_spires_and_intricate_black_stone_architecture_rises_omino_bb1c1by5u63p08y0s27e_3.png',
    '/marque/down/a_melancholy_succubus_sitting_in_a_glowing_blue_field_her_translucent_wings_shimmering_pink_horns_c_0mbl8lwt5s3o8v955snv_3.png',
    '/marque/down/c472a72b-d3c0-4b48-96ed-580ba7f3377c.png',
    '/marque/down/6ayskUM8.jpg',
    '/marque/down/5z7z2Zb0.jpg',
    '/marque/down/Воин.jpg',
    '/marque/down/M8ieyxtN.jpg',
    '/marque/down/Confusing the Nebula.jpg',
    '/marque/down/yyAvHob7.jpg',
    '/marque/down/Leonardo_Anime_XL_generate_a_high_quality_image_of_a_samurai_h_1.jpg',
  ];

  const handleImageError = (e) => {
    // Hide the image on error
    e.currentTarget.style.display = 'none';
  };

  return (
    <div className={styles.marqueeContainer}>
      {/* First Row - Moving Left to Right (Top Row - Up Folder) */}
      <div className={styles.marqueeRow}>
        <div className={styles.marqueeLeft}>
          {topRowImages.map((image, index) => (
            <div key={`row1-${index}`} className={styles.marqueeItem}>
              <img
                src={image}
                alt={`Top row image ${index + 1}`}
                className={styles.marqueeImage}
                loading="lazy"
                onError={handleImageError}
              />
            </div>
          ))}
          {/* Duplicate images for seamless loop */}
          {topRowImages.map((image, index) => (
            <div key={`row1-duplicate-${index}`} className={styles.marqueeItem}>
              <img
                src={image}
                alt={`Top row image ${index + 1}`}
                className={styles.marqueeImage}
                loading="lazy"
                onError={handleImageError}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Second Row - Moving Right to Left (Bottom Row - Down Folder) */}
      <div className={styles.marqueeRow}>
        <div className={styles.marqueeRight}>
          {bottomRowImages.slice().reverse().map((image, index) => (
            <div key={`row2-${index}`} className={styles.marqueeItem}>
              <img
                src={image}
                alt={`Bottom row image ${index + 1}`}
                className={styles.marqueeImage}
                loading="lazy"
                onError={handleImageError}
              />
            </div>
          ))}
          {/* Duplicate images for seamless loop */}
          {bottomRowImages.slice().reverse().map((image, index) => (
            <div key={`row2-duplicate-${index}`} className={styles.marqueeItem}>
              <img
                src={image}
                alt={`Bottom row image ${index + 1}`}
                className={styles.marqueeImage}
                loading="lazy"
                onError={handleImageError}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ImageMarquee;

