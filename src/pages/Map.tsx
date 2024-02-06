import React, { useRef, useState, useEffect } from "react";
import { GoogleMap, useJsApiLoader } from "@react-google-maps/api";

const Map = () => {
  const mapRef = useRef();
  const libraries: ("places" | "drawing")[] = ["places", "drawing"];
  const containerStyle = { width: "100%", height: "100vh" };
  const chisinau: google.maps.LatLngLiteral = { lat: 47.0122, lng: 28.8605 };
  const [countOfMarkers, setCountOfMarkers] = useState(0);
  const [countOfPolygons, setCountOfPolygons] = useState(0);
  const [pathsCoord, setPathsCoord] = useState<google.maps.LatLngLiteral[]>([]);
  const [polygonPathsCoord, setPolygonPathsCoord] = useState<google.maps.LatLngLiteral[]>([]);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [newMarkers, setNewMarkers] = useState<google.maps.Marker[]>([]);
  const [lines, setLines] = useState<google.maps.Polyline[]>([]);
  const [polygons, setPolygons] = useState<google.maps.Polygon[]>([]);


  useEffect(() => {
    addEventPolygons();
  }, [polygons]);

  useEffect(() => {
    addPolygon();
  }, [countOfPolygons]);

  useEffect(() => {
    addPolygonMarkers(polygonPathsCoord);
  }, [polygonPathsCoord]);

  useEffect(() => {
    verifyPolygons();
    addCoordOfMarkers(markers);
    if (markers.length >= 2) {
      addLine(pathsCoord);
    }
  }, [countOfMarkers, pathsCoord]);


  const undoBtn = () => {
    if (polygons.length === 0) {
        if (markers.length > 0) {
            console.log(markers);
            markers[markers.length - 1].setMap(null);
            const newMarkers = markers.slice(0, markers.length - 1);
            const newPathsCoord = pathsCoord.slice(0, pathsCoord.length - 1);
            setPathsCoord(newPathsCoord)
            setMarkers(newMarkers)
            if (markers.length > 1) {
                lines[lines.length - 1].setMap(null);
                const newLines = lines.slice(0, lines.length - 1);
                setLines(newLines);
            }
        }
    }else if (polygons.length === 1){
        const polygonPaths  = polygons[0].getPath();
        polygonPaths.pop()
        polygonPaths.forEach((coord:any) => {
            const markerPosition = {
                lat: coord.lat(),
                lng: coord.lng(),
            };
            addMarker(markerPosition)
        })
        newMarkers.forEach(marker => marker.setMap(null))
        setNewMarkers([])
        polygons[0].setMap(null);
        setPolygons([]);
    }
  };

  const addPolygon = () => {
   
    if (mapRef.current) {
      const polygon = new google.maps.Polygon({
        paths: pathsCoord,
        strokeColor: "#000000",
        strokeOpacity: 1,
        strokeWeight: 2,
        fillColor: "#000000",
        fillOpacity: 0.5,
        editable: true,
        draggable: true,
      });
      addPolygonMarkers(pathsCoord);
      removeAll();

      polygon.setMap(mapRef.current);
      setPolygons((prevPolygons) => [...prevPolygons, polygon]);
      localStorage.setItem(
        `${polygons.length} polygon`,
        JSON.stringify(pathsCoord)
      );
    }
  };

  const addLastLine = () => {
    if (markers) {
      markers[0].addListener("click", () => {
        if (mapRef.current) {
          const lastCoord = markers[0].getPosition()?.toJSON();

          if (lastCoord) {
            setPathsCoord((prevPaths) => {
              if (prevPaths.length >= 2) {
                while (
                  prevPaths.length >= 2 &&
                  prevPaths[prevPaths.length - 1].lat === lastCoord.lat &&
                  prevPaths[prevPaths.length - 1].lng === lastCoord.lng
                ) {
                  prevPaths.pop();
                }
              }
              return [...prevPaths, lastCoord];
            });
          }
        }
      });
    }
  };

  const addLine = (polyCoordinates: google.maps.LatLngLiteral[]) => {
    removeAllLines();
    addLastLine();
    if (mapRef.current) {
      for (let i = 0; i < polyCoordinates.length - 1; i++) {
        const startPoint = polyCoordinates[i];
        const endPoint = polyCoordinates[i + 1];
  
        const line = new window.google.maps.Polyline({
          path: [startPoint, endPoint],
          strokeColor: "#000000",
          strokeOpacity: 1.0,
          draggable: true,
          strokeWeight: 2,
        });
  
        line.setMap(mapRef.current);
        setLines((prevLines) => [...prevLines, line]);
      }
    }
  };
  

  const addCoordOfMarkers = (targets: any) => {
    targets.forEach((marker: any) => {
      const markerPosition = {
        lat: marker.position.lat(),
        lng: marker.position.lng(),
      };
      setPathsCoord((prevPaths) => {
        if (
          !prevPaths.some(
            (path) =>
              path.lat === markerPosition.lat && path.lng === markerPosition.lng
          )
        ) {
          return [...prevPaths, markerPosition];
        }
        return prevPaths;
      });
    });
  };

  const addMarker = (
    position: google.maps.LatLng | google.maps.LatLngLiteral
  ) => {
    setCountOfMarkers((prevCount) => prevCount + 1);
    const marker = new google.maps.Marker({
      position,
      draggable:true,
      map: mapRef.current,
    });
    setMarkers((prevMarkers) => [...prevMarkers, marker]);
  };

  const onLoadMap = (map: any) => {
    mapRef.current = map;
    map.addListener("click", (event: google.maps.MapMouseEvent) => {
      addMarker(event.latLng!);
    });
    localStorage.clear();
  };

  const addPolygonMarkers = (position: any) => {
    newMarkers.forEach((marker) => {
      marker.setMap(null);
    });
    setNewMarkers([]);
    position.forEach((coord: any) => {
      const marker = new google.maps.Marker({
        position: coord,
        map: mapRef.current,
      });
      setNewMarkers((prevMarkers) => [...prevMarkers, marker]);
    });
  };
  const editingThePolygon = () => {
    setPolygonPathsCoord([]);
    polygons.forEach((paths: any) => {
      const newPathsCoord: any = paths.getPath();
      newPathsCoord.forEach((coord: any) => {
        const markerPosition = {
          lat: coord.lat(),
          lng: coord.lng(),
        };
        setPolygonPathsCoord((prevPaths) => [...prevPaths, markerPosition]);
      });
    });
  };
  const editingTheSide = (editedPolygon: google.maps.Polygon) => {
    const newPathsCoord: any = editedPolygon.getPath();
    newPathsCoord.forEach((coord: any) => {
      const markerPosition = {
        lat: coord.lat(),
        lng: coord.lng(),
      };
      const marker = new google.maps.Marker({
        position: markerPosition,
        map: mapRef.current,
      });
      setNewMarkers((prevMarkers) => [...prevMarkers, marker]);
    });
  };
  const addEventPolygons = () => {
    polygons.forEach((polygon: any) => {
      google.maps.event.addListener(polygon.getPath(), "insert_at", () => {
        editingTheSide(polygon);
      });
      google.maps.event.addListener(polygon.getPath(), "set_at", () => {
        editingThePolygon();
      });
    });
  };
  const verifyPolygons = () => {
    if (countOfMarkers === pathsCoord.length - 1) {
      setCountOfPolygons((prevNumber) => prevNumber + 1);
    }
  };
  const removeAll = () => {
    removeAllLines();
    removeAllMarkers();
    setCountOfMarkers(0);
    setPathsCoord([]);
  };
  const removeAllLines = () => {
    lines.forEach((line) => {
      line.setMap(null);
    });
    setLines([])
  };
  const removeAllMarkers = () => {
    markers.forEach((marker) => {
      marker.setMap(null);
    });
    setMarkers([]);
  };
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyDRsvFP1wiFpD2tkrz_a2XGNR1bR79PR3s",
    libraries,
  });

  return isLoaded ? (
    <div className="map-container" style={{ backgroundColor: "gray" }}>
      <div
        id="delete"
        style={{
          marginLeft: "736px",
          width: "50px",
          height: "30px",
          cursor: "pointer",
        }}
        onClick={() => undoBtn()}
      >
        UNDO
      </div>
      <GoogleMap
        zoom={8}
        center={chisinau}
        onLoad={onLoadMap}
        mapContainerStyle={containerStyle}
      ></GoogleMap>
    </div>
  ) : null;
};

export default Map;
