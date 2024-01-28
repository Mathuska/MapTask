import { useEffect, useState, useRef } from "react";

const MapPage = () => {
  const initialPosition = { lat: 47.0122, lng: 28.8605 };
  const harta = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  let newMap : google.maps.Map;
  let poly: google.maps.Polyline;


  useEffect(() => {

    if (harta.current) {
       newMap = new google.maps.Map(harta.current, {
        zoom: 12,
        center: initialPosition,
      });

      poly = new google.maps.Polyline({
        strokeColor: "#000000",
        strokeOpacity: 1.0,
        strokeWeight: 3,
      });
      poly.setMap(newMap);

      newMap.addListener("click", handleMapClick);
      setMap(newMap);
    }
  }, []);

  const handleMapClick = (event: google.maps.MapMouseEvent) => {
    const path = poly.getPath();
    const clickPosition = event.latLng;

    if(clickPosition !== null){
      path.push(clickPosition);
}

  new google.maps.Marker({
  position: clickPosition,
  title: "#" + path.getLength(),
  map: newMap,
});     

};

  return <div style={{ height: "100vh", width: "100%" }} ref={harta}></div>;
};

export default MapPage;