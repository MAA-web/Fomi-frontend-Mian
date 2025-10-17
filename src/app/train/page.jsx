"use client";

import { useState } from "react";
import Header from "@/components/layout/Header";
import FlashCardStack from "@/components/pages/train/FlashCardStack";
import { Sparkles, Image as ImageIcon, ChevronDown } from "lucide-react";
import { Poppins } from "next/font/google";

// Example with image URLs
const images1 = [
  "/collage/img1.png",
  "/collage/img2.png",
  "/collage/img3.png",
];

// Import Poppins font using Next.js font optimization
const poppins = Poppins({ subsets: ["latin"], weight: ["400", "500", "600", "700"] });

export default function Train() {
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);

  const [selectedModel, setSelectedModel] = useState("Select Model");
  const [selectedAdvance, setSelectedAdvance] = useState("Advance");
  const [selectedTrainedModel, setSelectedTrainedModel] = useState("Select trained model to Start Generating");

  const [advanceOpen, setAdvanceOpen] = useState(false);
  const [modelOpen, setModelOpen] = useState(false);
  const [trainedOpen, setTrainedOpen] = useState(false);

  const [steps, setSteps] = useState(5);
  const [learningRate, setLearningRate] = useState(0.005);
  const [modelName, setModelName] = useState("");

  const handleAddImages = (e) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files);
    if (images.length + newFiles.length > 15) {
      alert("You can upload a maximum of 15 images.");
      return;
    }

    setUploading(true);
    setTimeout(() => {
      setImages((prev) => [...prev, ...newFiles]);
      setUploading(false);
    }, 1200);
  };

  const handleTrain = () => {
    if (images.length < 6) {
      alert("Please upload at least 6 images to start training.");
      return;
    }
    console.log("Training with images:", images);
    console.log("Advance options:", { steps, learningRate, modelName });
  };

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

  const gridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(4, 80px)",
    gridAutoRows: "80px",
    gap: "1rem",
    margin: "0.5rem 0.5rem 1rem 0.5rem",
    background: "#fefdfb",
    borderRadius: "2rem",
    padding: "3rem",
    overflowY: "auto",
    alignItems: "start",
    justifyContent: "center",
    justifyItems: "center",
    position: "relative",
    fontFamily: poppins.style.fontFamily,
  };

  const sliderContainer = {
    display: "flex",
    alignItems: "center",
    gap: "1rem",
    margin: "0.5rem 0.5rem 0.5rem 0.5rem",
  };

const sliderStyle = {
  flexGrow: 1,
  height: "4px",
  margin: "0",
  WebkitAppearance: "none",
  appearance: "none",
  background: "#ffcab0",
  borderRadius: "10px",
  outline: "none",
};

  const labelStyle = { width: "100px", textAlign: "left" };
  const valueStyle = { width: "50px", textAlign: "right" };

  return (
    <div style={{ minHeight: "100vh", padding: "0.1rem", background: "#fbfaf6", fontFamily: poppins.style.fontFamily }}>

<style>{`
  /* Common Thumb Styles */
  input[type="range"].custom-slider::-webkit-slider-thumb,
  input[type="range"].steps-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: white;
    cursor: pointer;
    border: 2px solid #CD7F63;
    box-shadow: 0 2px 4px rgba(0,0,0,0.15);
    margin-top: -6px; /* vertically center the thumb on the track */
    position: relative;
  }

  input[type="range"].custom-slider::-moz-range-thumb,
  input[type="range"].steps-slider::-moz-range-thumb {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: white;
    cursor: pointer;
    border: 2px solid #CD7F63;
    box-shadow: 0 2px 4px rgba(0,0,0,0.15);
    vertical-align: middle; /* center thumb in Firefox */
  }

  /* Track Styles */
  input[type="range"].custom-slider::-webkit-slider-runnable-track,
  input[type="range"].steps-slider::-webkit-slider-runnable-track {
    height: 4px;
    background: #CD7F63;
    border-radius: 10px;
  }

  input[type="range"].custom-slider::-moz-range-track,
  input[type="range"].steps-slider::-moz-range-track {
    height: 4px;
    background: #CD7F63;
    border-radius: 10px;
  }

  /* Optional: remove extra margin for Firefox */
  input[type="range"].custom-slider,
  input[type="range"].steps-slider {
    height: 16px; /* ensures the container height matches thumb */
  }
`}</style>

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
      minHeight: "150px",
      margin: "1rem 1rem 1rem 1rem",
      overflow: "visible",
    }}
  >
    <div style={{ position: "relative", height: "250px" }}>
      {/* Scrollable Grid */}
      <div
        style={{
          ...gridStyle,
          height: "100%",
          overflowY: "visible",
          paddingBottom: "0",
          overflow: "visible",
        }}
      >
      {images.length === 0 && !uploading ? (
        <div
          style={{
            position: "absolute",
            top: "40%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: "0.5rem",
            textAlign: "center",
            color: "#555",
            width: "200px",   // increased to accommodate larger cards with fan spread
            height: "250px",  // increased height
            pointerEvents: "none",
          }}
        >
          <FlashCardStack images={images1} />
          <span
            style={{
              fontSize: "0.9rem",
              userSelect: "none",
            }}
          >
            Upload 6 to 15 images
          </span>
        </div>
      ) : (    
          images.map((img, idx) => (
                  <div key={idx} style={{ position: "relative", width: "100%", height: "100%" }}>
                    <img
                      src={URL.createObjectURL(img)}
                      alt={`Uploaded ${idx}`}
                      style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: "0.3rem" }}
                    />
                    <button
                      onClick={() => setImages(images.filter((_, i) => i !== idx))}
                      style={{
                        position: "absolute",
                        top: "5px",
                        right: "5px",
                        background: "rgba(0,0,0,0.6)",
                        color: "#fefdfb",
                        border: "none",
                        borderRadius: "2rem",
                        width: "24px",
                        height: "24px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      x
                    </button>
                  </div>
                ))
              )}

              {uploading && (
                <div
                  className="absolute inset-0 flex flex-col items-center justify-center bg-black/20 rounded-xl z-50"
                  style={{ gridColumn: "span 6" }}
                >
                  <ImageIcon className="w-12 h-12 text-gray-200 mb-2" />
                  <span className="text-gray-100 font-medium">Uploading images...</span>
                </div>
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
                multiple
                accept="image/*"
                id="imageUpload"
                style={{ display: "none" }}
                onChange={handleAddImages}
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
                <ImageIcon className="w-5 h-5 mr-1" /> Add Images
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
          </div>

          {/* Dropdowns */}
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem", fontFamily: poppins.style.fontFamily, margin: "1rem 1rem 1rem 1rem" }}>

          {/* Model Dropdown */}
          <div style={glassStyle}>
            <div
              style={{
                width: "20px",
                height: "30px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                cursor: "pointer",
                padding: "0.5rem 0.75rem",
                borderRadius: "1rem",
                transition: "background 0.3s ease",
              }}
              onClick={() => setModelOpen(!modelOpen)}
              onMouseEnter={(e) => (e.currentTarget.style.background = "#f7f7f7")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            >
              <span style={{ flexGrow: 1 }}>{selectedModel}</span>
              <div
                style={{
                  width: "20px",
                  height: "15px",
                  borderRadius: "30%",
                  background: "#F5F5F5",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  transition: "transform 0.3s ease",
                  transform: modelOpen ? "rotate(180deg)" : "rotate(0deg)",
                }}
              >
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>

            <div
              style={{
                maxHeight: modelOpen ? "200px" : "0",
                opacity: modelOpen ? 1 : 0,
                overflow: "hidden",
                transition: "all 0.4s cubic-bezier(0.25, 1, 0.5, 1)",
                marginTop: modelOpen ? "0.5rem" : "0",
                background: "#fefdfb",
                borderRadius: "1rem",
                boxShadow: modelOpen ? "0 4px 12px rgba(0,0,0,0.1)" : "none",
              }}
            >
              {["Chroma", "Flux"].map((opt) => (
                <div
                  key={opt}
                  style={{
                    padding: "0.6rem",
                    cursor: "pointer",
                    textAlign: "center",
                    borderRadius: "1rem",
                    transition: "background 0.2s ease, transform 0.15s ease",
                    width: "350px"
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f0f0")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  onClick={() => setSelectedModel(opt)}
                >
                  {opt}
                </div>
              ))}
            </div>
          </div>

            {/* Advance Dropdown */}
            <div style={glassStyle}>
              <div
                style={{
                  width: "20px",
                  height: "30px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "100%",
                  cursor: "pointer",
                }}
                onClick={() => setAdvanceOpen(!advanceOpen)}
              >
                <span style={{ flexGrow: 1 }}>{selectedAdvance}</span>
                <div
                  style={{
                    width: "20px",
                    height: "15px",
                    borderRadius: "30%",
                    background: "#F5F5F5",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "transform 0.3s ease",
                    transform: advanceOpen ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                >
                  <ChevronDown className="w-4 h-4" />
                </div>
              </div>

              <div
                style={{
                  maxHeight: advanceOpen ? "250px" : "0",
                  overflowY: advanceOpen ? "auto" : "hidden",
                  transition: "max-height 0.3s ease, padding 0.3s ease",
                  display: "flex",
                  flexDirection: "column",
                  width: "100%",
                  marginTop: advanceOpen ? "0.5rem" : "0",
                  background: advanceOpen ? "#fff" : "transparent",
                  borderRadius: advanceOpen ? "1.5rem" : "0",
                  padding: advanceOpen ? "0.75rem" : "0",
                  gap: "0.5rem",
                  scrollbarWidth: "thin",
                  scrollbarColor: "#ff8800 #f0f0f0",
                }}
              >
              {/* Model Name row */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginBottom: "0.5rem",
                  gap: "0.75rem",
                }}
              >
                <span
                  style={{
                    fontWeight: 500,
                    fontSize: "0.9rem",
                    color: "#333",
                    minWidth: "90px",
                    textAlign: "right",
                  }}
                >
                  Model name
                </span>
                <input
                  type="text"
                  value={modelName}
                  onChange={(e) => setModelName(e.target.value)}
                  placeholder="Enter unique model name"
                  style={{
                    padding: "0.6rem 0.8rem",
                    borderRadius: "0.5rem",
                    border: "2px solid black",
                    outline: "none",
                    fontSize: "0.9rem",
                    fontFamily: "inherit",
                    backgroundColor: "white",
                    transition: "border-color 0.2s ease",
                    width: "100%",
                    maxWidth: "350px",
                    width: "350px", 
                  }}
                />
              </div>

                {/* Steps slider */}
                <div style={sliderContainer}>
                  <span style={labelStyle}>Steps</span>
                  <input
                    type="range"
                    className="steps-slider"
                    min="500"
                    max="5000"
                    step="1"
                    value={steps}
                    onChange={(e) => setSteps(Number(e.target.value))}
                    style={{
                      height: "4px",
                      flexGrow: 1,
                      margin: "0",
                      WebkitAppearance: "none",
                      appearance: "none",
                      background: "#ffcab0",
                      borderRadius: "10px",
                      outline: "none",
                    }}
                  />
                  <span style={valueStyle}>{steps}</span>
                </div>

                {/* Learning Rate slider */}
                <div style={sliderContainer}>
                  <span style={labelStyle}>Learning rate</span>
                  <input
                    type="range"
                    className="custom-slider"
                    min="0"
                    max="0.1"
                    step="0.0001"
                    value={learningRate}
                    onChange={(e) => setLearningRate(Number(e.target.value))}
                    style={{
                      height: "4px",
                      flexGrow: 1,
                      margin: "0",
                      WebkitAppearance: "none",
                      appearance: "none",
                      background: "#ffcab0",
                      borderRadius: "10px",
                      outline: "none",
                    }}
                  />
                  <span style={valueStyle}>{learningRate}</span>
                </div>
              </div>
            </div>
            
              {/* Trained Models Dropdown */}
              <div style={glassStyle}>
                <div
                  style={{
                    width: "20px",
                    height: "30px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "100%",
                    cursor: "pointer",
                  }}
                  onClick={() => setTrainedOpen(!trainedOpen)}
                >
                  <span style={{ flexGrow: 1 }}>{selectedTrainedModel}</span>
                  <div
                    style={{
                      width: "20px",
                      height: "15px",
                      borderRadius: "30%", // circular background
                      background: "#F5F5F5", // light gray circle
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "transform 0.3s ease",
                      transform: trainedOpen ? "rotate(180deg)" : "rotate(0deg)", // rotate when open
                    }}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
                {trainedOpen && (
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      marginTop: "0.5rem",
                      background: "#fefdfb",
                      borderRadius: "2rem",
                    }}
                  >
                    {["Custom Model 1", "Custom Model 2", "Custom Model 3"].map((opt) => (
                      <div
                        key={opt}
                        style={{
                          padding: "0.5rem",
                          cursor: "pointer",
                          textAlign: "center",
                        }}
                        onClick={() => setSelectedTrainedModel(opt)}
                      >
                        {opt}
                      </div>
                    ))}
                  </div>
                )}
              </div>
          </div>
        </div>
      </div>
    </div>
  );
}
