import React, { useRef, useState } from 'react';
import { DrawingManager, GoogleMap, useJsApiLoader } from '@react-google-maps/api';

const Map = () => {
    
    const containerStyle = {width: '100%',height: '100vh',}
    const chisinau = { lat: 47.0122, lng: 28.8605 }
    const mapRef = useRef();
    const drawingManagerRef = useRef();
    const libraries : any = ['places', 'drawing'];

    const { isLoaded } = useJsApiLoader({
        googleMapsApiKey: 'AIzaSyDRsvFP1wiFpD2tkrz_a2XGNR1bR79PR3s',
        libraries
    });

    const polygonOptions = {
        fillOpacity: 0.5,
        fillColor: '#000000',
        strokeColor: '#000000',
        strokeWeight: 2,
        draggable: true,
        editable: true
    }

    const drawingManagerOptions = {
        polygonOptions: polygonOptions,
        drawingControl: true,
        drawingControlOptions: {
            position: window.google?.maps?.ControlPosition?.TOP_CENTER,
            drawingModes: [
                window.google?.maps?.drawing?.OverlayType?.POLYGON
            ]
        }
    }

    const onLoadMap = (map : any) => {
        mapRef.current = map;
    }

    const onLoadDrawingManager = (drawingManager : any) => {
        drawingManagerRef.current = drawingManager;
    }

    return (
        isLoaded
            ?
            <div className='map-container' style={{ position: 'relative' }}>
                
                <GoogleMap
                    zoom={15}
                    center={chisinau}
                    onLoad={onLoadMap}
                    mapContainerStyle={containerStyle}
                >
                    <DrawingManager
                        onLoad={onLoadDrawingManager}
                        options={drawingManagerOptions}
                    />
                    
                    
                </GoogleMap>
            </div>
            :
            null
    );
}

export default Map; 