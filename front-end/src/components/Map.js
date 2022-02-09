/* eslint-disable react/prop-types */
/* eslint-disable no-shadow */
/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint-disable prefer-arrow-callback */
/* eslint-disable react/jsx-no-useless-fragment */
import React, { useEffect } from 'react';
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import PropTypes from 'prop-types';

const containerStyle = {
  height: '400px',
};

const defaultMapStyles = {
  width: '100%',
  height: '100%',
  margin: 'auto',
};

const center = {
  lat: 43,
  lng: -79,
};
function Map({ initialCenter, zoom, style }) {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: 'AIzaSyD0UIR7Nc-oEEQ2ur9lY27J4Ewo4t1w0J0',
  });

  const [map, setMap] = React.useState(null);

  const onLoad = React.useCallback(function callback(map) {
    const bounds = new window.google.maps.LatLngBounds();
    map.fitBounds(bounds);
    setMap(map);
  }, []);

  const onUnmount = React.useCallback(function callback(map) {
    setMap(null);
  }, []);

  useEffect(() => console.log(initialCenter, center), []);

  return isLoaded ? (
    <GoogleMap
      center={center}
      mapContainerStyle={containerStyle}
      // center={center}
      onLoad={onLoad}
      onUnmount={onUnmount}
      onClick={ev => console.log(ev)}
      zoom={10}
      style={{ ...defaultMapStyles, ...style }}
    >
      Heyo
      <></>
    </GoogleMap>
  ) : (
    <></>
  );
}

Map.propTypes = {
  initialCenter: PropTypes.shape({
    lat: PropTypes.number,
    lng: PropTypes.number,
  }),
  zoom: PropTypes.number,
};
Map.defaultProps = {
  initialCenter: {
    lat: 43.54,
    lng: -79.66,
  },
  zoom: 17,
};

export default React.memo(Map);
