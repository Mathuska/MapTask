import React from "react";
import Map from "./pages/Map"

const App = () => {
  const chisinau: google.maps.LatLngLiteral = { lat: 47.0122, lng: 28.8605 };
  return (
    <div>
      <Map center={chisinau} />
    </div>
  );
};

export default App;
