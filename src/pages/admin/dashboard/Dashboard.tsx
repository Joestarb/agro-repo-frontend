// GeoFenceMap.tsx
import "leaflet-draw/dist/leaflet.draw.css";
import "leaflet/dist/leaflet.css";
import React, { useRef, useState } from "react";
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

interface Lote {
  name: string;
  location: string;
  centerCoordinates: { lat: number; lng: number };
}

interface GeoFenceMapProps {
  onGeofencesChange?: (geofences: Geofence[]) => void;
}

const Dashboard: React.FC<GeoFenceMapProps> = ({ onGeofencesChange }) => {
  const [geofences, setGeofences] = useState<Geofence[]>([]);
  const [lote, setLote] = useState<Lote>({
    name: "",
    location: "",
    centerCoordinates: { lat: 19.4326, lng: -99.1332 },
  });
  const featureGroupRef = useRef<any>(null);

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

  // Función para calcular el área de una geocerca (aproximación)
  const calculateArea = (coordinates: number[][]) => {
    if (coordinates.length < 3) return 0;

    let area = 0;
    for (let i = 0; i < coordinates.length; i++) {
      const j = (i + 1) % coordinates.length;
      area += coordinates[i][0] * coordinates[j][1];
      area -= coordinates[j][0] * coordinates[i][1];
    }
    return Math.abs(area / 2);
  };

  // Función para imprimir todos los datos del mapa
  const printMapData = () => {
    console.log("=== DATOS DEL MAPA ===");
    console.log("\n📍 INFORMACIÓN DEL LOTE:");
    console.log(`Nombre del Lote: ${lote.name || "No especificado"}`);
    console.log(`Ubicación: ${lote.location || "No especificada"}`);
    console.log(
      `Coordenadas del Centro: Lat ${lote.centerCoordinates.lat}, Lng ${lote.centerCoordinates.lng}`
    );

    console.log(`\n🗺️ GEOCERCAS DIBUJADAS (${geofences.length} total):`);

    if (geofences.length === 0) {
      console.log("No hay geocercas dibujadas.");
    } else {
      geofences.forEach((fence, index) => {
        const area = calculateArea(fence.coordinates);
        console.log(`\n--- Geocerca ${index + 1} ---`);
        console.log(`Nombre: ${fence.name}`);
        console.log(`ID: ${fence.id}`);
        console.log(`Color: ${fence.color}`);
        console.log(`Número de puntos: ${fence.coordinates.length}`);
        console.log(`Área aproximada: ${area.toFixed(6)} unidades²`);
        console.log(`Coordenadas:`);
        fence.coordinates.forEach((coord, coordIndex) => {
          console.log(
            `  Punto ${coordIndex + 1}: Lat ${coord[0].toFixed(
              6
            )}, Lng ${coord[1].toFixed(6)}`
          );
        });
      });
    }

    console.log("\n=== FIN DATOS DEL MAPA ===");

    // También mostrar un alert para el usuario
    alert(
      `Datos impresos en consola:\n\nLote: ${
        lote.name || "Sin nombre"
      }\nUbicación: ${lote.location || "Sin ubicación"}\nGeocercas: ${
        geofences.length
      }\n\nRevisa la consola del navegador (F12) para ver el detalle completo.`
    );
  };

  // Función para editar el nombre de una geocerca
  const editGeofenceName = (id: string, currentName: string) => {
    const newName = prompt("Editar nombre de la geocerca:", currentName);
    if (newName && newName !== currentName) {
      const updated = geofences.map((fence) =>
        fence.id === id ? { ...fence, name: newName } : fence
      );
      setGeofences(updated);
      if (onGeofencesChange) onGeofencesChange(updated);
    }
  };

  // Función para eliminar una geocerca específica
  const deleteGeofence = (id: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar esta geocerca?")) {
      const remaining = geofences.filter((f) => f.id !== id);
      setGeofences(remaining);
      if (onGeofencesChange) onGeofencesChange(remaining);

      // Limpiar manualmente las capas de Leaflet para evitar manchas residuales
      if (featureGroupRef.current) {
        const featureGroup = featureGroupRef.current;
        featureGroup.eachLayer((layer: any) => {
          if (layer._drawnByUser) {
            featureGroup.removeLayer(layer);
          }
        });
      }
    }
  };

  // Función para limpiar todas las geocercas
  const clearAllGeofences = () => {
    if (confirm("¿Estás seguro de que quieres eliminar todas las geocercas?")) {
      setGeofences([]);
      if (onGeofencesChange) onGeofencesChange([]);

      // Limpiar manualmente todas las capas de Leaflet
      if (featureGroupRef.current) {
        featureGroupRef.current.clearLayers();
      }
    }
  };

  return (
    <div style={{ position: "relative", height: "100vh", width: "100%" }}>
      {/* Panel de controles */}
      <div
        style={{
          position: "absolute",
          top: "10px",
          left: "10px",
          zIndex: 1000,
          backgroundColor: "white",
          padding: "15px",
          borderRadius: "8px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
          minWidth: "250px",
        }}
      >
        <h3 style={{ margin: "0 0 10px 0", fontSize: "16px" }}>
          Control del Mapa
        </h3>

        <div style={{ marginBottom: "10px" }}>
          <strong>Lote:</strong> {lote.name || "Sin nombre"}
          <br />
          <strong>Ubicación:</strong> {lote.location || "Sin ubicación"}
          <br />
          <strong>Geocercas:</strong> {geofences.length}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <button
            onClick={printMapData}
            style={{
              padding: "8px 12px",
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            🖨️ Imprimir Datos
          </button>

          {geofences.length > 0 && (
            <button
              onClick={clearAllGeofences}
              style={{
                padding: "8px 12px",
                backgroundColor: "#dc3545",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              🗑️ Limpiar Todo
            </button>
          )}
        </div>
      </div>

      <MapContainer
        center={[lote.centerCoordinates.lat, lote.centerCoordinates.lng]}
        zoom={13}
        style={{ height: "100vh", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FeatureGroup ref={featureGroupRef}>
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
                <div style={{ padding: "8px", minWidth: "200px" }}>
                  <h3 style={{ margin: "0 0 8px 0", fontSize: "16px" }}>
                    {fence.name}
                  </h3>

                  <div style={{ marginBottom: "8px" }}>
                    <small style={{ color: "#666" }}>ID: {fence.id}</small>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginBottom: "10px",
                    }}
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
                      style={{
                        cursor: "pointer",
                        width: "40px",
                        height: "30px",
                      }}
                    />
                  </div>

                  <div
                    style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}
                  >
                    <button
                      onClick={() => editGeofenceName(fence.id, fence.name)}
                      style={{
                        padding: "4px 8px",
                        backgroundColor: "#007bff",
                        color: "white",
                        border: "none",
                        borderRadius: "3px",
                        cursor: "pointer",
                        fontSize: "12px",
                        flex: "1",
                      }}
                    >
                      ✏️ Editar
                    </button>
                    <button
                      onClick={() => deleteGeofence(fence.id)}
                      style={{
                        padding: "4px 8px",
                        backgroundColor: "#dc3545",
                        color: "white",
                        border: "none",
                        borderRadius: "3px",
                        cursor: "pointer",
                        fontSize: "12px",
                        flex: "1",
                      }}
                    >
                      🗑️ Eliminar
                    </button>
                  </div>
                </div>
              </Popup>
            </Polygon>
          ))}
        </FeatureGroup>
      </MapContainer>
    </div>
  );
};

export default Dashboard;
