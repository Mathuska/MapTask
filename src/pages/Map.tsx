import React, { useRef, useState , useEffect} from 'react';
import {GoogleMap, useJsApiLoader } from '@react-google-maps/api';

const Map = () => {
    let countOfMarkers = 0
    const containerStyle = {width: '100%',height: '100vh',}
    const chisinau : google.maps.LatLngLiteral= { lat: 47.0122, lng: 28.8605 }
    const mapRef = useRef();
    const libraries : any = ['places', 'drawing'];
    const [pathsCoord, setPathsCoord] = useState<google.maps.LatLngLiteral[]>([]);
    const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
    const [lines, setLines] = useState<google.maps.Polyline[]>([]);

    useEffect(() =>{
    setCoordOfMarkers(markers);
    },[markers])

    useEffect(() => {
        if (markers.length >= 2) {
            addLine(pathsCoord);
        }        
    }, [pathsCoord]);

    const addLine = (polyCoordinates: google.maps.LatLngLiteral[]) => {
        removeAllLines();
        if (mapRef.current) {
            const pathLatLng = polyCoordinates.map(coord => new google.maps.LatLng(coord.lat, coord.lng));
            
            const isLineExist = lines.some((line) => {
                const lineCoordinates = line.getPath().getArray();
                return (
                    lineCoordinates.length === pathLatLng.length &&
                    lineCoordinates.every((coord, index) => {
                        const pathCoord = pathLatLng[index];
                        return coord.equals(pathCoord);
                    })
                );
            });
    
            if (!isLineExist) {
                const line = new window.google.maps.Polyline({
                    path: [...pathLatLng, pathLatLng[0]],
                    draggable: true,
                    geodesic: true,
                    strokeColor: '#000000',
                    strokeOpacity: 1.0,
                    strokeWeight: 2,
                });
                line.setMap(mapRef.current);
                setLines((prevLines) => [...prevLines, line]);
            }
        }
    };
    
    const setCoordOfMarkers = (targets: any) => {
        targets.forEach((marker: any) => {
            const markerPosition = {
                lat: marker.position.lat(),
                lng: marker.position.lng(),
            };
            setPathsCoord((prevPaths) => {
                if (!prevPaths.some((path) => path.lat === markerPosition.lat && path.lng === markerPosition.lng)) {
                    return [...prevPaths, markerPosition];
                }
                return prevPaths;
            });
        });
    };
      
    const  addMarker = (position: google.maps.LatLng | google.maps.LatLngLiteral) => {
        countOfMarkers ++
      const marker = new google.maps.Marker({
        position,
        title: `${countOfMarkers}`,
        draggable: true,
        map: mapRef.current,
      });
      setMarkers((prevMarkers) => [...prevMarkers,marker])
    };

    const onLoadMap = (map : any) => {
        mapRef.current = map;
        map.addListener("click", (event: google.maps.MapMouseEvent) => {
            addMarker(event.latLng!);
          });
    };

    const undoBtn = () => {
        if (markers.length > 0) {
                 if (lines.length > 0) {
                     lines[lines.length - 1].setMap(null);
                     const newLines = lines.slice(0,lines.length - 1)
                     setLines(newLines);
                 } 
                 markers[markers.length - 1].setMap(null);
                 const newMarkers = markers.slice(0, markers.length - 1);
                 setMarkers(newMarkers);
             }
    };
    const removeAllLines = () => {
        lines.forEach((line) => {
          line.setMap(null); 
        });
        setLines([]); 
    };
    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: 'AIzaSyDRsvFP1wiFpD2tkrz_a2XGNR1bR79PR3s',
        libraries
    });

    return (
        isLoaded
        ?
        <div className='map-container' style={{ backgroundColor:"gray"}}>
               <div id='delete' style={{ marginLeft:'736px' ,width:"50px",height:'30px' , cursor:"pointer"}} onClick={() => undoBtn()}>UNDO</div>
               {/* <div id='delete' style={{ marginLeft:'680px' ,width:"50px",height:'30px' , cursor:"pointer"}} >
                <input placeholder='Numarul de laturi' value={number}
              onChange={(e : any) => setNumber(e.target.value)}></input>
                </div> */}
                <GoogleMap
                    zoom={8}
                    center={chisinau}
                    onLoad={onLoadMap}
                    mapContainerStyle={containerStyle}
                >
                </GoogleMap>
            </div>
            :
            null
    );
}

export default Map; 