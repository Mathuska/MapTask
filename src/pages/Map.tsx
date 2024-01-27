import { useRef, useState , useEffect } from "react";
import { APIProvider } from "@vis.gl/react-google-maps";
import { Marker } from '../interfaces/mapinterfaces';

const MapPage = () => {
  const initialPosition = { lat: 47.0122, lng: 28.8605 };
  const harta = useRef<HTMLDivElement>(null)
  const [markers, setMarkers] = useState<Marker[]>([]);
  
      
  useEffect(() => {
    if (harta.current) {
      const map = new google.maps.Map(harta.current, {
        zoom: 12,
        center: initialPosition,
      });
      map.addListener("click", (event : any) => {
        handleMapClick(event);
      });
    }
  }, []);

  const handleMapClick = (event: any) => {
    const position = {lat : event.latLng.lat() , lng :event.latLng.lng() }
        
        console.log(position);
  };

  return (
    <APIProvider apiKey={"AIzaSyDRsvFP1wiFpD2tkrz_a2XGNR1bR79PR3s"}>
      <div style={{ height: "100vh", width: "100%" }} ref={harta}></div>
    </APIProvider>
  );
};

export default MapPage;