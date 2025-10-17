"use client";

import { useState } from "react";
import Header from "@/components/layout/Header";
import FlashCardStack from "@/components/pages/train/FlashCardStack";
import { Sparkles, Image as ImageIcon } from "lucide-react";
import { Poppins } from "next/font/google";

const images1 = ["/collage/img1.png", "/collage/img2.png", "/collage/img3.png"];
const poppins = Poppins({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

export default function Train() {
  const [image, setImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  const glassStyle = {
    borderRadius: "2rem",
    background: "#fefdfb",
    padding: "0.45rem 1rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#000",
    fontSize: "1rem",
    cursor: "pointer",
    textAlign: "center",
    overflow: "hidden",
    transition: "all 0.3s ease",
    flexDirection: "column",
    fontFamily: poppins.style.fontFamily,
  };

  const handleAddImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    setTimeout(() => {
      setImage(file);
      setUploading(false);
    }, 1200);
  };

  const handleTrain = () => {
    if (!image) {
      alert("Please upload an image before training.");
      return;
    }
    console.log("Training with image:", image);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        padding: "0.1rem",
        background: "#fbfaf6",
        fontFamily: poppins.style.fontFamily,
      }}
    >
      <Header />

      <div style={{ display: "flex", justifyContent: "center", marginTop: "5rem" }}>
        <div
          style={{
            width: "80%",
            maxWidth: "600px",
            borderRadius: "2rem",
            padding: "0.5rem",
            background: "#F9F3F0",
            fontFamily: poppins.style.fontFamily,
            minHeight: "350px",
            margin: "1rem",
            overflow: "visible",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "1rem",
              textAlign: "center",
              color: "#555",
              width: "220px",
              height: "280px",
              pointerEvents: "none",
            }}
          >
            {image ? (
              <img
                src={URL.createObjectURL(image)}
                alt="Uploaded"
                style={{
                  width: "200px",
                  height: "260px",
                  objectFit: "cover",
                  borderRadius: "10px",
                  border: "3px solid #E8D3C1",
                  boxShadow: "0 6px 15px rgba(0,0,0,0.2)",
                }}
              />
            ) : (
              <>
                <FlashCardStack images={images1} />
                <span style={{ fontSize: "0.9rem", userSelect: "none" }}>
                  Upload one image to start training
                </span>
              </>
            )}
          </div>

          {/* Buttons at bottom-right */}
          <div
            style={{
              position: "absolute",
              bottom: "10px",
              right: "10px",
              display: "flex",
              gap: "1rem",
            }}
          >
            <input
              type="file"
              accept="image/*"
              id="imageUpload"
              style={{ display: "none" }}
              onChange={handleAddImage}
            />
            <button
              style={{
                ...glassStyle,
                flexDirection: "row",
                background: "#f5f5f5",
                minWidth: "140px",
                height: "36px",
              }}
              onClick={() => document.getElementById("imageUpload")?.click()}
            >
              <ImageIcon className="w-5 h-5 mr-1" /> Add Image
            </button>
            <button
              style={{
                ...glassStyle,
                flexDirection: "row",
                background: "#f5f5f5",
                minWidth: "140px",
                height: "36px",
              }}
              onClick={handleTrain}
            >
              <Sparkles className="w-5 h-5 mr-1" /> Train
            </button>
          </div>

          {uploading && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(0,0,0,0.2)",
                borderRadius: "2rem",
                zIndex: 50,
              }}
            >
              <ImageIcon className="w-12 h-12 text-gray-200 mb-2" />
              <span className="text-gray-100 font-medium">Uploading image...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}