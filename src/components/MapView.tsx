/// <reference types="google.maps" />
import React, { useEffect, useRef, useState } from 'react';
import { Box, Spinner, Text, VStack } from '@chakra-ui/react';
import { loadGoogleMapsAPI } from '../utils/googleMaps';

interface GolfRound {
  id: string;
  course_name: string;
  date_played: string;
  score: number;
  latitude?: number;
  longitude?: number;
  holes?: number;
}

interface MapViewProps {
  rounds: GolfRound[];
  height?: string;
  width?: string;
}

const MapView: React.FC<MapViewProps> = ({ rounds, height = '400px', width = '100%' }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initMap = async () => {
      try {
        await loadGoogleMapsAPI();
        
        if (!mapRef.current) return;

        const mapInstance = new google.maps.Map(mapRef.current, {
          zoom: 4,
          center: { lat: 39.8283, lng: -98.5795 }, // Center of US
          mapTypeId: google.maps.MapTypeId.ROADMAP,
        });

        setMap(mapInstance);

        const bounds = new google.maps.LatLngBounds();
        let hasValidCoordinates = false;

        // Add markers for rounds with coordinates
        rounds.forEach((round) => {
          if (round.latitude && round.longitude) {
            const marker = new google.maps.Marker({
              position: { lat: round.latitude, lng: round.longitude },
              map: mapInstance,
              title: round.course_name,
            });

            const infoWindow = new google.maps.InfoWindow({
              content: `
                <div style="padding: 8px;">
                  <h3 style="margin: 0 0 8px 0; color: #2D3748;">${round.course_name}</h3>
                  <p style="margin: 4px 0; color: #4A5568;"><strong>Score:</strong> ${round.score}</p>
                  <p style="margin: 4px 0; color: #4A5568;"><strong>Date:</strong> ${new Date(round.date_played).toLocaleDateString()}</p>
                  ${round.holes ? `<p style="margin: 4px 0; color: #4A5568;"><strong>Holes:</strong> ${round.holes}</p>` : ''}
                </div>
              `,
            });

            marker.addListener('click', () => {
              infoWindow.open(mapInstance, marker);
            });

            bounds.extend({ lat: round.latitude, lng: round.longitude });
            hasValidCoordinates = true;
          }
        });

        // Fit map to show all markers
        if (hasValidCoordinates) {
          mapInstance.fitBounds(bounds);
          // Ensure minimum zoom level
          const listener = google.maps.event.addListener(mapInstance, 'idle', () => {
            if (mapInstance.getZoom()! > 15) mapInstance.setZoom(15);
            google.maps.event.removeListener(listener);
          });
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Error loading Google Maps:', error);
        setError(`Failed to load Google Maps: ${error instanceof Error ? error.message : 'Unknown error'}`);
        setIsLoading(false);
      }
    };

    // Check if API key exists before trying to load map
    const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;
    console.log('Google Maps API Key:', apiKey ? 'Present' : 'Missing');
    
    if (!apiKey) {
      setError('Google Maps API key not configured. Please add REACT_APP_GOOGLE_MAPS_API_KEY to your environment variables.');
      setIsLoading(false);
      return;
    }

    initMap();
  }, [rounds]);

  if (isLoading) {
    return (
      <Box height={height} width={width} display="flex" alignItems="center" justifyContent="center">
        <VStack spacing={4}>
          <Spinner size="lg" color="green.500" />
          <Text color="gray.600">Loading map...</Text>
        </VStack>
      </Box>
    );
  }

  if (error) {
    return (
      <Box height={height} width={width} display="flex" alignItems="center" justifyContent="center">
        <Text color="red.500">{error}</Text>
      </Box>
    );
  }

  const roundsWithCoords = rounds.filter(r => r.latitude && r.longitude);
  const roundsWithoutCoords = rounds.length - roundsWithCoords.length;

  return (
    <Box>
      <Box ref={mapRef} height={height} width={width} borderRadius="md" overflow="hidden" />
      {roundsWithoutCoords > 0 && (
        <Text fontSize="sm" color="gray.500" mt={2}>
          {roundsWithoutCoords} round{roundsWithoutCoords !== 1 ? 's' : ''} not shown (missing location data)
        </Text>
      )}
    </Box>
  );
};

export default MapView;
