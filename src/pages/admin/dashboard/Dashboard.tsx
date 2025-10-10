// GeoFenceMap.tsx

import "leaflet-draw/dist/leaflet.draw.css";
import "leaflet/dist/leaflet.css";
import React, { useEffect, useRef, useState } from "react";
import {
  FeatureGroup,
  MapContainer,
  Polygon,
  Popup,
  TileLayer,
} from "react-leaflet";
import { EditControl } from "react-leaflet-draw";

import { 
  ParcelaPayload,
  useGetParcelasQuery, 
  useCreateParcelaMutation,
  useUpdateParcelaMutation,
  useDeleteParcelaMutation
} from "../../../services/parcelas"; 
// Asegúrate de que la ruta '../services/parcelaApi' sea correcta
import { Parcela } from "../../../interfaces/parcela";

// Extiende la interfaz Geofence para incluir el ID de la base de datos (dbId)
interface Geofence {
  id: string; // ID local de Leaflet
  dbId?: number; // ID de la Base de Datos
  name: string;
  color: string;
  coordinates: number[][]; // [lat, lng]
}

interface Lote {
  name: string;
  location: string;
  centerCoordinates: { lat: number; lng: number };
}

interface GeoFenceMapProps {
  onGeofencesChange?: (geofences: Geofence[]) => void;
}

// ---------------------------------------------------------------------
// --- FUNCIONES AUXILIARES ---

// Función para intentar parsear las coordenadas desde un string JSON
const parseCoordinates = (ubicacion: string): number[][] | null => {
  if (!ubicacion) return null;
  try {
    const coords = JSON.parse(ubicacion);
    // Verifica que sea un array de arrays (el formato de coordenadas)
    if (Array.isArray(coords) && coords.every(Array.isArray) && coords.length >= 3) {
      return coords as number[][];
    }
    return null;
  } catch (e) {
    return null; 
  }
};

// Función para calcular el área (Fórmula de Shoelace)
const calculateArea = (coordinates: number[][]): number => {
    if (coordinates.length < 3) return 0;
    const points = coordinates.map(([lat, lng]) => [lat, lng]); 
    let area = 0;
    for (let i = 0; i < points.length; i++) {
      const j = (i + 1) % points.length;
      area += points[i][0] * points[j][1]; 
      area -= points[j][0] * points[i][1];
    }
    return Math.abs(area / 2); 
};

// Función para calcular el centroide
const calculateCentroid = (coordinates: number[][]) => {
    let latSum = 0;
    let lngSum = 0;
    coordinates.forEach(([lat, lng]) => {
        latSum += lat;
        lngSum += lng;
    });
    return {
        lat: latSum / coordinates.length,
        lng: lngSum / coordinates.length,
    };
};

const randomColor = () => {
    const colors = ["#dc3545", "#007bff", "#28a745", "#6f42c1", "#ffc107", "#17a2b8"];
    return colors[Math.floor(Math.random() * colors.length)];
};


// ---------------------------------------------------------------------
// --- COMPONENTE DASHBOARD ---

const Dashboard: React.FC<GeoFenceMapProps> = ({ onGeofencesChange }) => {
  const [geofences, setGeofences] = useState<Geofence[]>([]);
  const lote = {
    name: "Lote Principal",
    location: "Ciudad de México",
    centerCoordinates: { lat: 19.4326, lng: -99.1332 },
  };
  const featureGroupRef = useRef<any>(null);

  // Hooks de RTK Query
  const { data: parcelasData, isLoading: isLoadingParcelas, error: errorParcelas } = useGetParcelasQuery();
  const [createParcela, { isLoading: isCreating }] = useCreateParcelaMutation();
  const [updateParcela, { isLoading: isUpdating }] = useUpdateParcelaMutation();
  const [deleteParcela, { isLoading: isDeleting }] = useDeleteParcelaMutation();


  // 🚨 1. CARGA INICIAL DE DATOS CON PARSEO DE COORDENADAS
  useEffect(() => {
    if (parcelasData) {
      const initialGeofences: Geofence[] = parcelasData.map(p => {
        
        // Intentar parsear las coordenadas del campo 'ubicacion'
        const parsedCoords = parseCoordinates(p.ubicacion);

        // Si el parseo es exitoso, usar las coordenadas. 
        // Si falla (o el campo tiene la dirección de texto), usar un polígono por defecto como fallback.
        const coords = parsedCoords || [
          [lote.centerCoordinates.lat + 0.005, lote.centerCoordinates.lng + 0.005],
          [lote.centerCoordinates.lat + 0.005, lote.centerCoordinates.lng - 0.005],
          [lote.centerCoordinates.lat - 0.005, lote.centerCoordinates.lng - 0.005],
          [lote.centerCoordinates.lat - 0.005, lote.centerCoordinates.lng + 0.005],
        ];

        return {
          id: p.id.toString(),
          dbId: p.id,
          name: p.nombre,
          color: randomColor(), 
          coordinates: coords,
        };
      });

      setGeofences(initialGeofences);
      if (onGeofencesChange) onGeofencesChange(initialGeofences);
    }
    
    if (errorParcelas) {
      console.error("Error al cargar parcelas iniciales:", errorParcelas);
    }
  }, [parcelasData]);


  // ---------------------------------------------------------------------
  // --- HANDLERS DE CREACIÓN, EDICIÓN Y ELIMINACIÓN ---

  // 2. CREACIÓN (POST)
  const handleCreated = async (e: any) => {
    if (e.layerType === "polygon") {
      const latlngs = e.layer
        .getLatLngs()[0]
        .map((latlng: any) => [latlng.lat, latlng.lng]);

      const name =
        prompt("Nombre de la Parcela:") || `Parcela-${geofences.length + 1}`;
      const area = calculateArea(latlngs);

      const parcelaData: ParcelaPayload = {
        nombre: name,
        ubicacion: JSON.stringify(latlngs), // Guarda las coordenadas como JSON string
        tamaño: area, 
        ectarias: `${area.toFixed(4)} grados²`, 
      };

      try {
        const result = await createParcela(parcelaData).unwrap();
        
        const newFence: Geofence = {
          id: result.id.toString(), // ID de la BD
          dbId: result.id,
          name: result.nombre,
          color: randomColor(),
          coordinates: latlngs,
        };

        const updated = [...geofences, newFence];
        setGeofences(updated);
        // Asigna el ID de BD a la capa de Leaflet para rastrearlo en la edición/eliminación
        e.layer._leaflet_id = result.id.toString(); 

        alert(`Parcela "${name}" creada con ID ${result.id}.`);

      } catch (error) {
        console.error("Error al crear la parcela en la BD:", error);
        e.layer.remove(); 
        alert("Error al guardar la parcela en el servidor. Revise la consola.");
      }
    }
  };
  
  // 3. EDICIÓN (PUT)
  const handleEdited = async (e: any) => {
    e.layers.eachLayer(async (layer: any) => {
      // Intenta obtener el dbId de las opciones (si se adjuntó) o del ID de leaflet
      const dbId = layer.options.dbId || Number(layer._leaflet_id);
      if (!dbId || isNaN(dbId)) return;

      const latlngs = layer
        .getLatLngs()[0]
        .map((latlng: any) => [latlng.lat, latlng.lng]);

      const updatedArea = calculateArea(latlngs);

      const updatedData: ParcelaPayload = {
        ubicacion: JSON.stringify(latlngs), // Guarda las coordenadas actualizadas
        tamaño: updatedArea,
        ectarias: `${updatedArea.toFixed(4)} grados² (Editado)`,
      };
      
      try {
        await updateParcela({ id: dbId, data: updatedData }).unwrap();
        // RTK Query recargará los datos
        alert(`Parcela ID ${dbId} actualizada.`);
      } catch (error) {
        console.error("Error al actualizar la parcela:", error);
        alert("Error al actualizar la parcela en el servidor.");
      }
    });
  };

  // 4. ELIMINACIÓN (DELETE)
  const handleDeleted = async (e: any) => {
    e.layers.eachLayer(async (layer: any) => {
      const dbId = layer.options.dbId || Number(layer._leaflet_id);
      if (!dbId || isNaN(dbId)) return;

      try {
        await deleteParcela(dbId).unwrap();
        // RTK Query recargará los datos
        alert(`Parcela ID ${dbId} eliminada.`);
      } catch (error) {
        console.error("Error al eliminar la parcela:", error);
        alert("Error al eliminar la parcela del servidor.");
      }
    });
  };
  
  // 5. EDICIÓN DE NOMBRE (PUT) desde el Popup
  const editGeofenceName = async (id: string, currentName: string) => {
    const dbId = geofences.find(f => f.id === id)?.dbId;
    if (!dbId) return;

    const newName = prompt("Editar nombre de la parcela:", currentName);
    if (newName && newName !== currentName) {
      try {
        await updateParcela({ id: dbId, data: { nombre: newName } }).unwrap();
        alert(`Nombre de parcela ID ${dbId} actualizado a "${newName}".`);
      } catch (error) {
        console.error("Error al editar el nombre:", error);
        alert("Error al actualizar el nombre en el servidor.");
      }
    }
  };
  
  // 6. ELIMINACIÓN (DELETE) desde el Popup
  const deleteGeofence = async (id: string) => {
    const fence = geofences.find(f => f.id === id);
    const dbId = fence?.dbId;
    if (!dbId) return;

    if (confirm(`¿Estás seguro de que quieres eliminar la parcela "${fence.name}" (ID ${dbId})?`)) {
      try {
        // Necesitamos eliminar la capa de Leaflet manualmente para que no quede visualmente
        featureGroupRef.current.eachLayer((layer: any) => {
            if (Number(layer._leaflet_id) === dbId) {
                featureGroupRef.current.removeLayer(layer);
            }
        });
        
        await deleteParcela(dbId).unwrap();
        alert(`Parcela ID ${dbId} eliminada.`);
        // El estado 'geofences' se actualizará cuando RTK Query recargue los datos
      } catch (error) {
        console.error("Error al eliminar la parcela:", error);
        alert("Error al eliminar la parcela del servidor.");
      }
    }
  };
  
  // ---------------------------------------------------------------------
  // --- RENDERIZADO ---

  return (
    <div style={{ position: "relative", height: "100vh", width: "100%" }}>
      {/* Panel de controles */}
      <div
        style={{
          position: "absolute", top: "10px", left: "10px", zIndex: 1000, backgroundColor: "white", padding: "15px", borderRadius: "8px", boxShadow: "0 2px 10px rgba(0,0,0,0.1)", minWidth: "250px",
        }}
      >
        <h3 style={{ margin: "0 0 10px 0", fontSize: "16px" }}>
          Control de Parcelas
        </h3>

        <div style={{ marginBottom: "10px" }}>
          <strong>Cargando:</strong> {isLoadingParcelas ? 'Sí' : 'No'} | 
          <strong> Parcelas:</strong> {geofences.length}
          {(isCreating || isUpdating || isDeleting) && <span> (Sincronizando...)</span>}
        </div>
        
        {/* ... Botones de imprimir y limpiar ... */}
      </div>

      {/* Mapa de Leaflet */}
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
              rectangle: false, circle: false, marker: false, circlemarker: false, polyline: false,
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
              // IMPORTANTE: Adjuntar el ID de la BD a la capa para la edición/eliminación
              dbId={fence.dbId} 
              leaflet_id={fence.dbId} // Usamos el ID de BD para el rastreo de Leaflet
            >
              <Popup>
                <div style={{ padding: "8px", minWidth: "200px" }}>
                  <h3 style={{ margin: "0 0 8px 0", fontSize: "16px" }}>
                    {fence.name}
                  </h3>
                  <div style={{ marginBottom: "8px" }}>
                    <small style={{ color: "#666" }}>ID BD: {fence.dbId || 'N/A'}</small>
                  </div>

                  <div
                    style={{ display: "flex", gap: "5px", flexWrap: "wrap" }}
                  >
                    <button
                      onClick={() => editGeofenceName(fence.id, fence.name)}
                      style={{ padding: "4px 8px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "3px", cursor: "pointer", fontSize: "12px", flex: "1",}}
                    >
                      ✏️ Editar Nombre
                    </button>
                    <button
                      onClick={() => deleteGeofence(fence.id)}
                      style={{ padding: "4px 8px", backgroundColor: "#dc3545", color: "white", border: "none", borderRadius: "3px", cursor: "pointer", fontSize: "12px", flex: "1",}}
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