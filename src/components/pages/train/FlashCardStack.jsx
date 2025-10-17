"use client";

import React, { useEffect, useState } from "react";

const FlashCardStack = ({ images }) => {
  const [slideIn, setSlideIn] = useState([false, false, false]);

  useEffect(() => {
    if (images && images.length > 0) {
      images.slice(0, 3).forEach((_, idx) => {
        setTimeout(() => {
          setSlideIn((prev) => {
            const next = [...prev];
            next[idx] = true;
            return next;
          });
        }, idx * 150);
      });
    }
  }, [images]);

  if (!images || images.length === 0) {
    return (
      <div
        style={{
          width: "80px",
          height: "110px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          border: "2px dashed #ccc",
          borderRadius: "8px",
          margin: "0.5rem auto",
          color: "#555",
          textAlign: "center",
          fontWeight: "bold",
          fontSize: "0.6rem",
        }}
      >
        Upload images
      </div>
    );
  }

  return (
    <div
      style={{
        position: "relative",
        width: "100px",
        height: "130px",
        perspective: "1000px",
        margin: "0.5rem auto",
        overflow: "visible",
      }}
    >
      {images.slice(0, 3).map((img, idx) => {
        const zIndex = idx === 0 ? 3 : idx === 1 ? 2 : 1;

        let rotateDeg = 0;
        let translateX = 0;

        if (idx !== 0) {
          const direction = idx === 1 ? -1 : 1;
          rotateDeg = slideIn[idx] ? direction * 10 : 0;
          translateX = slideIn[idx] ? direction * 20 : 0;
        }

        const style = {
          position: "absolute",
          width: "100%",
          height: "100%",
          borderRadius: "8px",
          overflow: "hidden",
          top: 0,
          left: 0,
          zIndex,
          cursor: "pointer",
          border: "4px solid #F5E9E4",
          boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
          transform: `rotate(${rotateDeg}deg) translateX(${translateX}px)`,
          transformOrigin: "center bottom",
          transition: "transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
          backgroundColor: "#fff",
        };

        return (
          <div key={idx} style={style}>
            <img
              src={typeof img === "string" ? img : URL.createObjectURL(img)}
              alt={`Card ${idx}`}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: "8px",
              }}
            />
          </div>
        );
      })}
    </div>
  );
};

export default FlashCardStack;