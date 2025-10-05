// GeoFenceMap.tsx
import "leaflet-draw/dist/leaflet.draw.css";
import "leaflet/dist/leaflet.css";
import React, { useState } from "react";
import {
  FeatureGroup,
  MapContainer,
  Polygon,
  Popup,
  TileLayer,
} from "react-leaflet";
import { EditControl } from "react-leaflet-draw";

interface Geofence {
  id: string;
  name: string;
  color: string;
  coordinates: number[][];
}

interface GeoFenceMapProps {
  onGeofencesChange?: (geofences: Geofence[]) => void;
}

const Dashboard: React.FC<GeoFenceMapProps> = ({ onGeofencesChange }) => {
  const [geofences, setGeofences] = useState<Geofence[]>([]);

  const randomColor = () => {
    const colors = ["red", "blue", "green", "purple", "orange", "teal"];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const handleColorChange = (id: string, newColor: string) => {
    const updated = geofences.map((fence) =>
      fence.id === id ? { ...fence, color: newColor } : fence
    );
    setGeofences(updated);
    if (onGeofencesChange) onGeofencesChange(updated);
  };

  const handleCreated = (e: any) => {
    if (e.layerType === "polygon") {
      const latlngs = e.layer
        .getLatLngs()[0]
        .map((latlng: any) => [latlng.lat, latlng.lng]);

      const name =
        prompt("Nombre de la geocerca:") || `Geocerca-${geofences.length + 1}`;
      const color = randomColor();

      const newFence: Geofence = {
        id: Date.now().toString(),
        name,
        color,
        coordinates: latlngs,
      };

      const updated = [...geofences, newFence];
      setGeofences(updated);
      if (onGeofencesChange) onGeofencesChange(updated);
    }
  };

  const handleEdited = (e: any) => {
    const updated = [...geofences];
    e.layers.eachLayer((layer: any) => {
      const id = layer._leaflet_id.toString();
      const latlngs = layer
        .getLatLngs()[0]
        .map((latlng: any) => [latlng.lat, latlng.lng]);

      const index = updated.findIndex((f) => f.id === id);
      if (index >= 0) {
        updated[index].coordinates = latlngs;
      }
    });
    setGeofences(updated);
    if (onGeofencesChange) onGeofencesChange(updated);
  };

  const handleDeleted = (e: any) => {
    const idsToRemove: string[] = [];
    e.layers.eachLayer((layer: any) => {
      idsToRemove.push(layer._leaflet_id.toString());
    });
    const remaining = geofences.filter((f) => !idsToRemove.includes(f.id));
    setGeofences(remaining);
    if (onGeofencesChange) onGeofencesChange(remaining);
  };

  return (
    <MapContainer
      center={[19.4326, -99.1332]}
      zoom={13}
      style={{ height: "100vh", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <FeatureGroup>
        <EditControl
          position="topright"
          draw={{
            rectangle: false,
            circle: false,
            marker: false,
            circlemarker: false,
            polyline: false,
            polygon: true,
          }}
          edit={{
            remove: true,
          }}
          onCreated={handleCreated}
          onEdited={handleEdited}
          onDeleted={handleDeleted}
        />

        {geofences.map((fence) => (
          <Polygon
            key={fence.id}
            pathOptions={{ color: fence.color }}
            positions={fence.coordinates as [number, number][]}

          >
            <Popup>
              <div style={{ padding: "8px" }}>
                <h3 style={{ margin: "0 0 8px 0", fontSize: "16px" }}>
                  {fence.name}
                </h3>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <label
                    htmlFor={`color-${fence.id}`}
                    style={{ fontSize: "14px" }}
                  >
                    Color:
                  </label>
                  <input
                    id={`color-${fence.id}`}
                    type="color"
                    value={fence.color}
                    onChange={(e) =>
                      handleColorChange(fence.id, e.target.value)
                    }
                    style={{ cursor: "pointer", width: "40px", height: "30px" }}
                  />
                  
                </div>
              </div>
            </Popup>
          </Polygon>
        ))}
      </FeatureGroup>
    </MapContainer>
  );
};

export default Dashboard;
