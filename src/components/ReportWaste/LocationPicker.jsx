import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Text,
  VStack,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import { FaMapMarkerAlt } from "react-icons/fa";
import "leaflet/dist/leaflet.css";

// Fix Leaflet icon paths
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

const DraggableMarker = ({ location, setLocation }) => {
  useMapEvents({
    click: (e) => {
      setLocation({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });

  return (
    <Marker
      draggable
      position={[location.lat, location.lng]}
      eventHandlers={{
        dragend: (e) => {
          const { lat, lng } = e.target.getLatLng();
          setLocation({ lat, lng });
        },
      }}
    />
  );
};

const RecenterMap = ({ lat, lng }) => {
  const map = useMap();
  useEffect(() => {
    map.setView([lat, lng], map.getZoom());
  }, [lat, lng, map]);
  return null;
};

const LocationPicker = ({ location, setLocation }) => {
  const [error, setError] = useState("");
  const [placeName, setPlaceName] = useState("");
  const toast = useToast();
  const mapBorderColor = useColorModeValue("gray.300", "gray.600");
  const bg = useColorModeValue("gray.50", "gray.900");

  const getUserLocation = () => {
    setError("");
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          toast({
            title: "Location Detected",
            description: "Map centered to your current location.",
            status: "success",
            duration: 3000,
            isClosable: true,
            position: "top-right", 
          });
        },
        () => {
          setError("Location access denied or not available.");
        }
      );
    } else {
      setError("Geolocation not supported by your browser.");
    }
  };

  const fetchPlaceName = async () => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${location.lat}&lon=${location.lng}`
      );
      const data = await res.json();
      if (data && data.display_name) {
        setPlaceName(data.display_name);
      } else {
        setPlaceName("Location name not found");
      }
    } catch (err) {
      console.error(err);
      setPlaceName("Error fetching location name");
    }
  };

  useEffect(() => {
    if (location.lat && location.lng) {
      fetchPlaceName();
    }
  }, [location]);

  useEffect(() => {
    getUserLocation();
  }, []);

  return (
    <Box
      px={{ base: 4, md: 8 }}
      py={8}
      bg={bg}
      rounded="xl"
      boxShadow="lg"
      zIndex={0}
      position="relative"
    >
      <VStack spacing={6} align="stretch">
        <Button
          leftIcon={<FaMapMarkerAlt />}
          colorScheme="teal"
          onClick={getUserLocation}
          size="lg"
          alignSelf="flex-start"
          _hover={{ transform: "scale(1.03)" }}
          transition="all 0.2s ease-in-out"
        >
          Your Detected Location
        </Button>

        {location.lat && location.lng && (
          <>

            {/* ✅ DISPLAY PLACE NAME */}
            <Text fontSize="md" fontWeight="medium" color="teal.300">
              🗺️ {placeName}
            </Text>

            <Box
              h={{ base: "400px", md: "500px" }}
              w="100%"
              borderRadius="xl"
              overflow="hidden"
              borderWidth="2px"
              borderColor={mapBorderColor}
              zIndex={0}
            >
              <MapContainer
                center={[location.lat, location.lng]}
                zoom={15}
                scrollWheelZoom
                style={{ height: "100%", width: "100%", zIndex: 0 }}
              >
                <RecenterMap lat={location.lat} lng={location.lng} />
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <DraggableMarker
                  location={location}
                  setLocation={setLocation}
                />
              </MapContainer>
            </Box>
          </>
        )}

        {error && (
          <Text color="red.400" fontWeight="medium">
            {error}
          </Text>
        )}
      </VStack>
    </Box>
  );
};

export default LocationPicker;
