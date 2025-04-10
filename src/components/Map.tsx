"use client";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useState } from "react";

// Import marker images
import markerIconUrl from "leaflet/dist/images/marker-icon.png";
import markerIconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import markerShadowUrl from "leaflet/dist/images/marker-shadow.png";

// Fix Leaflet marker image issue
interface LeafletIconDefault extends L.Icon.Default {
  _getIconUrl?: (name: string) => string;
}
const defaultIcon = L.Icon.Default.prototype as LeafletIconDefault;
delete defaultIcon._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIconRetinaUrl,
  iconUrl: markerIconUrl,
  shadowUrl: markerShadowUrl,
});

// Custom Icon
const customIcon = L.icon({
  iconUrl: "/icons/location.png",
  iconSize: [60, 60],
  iconAnchor: [30, 60],
  popupAnchor: [0, -60],
});

type Coordinates = {
  latitude: number;
  longitude: number;
};

type MapProps = {
  height: number;
  coordinates: Coordinates | null;
  onLocationSelect: (coords: Coordinates) => void;
};

function LocationSelector({
  onLocationSelect,
}: {
  onLocationSelect: (coords: Coordinates) => void;
}) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      onLocationSelect({ latitude: lat, longitude: lng });
    },
  });
  return null;
}

function Map({ height, coordinates, onLocationSelect }: MapProps) {
  const defaultPosition: [number, number] = [
    -34.40755818806117, 150.87911127658157,
  ];
  const [markerPos, setMarkerPos] = useState<[number, number] | null>(
    coordinates ? [coordinates.latitude, coordinates.longitude] : null,
  );

  useEffect(() => {
    if (coordinates) {
      setMarkerPos([coordinates.latitude, coordinates.longitude]);
    }
  }, [coordinates]);

  return (
    <MapContainer
      center={markerPos ?? defaultPosition}
      zoom={13}
      style={{ height: `${height}px`, width: "100%", borderRadius: "10px" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <LocationSelector
        onLocationSelect={(coords) => {
          setMarkerPos([coords.latitude, coords.longitude]);
          onLocationSelect(coords);
        }}
      />
      {markerPos && (
        <Marker position={markerPos} icon={customIcon}>
          <Popup>Selected Location</Popup>
        </Marker>
      )}
    </MapContainer>
  );
}

export default Map;
