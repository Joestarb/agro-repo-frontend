export interface SensorReading {
  sensorType: string;
  sensorId?: string;
  value: number;
  unit: string;
  coords?: {
    lat: number;
    lon: number;
  };
  timestamp?: string;
}
