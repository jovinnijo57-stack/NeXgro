import { useEffect, useRef, useState } from "react";

interface OSMMapPickerProps {
  initialLat: number;
  initialLng: number;
  onLocationSelect: (lat: number, lng: number, address: string) => void;
}

declare const L: any;

export default function OSMMapPicker({
  initialLat,
  initialLng,
  onLocationSelect,
}: OSMMapPickerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const markerInstance = useRef<any>(null);

  const onLocationSelectRef = useRef(onLocationSelect);
  useEffect(() => {
    onLocationSelectRef.current = onLocationSelect;
  }, [onLocationSelect]);

  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 20; // wait up to 2 seconds

    function tryInit() {
      if (mapRef.current && !mapInstance.current) {
        if (typeof (window as any).L === "undefined") {
          attempts++;
          if (attempts < maxAttempts) {
            setTimeout(tryInit, 100);
          } else {
            console.error("Leaflet failed to load after waiting.");
          }
          return;
        }
        const L = (window as any).L;

        // Initialize Map
        mapInstance.current = L.map(mapRef.current).setView(
          [initialLat, initialLng],
          15
        );

        // Add OSM Tiles
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(mapInstance.current);

        // Add Draggable Marker
        markerInstance.current = L.marker([initialLat, initialLng], {
          draggable: true,
        }).addTo(mapInstance.current);

        const reverseGeocode = async (lat: number, lng: number) => {
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
            );
            const data = await res.json();
            onLocationSelectRef.current(lat, lng, data.display_name || `${lat}, ${lng}`);
          } catch (err) {
            onLocationSelectRef.current(lat, lng, `${lat.toFixed(5)}, ${lng.toFixed(5)}`);
          }
        };

        markerInstance.current.on("dragend", async () => {
          const pos = markerInstance.current.getLatLng();
          await reverseGeocode(pos.lat, pos.lng);
        });

        mapInstance.current.on("click", async (e: any) => {
          const { lat, lng } = e.latlng;
          markerInstance.current.setLatLng([lat, lng]);
          await reverseGeocode(lat, lng);
        });
      }
    }

    tryInit();
  }, []);

  // Update center if initials change (and map exists)
  useEffect(() => {
    if (mapInstance.current && markerInstance.current) {
      mapInstance.current.setView([initialLat, initialLng], 15);
      markerInstance.current.setLatLng([initialLat, initialLng]);
    }
  }, [initialLat, initialLng]);

  const handleLocateMe = () => {
    const L = (window as any).L;
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          if (mapInstance.current && markerInstance.current) {
            mapInstance.current.setView([latitude, longitude], 15);
            markerInstance.current.setLatLng([latitude, longitude]);
            
            // Trigger geocoding
            try {
              const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
              );
              const data = await res.json();
              onLocationSelectRef.current(latitude, longitude, data.display_name || `${latitude}, ${longitude}`);
            } catch {
              onLocationSelectRef.current(latitude, longitude, `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
            }
          }
        },
        (error) => {
          console.error("Error detecting location:", error);
          alert("Could not detect location. Please enable location permissions.");
        }
      );
    }
  };

  return (
    <div className="relative w-full h-full">
      <div 
        ref={mapRef} 
        className="w-full h-full rounded-xl"
        style={{ minHeight: "300px", zIndex: 1 }}
      />
      <button
        type="button"
        onClick={handleLocateMe}
        className="absolute bottom-4 right-4 z-[1000] bg-white text-primary p-2 rounded-full shadow-lg border border-border hover:bg-muted transition-colors flex items-center justify-center"
        title="Detect My Location"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="3"/><line x1="12" y1="2" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22"/><line x1="2" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="22" y2="12"/></svg>
      </button>
    </div>
  );
}
