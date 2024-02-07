import React, { useRef, useState, useEffect } from "react";
import { GoogleMap, useJsApiLoader } from "@react-google-maps/api";

interface MapProps {
  center: google.maps.LatLngLiteral;
}

const Map: React.FC<MapProps> = ({ center }) => {
  const mapRef = useRef<google.maps.Map | undefined>(undefined);
  const containerStyle = { width: "100%", height: "100vh" };
  const [countOfMarkers, setCountOfMarkers] = useState(0);
  const [countOfPolygons, setCountOfPolygons] = useState(0);
  const [pathsCoord, setPathsCoord] = useState<google.maps.LatLngLiteral[]>([]);
  const [polygonPathsCoord, setPolygonPathsCoord] = useState<google.maps.LatLngLiteral[]>([]);
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [newMarkers, setNewMarkers] = useState<google.maps.Marker[]>([]);
  const [lines, setLines] = useState<google.maps.Polyline[]>([]);
  const [polygons, setPolygons] = useState<google.maps.Polygon[]>([]);
  let previousLineTrajectory: google.maps.Polyline | null = null;

  useEffect(() => {
    addEventPolygons();
    editingThePolygon();
  }, [polygons]);

  useEffect(() => {
    addPolygon();
  }, [countOfPolygons]);

  useEffect(() => {
    addPolygonMarkers(polygonPathsCoord);
  }, [polygonPathsCoord]);

  useEffect(() => {
    markers.forEach((marker) =>{
      marker.addListener("drag", () => {dragMarker(marker)})
      })
    verifyPolygons();
    addCoordOfMarkers(markers);

    if (markers.length >= 2) {
      addLine(pathsCoord);
    }

    if (mapRef.current) {

      const mousemoveListener = mapRef.current.addListener("mousemove", (event: google.maps.MapMouseEvent) => {

          const cursorPosition = event.latLng;
          if (cursorPosition) {
            if (markers.length > 0) {
              const lastMarkerPosition =
                markers[markers.length - 1].getPosition();
              if (lastMarkerPosition) {
                addLineTrajectory(
                  lastMarkerPosition.toJSON(),
                  cursorPosition.toJSON()
                );
              }
            }
          }
        }
      );
      return () => {
        google.maps.event.removeListener(mousemoveListener);
      };
    }
  }, [countOfMarkers, pathsCoord]);

  const dragMarker = (event: google.maps.Marker) => {
    previousLineTrajectory?.setMap(null);
  
    const markerIndex = markers.findIndex((m) => m === event);
  
    if (markerIndex !== -1) {
      const newPosition = event.getPosition();
      if (newPosition) {
        const newMarkerPosition = {
          lat: newPosition.lat(),
          lng: newPosition.lng(),
        };
  
        setPathsCoord((prevPathsCoord) => {
          const updatedPathsCoord = [...prevPathsCoord];
          updatedPathsCoord[markerIndex] = newMarkerPosition;
          return updatedPathsCoord;
        });
      }
    }
  };

  const addLineTrajectory = (
    startCoord: google.maps.LatLngLiteral,
    endCoord: google.maps.LatLngLiteral
  ) => {
    if (countOfMarkers > 0) {
      if (mapRef.current) {
        previousLineTrajectory?.setMap(null);
        const lineTrajectory = new window.google.maps.Polyline({
          path: [startCoord, endCoord],
          strokeColor: "#000000",
          strokeOpacity: 0.5,
          clickable: true,
          strokeWeight: 2,
        });
        lineTrajectory.setMap(mapRef.current);
        lineTrajectory.addListener(
          "click",
          (event: google.maps.MapMouseEvent) => {
            addMarker(event.latLng!);
            previousLineTrajectory?.setMap(null);
          }
        );
   previousLineTrajectory = lineTrajectory;
      }
    }
  };

  const undoBtn = () => {
    if (polygons.length === 0) {
      if (markers.length > 0) {
        undoFunction();
      }
    } else if (polygons.length > 0) {
      if (countOfMarkers === 0) {
        undoPolygon();
      } else if (countOfMarkers > 0) {
        undoFunction();
      }
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
    }
  };

  const addLastLine = () => {
    if (markers) {
      markers[0].addListener("click", () => {
        previousLineTrajectory?.setMap(null);
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

  const addCoordOfMarkers = (arrayOfMarkers: google.maps.Marker[]) => {
    arrayOfMarkers.forEach((marker) => {
      const position = marker.getPosition();
      if (position) {
        const markerPosition = {
          lat: position.lat(),
          lng: position.lng(),
        };
        setPathsCoord((prevPaths) => {
          if (
            !prevPaths.some(
              (path) =>
                path.lat === markerPosition.lat &&
                path.lng === markerPosition.lng
            )
          ) {
            return [...prevPaths, markerPosition];
          }
          return prevPaths;
        });
      }
    });
  };

  const addMarker = (position: google.maps.LatLng | google.maps.LatLngLiteral) => {
    setCountOfMarkers((prevCount) => prevCount + 1);
    const marker = new google.maps.Marker({
      position,
      draggable: true,
      map: mapRef.current,
    });
    setMarkers((prevMarkers) => [...prevMarkers, marker]);
  };

  const onLoadMap = (map: any) => {
    mapRef.current = map;
    map.addListener("click", (event: google.maps.MapMouseEvent) => {
      addMarker(event.latLng!);
    });
  };

  const undoFunction = () => {
    setCountOfMarkers((prevCount) => prevCount - 1);
    markers[markers.length - 1].setMap(null);
    const newMarkers = markers.slice(0, markers.length - 1);
    const newPathsCoord = pathsCoord.slice(0, pathsCoord.length - 1);
    setPathsCoord(newPathsCoord);
    setMarkers(newMarkers);
    if (markers.length > 1) {
      lines[lines.length - 1].setMap(null);
      const newLines = lines.slice(0, lines.length - 1);
      setLines(newLines);
    }
  };
  const undoPolygon = () => {
    const polygonPaths = polygons[polygons.length - 1].getPath();
    polygonPaths.pop();
    polygonPaths.forEach((coord: google.maps.LatLng) => {
      const markerPosition = {
        lat: coord.lat(),
        lng: coord.lng(),
      };
      addMarker(markerPosition);
    });
    newMarkers.forEach((marker) => marker.setMap(null));
    setNewMarkers([]);
    polygons[polygons.length - 1].setMap(null);
    const newPolygons = polygons.slice(0, polygons.length - 1);
    setPolygons(newPolygons);
  };
  const addPolygonMarkers = (position: google.maps.LatLngLiteral[]) => {
    newMarkers.forEach((marker) => {
      marker.setMap(null);
    });
    setNewMarkers([]);
    position.forEach((coord) => {
      const marker = new google.maps.Marker({
        position: coord,
        map: mapRef.current,
      });
      setNewMarkers((prevMarkers) => [...prevMarkers, marker]);
    });
  };
  const editingThePolygon = () => {
    setPolygonPathsCoord([]);
    polygons.forEach((polygon: google.maps.Polygon) => {
      const newPathsCoord = polygon
        .getPath()
        .getArray() as google.maps.LatLng[];
      newPathsCoord.forEach((coord) => {
        const markerPosition = {
          lat: coord.lat(),
          lng: coord.lng(),
        };
        setPolygonPathsCoord((prevPaths) => [...prevPaths, markerPosition]);
      });
    });
  };
  const editingTheSide = (editedPolygon: google.maps.Polygon) => {
    const newPathsCoord = editedPolygon
      .getPath()
      .getArray() as google.maps.LatLng[];
    newPathsCoord.forEach((coord) => {
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
    polygons.forEach((polygon: google.maps.Polygon) => {
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
    setLines([]);
  };
  const removeAllMarkers = () => {
    markers.forEach((marker) => {
      marker.setMap(null);
    });
    setMarkers([]);
  };
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: "AIzaSyDRsvFP1wiFpD2tkrz_a2XGNR1bR79PR3s",
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
        center={center}
        onLoad={onLoadMap}
        mapContainerStyle={containerStyle}
      ></GoogleMap>
    </div>
  ) : null;
};

export default Map;
