
// import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
// import 'leaflet/dist/leaflet.css';

// const  MapPage=() => {
//   const center = [22.9734, 78.6569]; 

//   const dummyPoints = [
//     { lat: 28.6139, lng: 77.2090, label: "Delhi" },
//     { lat: 19.0760, lng: 72.8777, label: "Mumbai" },
//     { lat: 13.0827, lng: 80.2707, label: "Chennai" },
//   ];

//   return (
//     <div style={{ height: "90vh", width: "100%" }}>
//       <MapContainer center={center} zoom={5} style={{ height: "100%", width: "100%" }}>
//        <TileLayer
//         url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
//             attribution='&copy; <a href="https://carto.com/">CARTO</a>'
//         />

//         {dummyPoints.map((point, index) => (
//           <Marker key={index} position={[point.lat, point.lng]}>
//             <Popup>{point.label}</Popup>
//           </Marker>
//         ))}
//       </MapContainer>
//     </div>
//   );
// }
// export default MapPage;



import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { Box, Heading } from '@chakra-ui/react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';


delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const MapPage = () => {
  // Static list of lat/lng
  const markers = [
    { id: 1, position: [28.6139, 77.2090], label: 'New Delhi' },
    { id: 2, position: [19.0760, 72.8777], label: 'Mumbai' },
    { id: 3, position: [13.0827, 80.2707], label: 'Chennai' },
    { id: 4, position: [22.5726, 88.3639], label: 'Kolkata' },
    { id: 5, position: [12.9716, 77.5946], label: 'Bengaluru' },
  ];

  return (
    <Box p={4}>

      <MapContainer center={[22.9734, 78.6569]} zoom={5} style={{ height: '80vh', width: '100%' }}>
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
        />
        {markers.map(({ id, position, label }) => (
          <Marker key={id} position={position}>
            <Popup>{label}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </Box>
  );
};

export default MapPage;
