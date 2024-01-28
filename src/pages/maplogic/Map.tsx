import { useEffect, useState, useRef } from "react";

const MapPage = () => {
  let newMap: google.maps.Map;
  const harta = useRef<HTMLDivElement>(null);
  const initialPosition = { lat: 47.0122, lng: 28.8605 };
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [polyCoordinates, setPolyCoordinates] = useState<{ lat: number; lng: number }[]>([])

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
      const markerLat = marker.getPosition()?.lat();
      const markerLng = marker.getPosition()?.lng();

      if (markerLat !== undefined && markerLng !== undefined) {
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
    const markerPoly = new google.maps.Polyline({
        path: pathCoordinates,
        geodesic: true,
        strokeColor: "#000000",
        strokeOpacity: 1.0,
        strokeWeight: 2,
      });
      markerPoly.setMap(map);
    }else if(polyCoordinates.length === 3){
      const pathCoordinates = [polyCoordinates[0] ,polyCoordinates[1] , polyCoordinates[2] , polyCoordinates[0]]

      const polyTriangle = new google.maps.Polygon({
        paths: pathCoordinates,
        strokeColor: "#000000",
        strokeOpacity: 1,
        strokeWeight: 2,
        fillColor: "#000000",
        fillOpacity: 0.35,
      });
    
      polyTriangle.setMap(map);
    }
  }, [polyCoordinates]);

  const handleMapClick = (event: google.maps.MapMouseEvent) => {
    const clickPosition = event.latLng;

    
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
  };

  return <div style={{ height: "100vh", width: "100%" }} ref={harta}></div>;
};

export default MapPage;
