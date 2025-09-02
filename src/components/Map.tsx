import { onMount, createEffect, onCleanup, on, createSignal, createResource, createRoot } from 'solid-js';
// 1. Import the MarkerClusterer library
import { MarkerClusterer } from '@googlemaps/markerclusterer';
import { Loader } from '@googlemaps/js-api-loader';
import MapMarker from "~/components/MapMarker.tsx";
import { render } from "solid-js/web";
import { algoliasearch } from "algoliasearch";

function Map(props) {
  let mapDiv;
  let map;
  // 2. Add a variable to hold the MarkerClusterer instance
  let markerClusterer = null;

  let AdvancedMarkerElement;

  const [selectedLocation, setSelectedLocation] = createSignal(null);
  const [popupPosition, setPopupPosition] = createSignal(null);
  const [isMapReady, setIsMapReady] = createSignal(false);

  const defaultCenter = { lat: 48.730733, lng: 19.457483 };
  const defaultZoom = 7;

  // IMPORTANT: For security, it's better to load API keys from environment variables
  // rather than hardcoding them directly in the source code.
  const YOUR_GOOGLE_MAPS_API_KEY = 'AIzaSyAN5tQYdPm8K11zwVwMVNKsiUxTJaWfplA'; // Replace with your key

  // 3. Create a single Loader instance with your configuration
  const loader = new Loader({
    apiKey: YOUR_GOOGLE_MAPS_API_KEY,
    version: 'weekly',
    // You can add other libraries here, e.g., ['places', 'geometry']
  });

  onMount(async () => {
    try {
      // Use Promise.all to load them concurrently
      const [{ Map }, { AdvancedMarkerElement: AME_Class }] = await Promise.all([
        loader.importLibrary('maps'),
        loader.importLibrary('marker'),
      ]);

      // Assign the loaded class to our top-level variable
      AdvancedMarkerElement = AME_Class;

      map = new Map(mapDiv, {
        center: defaultCenter,
        zoom: defaultZoom,
        // It's very important to add a mapId for Advanced Markers to work.
        // You can create one in the Google Cloud Console under "Map Management".
        // For development, you can use the special "DEMO_MAP_ID".
        mapId: 'DEMO_MAP_ID',
      });

      map.addListener('click', () => {
        setSelectedLocation(null);
      });

      const tilesLoadedListener = map.addListener('tilesloaded', () => {
        console.log("map is ready");
        setIsMapReady(true);
        google.maps.event.removeListener(tilesLoadedListener);
      });

    } catch (e) {
      console.error("Failed to load Google Maps API:", e);
    }
  });

  createEffect(on([() => props.places, isMapReady], ([locations, ready]) => {
    // This guard is now also important to wait for AdvancedMarkerElement to be loaded.
    if (!ready || !map || !AdvancedMarkerElement) {
      console.log("map not ready");
      return;
    }

    if (!markerClusterer) {
      // The MarkerClusterer library is compatible with AdvancedMarkerElement out of the box.
      markerClusterer = new MarkerClusterer({ map, markers: [] });
    }
    setSelectedLocation(null);
    markerClusterer.clearMarkers();

    if (!locations || locations.length === 0) {
      map.setCenter(defaultCenter);
      map.setZoom(defaultZoom);
      return;
    }

    const bounds = new google.maps.LatLngBounds();
    const markers = locations.filter(hit => hit._geoloc).map((location) => {
      bounds.extend({lat: location._geoloc.lat, lng: location._geoloc.lng});

      // 3a. Instantiate AdvancedMarkerElement instead of Marker
      const markerContainer = document.createElement("div");


      const marker = new AdvancedMarkerElement({
        position: {lat: location._geoloc.lat, lng: location._geoloc.lng},
        // Note: The `map` property is omitted here, as the clusterer will manage it.
        content: markerContainer,
      });

      createRoot(() => {
        render(() => <MapMarker item={location} />, markerContainer);
      });

      // 3b. Use standard DOM addEventListener instead of Google's addListener


      return marker;
    });

    markerClusterer.addMarkers(markers);
    if (markers.length > 1) map.fitBounds(bounds);
    else {
      map.setCenter(bounds.getCenter());
      map.setZoom(12);
    }
  }));



  onCleanup(() => {
    if (markerClusterer) markerClusterer.clearMarkers();
  });
  return (
    <div class="relative h-full w-full overflow-clip">
      <div ref={mapDiv} style={{ height: '100%', width: '100%' }} />
    </div>
  );
}

export default Map;
