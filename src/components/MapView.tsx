/// <reference types="google.maps" />
import React, { useEffect, useRef, useState } from 'react';
import { Box, Spinner, Text, VStack } from '@chakra-ui/react';

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
    const initializeMap = async () => {
      try {
        // Check if Google Maps is loaded
        if (!window.google) {
          setError('Google Maps API not loaded');
          setIsLoading(false);
          return;
        }

        if (!mapRef.current) return;

        // Create map centered on US
        const mapInstance = new google.maps.Map(mapRef.current, {
          zoom: 4,
          center: { lat: 39.8283, lng: -98.5795 }, // Center of US
          mapTypeId: google.maps.MapTypeId.ROADMAP,
        });

        setMap(mapInstance);

        // Add markers for rounds with coordinates
        const bounds = new google.maps.LatLngBounds();
        let hasValidCoordinates = false;

        rounds.forEach((round) => {
          if (round.latitude && round.longitude) {
            const marker = new google.maps.Marker({
              position: { lat: round.latitude, lng: round.longitude },
              map: mapInstance,
              title: round.course_name,
              icon: {
                url: 'data:image/svg+xml;base64,' + btoa(`
                  <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="16" cy="16" r="12" fill="#38A169" stroke="#fff" stroke-width="2"/>
                    <circle cx="16" cy="16" r="4" fill="#fff"/>
                  </svg>
                `),
                scaledSize: new google.maps.Size(32, 32),
              },
            });

            // Info window for each marker
            const infoWindow = new google.maps.InfoWindow({
              content: `
                <div style="padding: 8px; min-width: 200px;">
                  <h3 style="margin: 0 0 8px 0; color: #2D3748; font-size: 16px; font-weight: bold;">
                    ${round.course_name}
                  </h3>
                  <p style="margin: 4px 0; color: #4A5568; font-size: 14px;">
                    <strong>Score:</strong> ${round.score} ${round.holes ? `(${round.holes} holes)` : ''}
                  </p>
                  <p style="margin: 4px 0; color: #4A5568; font-size: 14px;">
                    <strong>Date:</strong> ${new Date(round.date_played).toLocaleDateString()}
                  </p>
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
      } catch (err) {
        console.error('Error initializing map:', err);
        setError('Failed to load map');
        setIsLoading(false);
      }
    };

    initializeMap();
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
