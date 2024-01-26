import React, { useRef, useEffect } from "react";

const MapPage = () => {
  const harta = useRef(null);

  useEffect(() => {
    if (harta.current) {
      const map = new window.google.maps.Map(harta.current, {
        center: { lat: 47.0122, lng: 28.8605 }, 
        zoom: 8, 
      });
    }
  }, [harta]);
  return (
  <div ref={harta} style={{ width: "100%", height: "100vh" }}>
    
  </div>
  );
};

export default MapPage;
