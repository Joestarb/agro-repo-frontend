import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

interface SensorReading {
  sensorType: string;
  sensorId?: string;
  value: number;
  unit?: string;
  timestamp?: string;
}

export function useSensorSocket(gatewayUrl: string) {
  const [lastTemperature, setLastTemperature] = useState<SensorReading | null>(
    null
  );

  useEffect(() => {
    const socket: Socket = io(gatewayUrl, {
      transports: ["websocket"],
    });

    socket.on("connect", () => {
      console.log("✅ Conectado al gateway de sensores");
    });

    socket.on("reading", (reading: SensorReading) => {
      if (reading.sensorType.toLowerCase().includes("temp")) {
        setLastTemperature({
          ...reading,
          timestamp: new Date().toISOString(),
        });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [gatewayUrl]);

  return lastTemperature;
}
