// Slider.js
import React, { useState, useEffect } from "react";

const Slider = ({ images }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // auto-slide every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex(prev =>
        prev === images.length - 1 ? 0 : prev + 1
      );
    }, 4000);
    return () => clearInterval(interval);
  }, [images.length]);

  if (images.length === 0) return null;

  return (
    <div style={{ position: "relative", height: "400px", overflow: "hidden" }}>
      <img
        src={`http://localhost:5000/${images[currentIndex].imageUrl}`} // adjust for your backend path
        alt={images[currentIndex].caption}
        style={{
          width: "100%",
          height: "400px",
          objectFit: "cover",
          transition: "0.5s"
        }}
      />
      {images[currentIndex].caption && (
        <div style={{
          position: "absolute",
          bottom: "20px",
          left: "20px",
          background: "rgba(0,0,0,0.5)",
          color: "#fff",
          padding: "8px 16px",
          borderRadius: "4px"
        }}>
          {images[currentIndex].caption}
        </div>
      )}
    </div>
  );
};

export default Slider;
