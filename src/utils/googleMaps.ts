/// <reference types="google.maps" />

// Google Maps API loader utility
let isLoaded = false;
let isLoading = false;

declare global {
  interface Window {
    google: typeof google;
  }
}

export const loadGoogleMapsAPI = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    // If already loaded, resolve immediately
    if (isLoaded) {
      resolve();
      return;
    }

    // If currently loading, wait for it
    if (isLoading) {
      const checkLoaded = () => {
        if (isLoaded) {
          resolve();
        } else {
          setTimeout(checkLoaded, 100);
        }
      };
      checkLoaded();
      return;
    }

    isLoading = true;

    // Check if script already exists
    const existingScript = document.getElementById('google-maps-script');
    if (existingScript) {
      existingScript.addEventListener('load', () => {
        isLoaded = true;
        isLoading = false;
        resolve();
      });
      return;
    }

    // Create and load the script
    const script = document.createElement('script');
    script.id = 'google-maps-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      isLoaded = true;
      isLoading = false;
      resolve();
    };

    script.onerror = () => {
      isLoading = false;
      reject(new Error('Failed to load Google Maps API'));
    };

    document.head.appendChild(script);
  });
};

// Geocoding utility function
export const geocodeAddress = async (address: string): Promise<{ lat: number; lng: number } | null> => {
  try {
    await loadGoogleMapsAPI();
    
    const geocoder = new google.maps.Geocoder();
    
    return new Promise((resolve) => {
      geocoder.geocode({ address }, (results: google.maps.GeocoderResult[] | null, status: google.maps.GeocoderStatus) => {
        if (status === 'OK' && results && results[0]) {
          const location = results[0].geometry.location;
          resolve({
            lat: location.lat(),
            lng: location.lng()
          });
        } else {
          console.warn('Geocoding failed:', status);
          resolve(null);
        }
      });
    });
  } catch (error) {
    console.error('Error geocoding address:', error);
    return null;
  }
};
