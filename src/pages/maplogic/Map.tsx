import { useEffect, useState, useRef } from "react";

const MapPage = () => {
  let newMap: google.maps.Map;
  const harta = useRef<HTMLDivElement>(null);
  const initialPosition = { lat: 47.0122, lng: 28.8605 };
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [poly, setPoly] = useState<google.maps.Polyline | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [polyCoordinates , setPolyCoordinates] = useState<{ lat: number; lng: number }[]>([])

  useEffect(() => {
    if (harta.current) {
      newMap = new google.maps.Map(harta.current, {
        zoom: 12,
        center: initialPosition,
      });

      newMap.addListener("click", (event: google.maps.MapMouseEvent)=> {
        handleMapClick(event);
      });
      setMap(newMap);
      
    }
  }, []);

  useEffect(() => {
    markers.forEach((marker) => {
      const markerPosition = marker.getPosition();
      
      if (markerPosition) {
        
        const markerLat = markerPosition.lat();
        const markerLng = markerPosition.lng();
  
        const newCoordinates = { lat: markerLat, lng: markerLng };
  
        if (
          !polyCoordinates.some(
            (coord) =>
              coord.lat === newCoordinates.lat &&
              coord.lng === newCoordinates.lng
          )
        ) {
          setPolyCoordinates((prevCoordinates: any) => {
            const updatedCoordinates = [...prevCoordinates, newCoordinates];
            return updatedCoordinates;
          });
        }
      }
    });
  }, [markers]);
  

  useEffect(() => {

if(polyCoordinates.length === 2){
  const pathCoordinates = [polyCoordinates[0] ,polyCoordinates[1]]
  
     const firstPoly = new google.maps.Polyline({
          path: pathCoordinates,
          strokeColor: "#000000",
          strokeOpacity: 1.0,
          draggable: true,
          strokeWeight: 2,
        });
        setPoly(firstPoly)
        addPoly(firstPoly)
      }
else if(polyCoordinates.length > 2){
  if (poly) {
    const path = poly.getPath();
    path.clear()

for (let i = 0; i < polyCoordinates.length; i++) {
  const coord = polyCoordinates[i];
  const latLng = new google.maps.LatLng(coord.lat, coord.lng);
  path.push(latLng);
}
addPoly(poly)
  }
}      


  }, [polyCoordinates]);

  

  const handleMapClick = (event: google.maps.MapMouseEvent) => {
    const clickPosition: google.maps.LatLng | null = event.latLng;
  
    if (clickPosition) {
      const newMarker = new google.maps.Marker({
        position: clickPosition,
        title: `${markers.length + 1}`,
        draggable: true,
        map: newMap,
      });
  
      setMarkers((prevMarkers) => {
        const newMarkers = [...prevMarkers, newMarker];
        return newMarkers;
      });
  
    }
  };
  
const addPoly = (poly : google.maps.Polyline ) =>{
  poly.setMap(map);

}

  return <div style={{ height: "100vh", width: "100%" }} ref={harta}></div>;
};

export default MapPage;
