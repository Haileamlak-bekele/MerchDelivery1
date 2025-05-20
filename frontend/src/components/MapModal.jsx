import React from 'react';
import { GoogleMap, Marker, useLoadScript } from '@react-google-maps/api';

const containerStyle = { width: '100%', height: '300px' };

const MapPicker = ({ value, onChange }) => {
  const { isLoaded } = useLoadScript({
    googleMapsApiKey: '',
  });

  const handleMapClick = (e) => {
    onChange({
      lat: e.latLng.lat(),
      lng: e.latLng.lng(),
    });
  };

  return isLoaded ? (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={value || { lat: 10.3296, lng: 37.7344 }}
      zoom={10}
      onClick={handleMapClick}
    >
      {value && <Marker position={value} />}
    </GoogleMap>
  ) : <div>Loading map...</div>;
};

export default MapPicker;