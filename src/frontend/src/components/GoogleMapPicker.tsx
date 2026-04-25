import { useEffect, useRef, useState } from "react";

interface GoogleMapPickerProps {
  initialLat?: number;
  initialLng?: number;
  onLocationSelect: (lat: number, lng: number, address: string) => void;
}

declare const google: any;

export function GoogleMapPicker({
  initialLat = 12.9716,
  initialLng = 77.5946,
  onLocationSelect,
}: GoogleMapPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);
  const [marker, setMarker] = useState<any>(null);

  useEffect(() => {
    if (mapRef.current && !map) {
      if (typeof google === 'undefined' || !google.maps) {
        console.error("Google Maps script not loaded yet or failed.");
        return;
      }

      try {
        const gMap = new google.maps.Map(mapRef.current, {
          center: { lat: initialLat, lng: initialLng },
          zoom: 15,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
        });

        const gMarker = new google.maps.Marker({
          position: { lat: initialLat, lng: initialLng },
          map: gMap,
          draggable: true,
        });

        setMap(gMap);
        setMarker(gMarker);

        const geocoder = new google.maps.Geocoder();

        const updateLocation = (latLng: any) => {
          const lat = latLng.lat();
          const lng = latLng.lng();
          geocoder.geocode({ location: latLng }, (results: any, status: string) => {
            if (status === "OK" && results?.[0]) {
              onLocationSelect(lat, lng, results[0].formatted_address);
            } else {
              onLocationSelect(lat, lng, `${lat.toFixed(5)}, ${lng.toFixed(5)}`);
            }
          });
        };

        gMap.addListener("click", (e: any) => {
          if (e.latLng) {
            gMarker.setPosition(e.latLng);
            updateLocation(e.latLng);
          }
        });

        gMarker.addListener("dragend", () => {
          const pos = gMarker.getPosition();
          if (pos) {
            updateLocation(pos);
          }
        });
      } catch (err) {
        console.error("Error initializing Google Map:", err);
      }
    }
  }, [mapRef, onLocationSelect, initialLat, initialLng, map]);

  return (
    <div 
      ref={mapRef} 
      data-google-map="true"
      className="w-full h-full rounded-xl"
      style={{ minHeight: "250px" }}
    />
  );
}
