import { onMount, createEffect, onCleanup, on } from 'solid-js';

// --- Helper to load the Google Maps Script ---
let scriptLoaded = false;
const loadGoogleMapsScript = (apiKey) => {
  if (scriptLoaded) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      scriptLoaded = true;
      resolve();
    };
    script.onerror = (error) => {
      reject(error);
    };
    document.head.appendChild(script);
  });
};


function GoogleMap(props) {
  let mapDiv;
  let map;
  let markers = [];

  const defaultCenter = { lat: 48.730733, lng: 19.457483 };
  const defaultZoom = 7;

  const YOUR_GOOGLE_MAPS_API_KEY = 'AIzaSyAN5tQYdPm8K11zwVwMVNKsiUxTJaWfplA';

  onMount(async () => {
    try {
      await loadGoogleMapsScript(YOUR_GOOGLE_MAPS_API_KEY);
      map = new google.maps.Map(mapDiv, {
        center: { lat: 48.730733, lng: 19.457483 },
        zoom: 7,
      });
    } catch (error) {
      console.error("Failed to load Google Maps script:", error);
    }
  });

  createEffect(on(() => props.locations, (locations) => {
    console.log("map effect");
    if (!map) return;

    console.log("map created");

    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));
    markers = [];

    const bounds = new google.maps.LatLngBounds();

    if (props.locations && props.locations.length > 0) {
      // Create new markers
      props.locations.forEach(location => {
        console.log(location);
        const marker = new google.maps.Marker({
          position: location,
          map,
        });
        markers.push(marker);
        bounds.extend(location);
      });

      console.log("markers.length", markers.length);
      // Adjust map to fit all markers
      if (markers.length > 1) {
        map.fitBounds(bounds);
      } else if (markers.length === 1) {
        map.setCenter(bounds.getCenter());
        map.setZoom(12);
      } else {
        console.log("reset position");
        map.setCenter(defaultCenter);
        map.setZoom(defaultZoom);
      }
    }

    if (!props.locations.length) {
      map.setCenter(defaultCenter);
      map.setZoom(defaultZoom);
    }
  }));

  onCleanup(() => {
    // Clean up markers and map instance if the component is unmounted
    markers.forEach(marker => marker.setMap(null));
    markers = [];
    map = null;
  });

  return <div ref={mapDiv} style={{ height: '500px', width: '100%' }} />;
}

export default GoogleMap;
