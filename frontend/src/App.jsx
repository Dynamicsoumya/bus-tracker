import { useEffect, useState } from "react";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

function App() {
  const [buses, setBuses] = useState([]);

  useEffect(() => {
    fetchBuses();
    socket.on("busLocation", (updatedBus) => {
      setBuses((prev) => {
        const filtered = prev.filter(
          (bus) => bus.busNumber !== updatedBus.busNumber
        );
        return [...filtered, updatedBus];
      });
    });

  }, []);

  const fetchBuses = async () => {
    const res = await axios.get("http://localhost:5000/buses");
    setBuses(res.data);
  };
  return (
    <div>
      <h1 style={{ textAlign: "center" }}>
        Smart Bus Tracker
      </h1>

      <MapContainer
        center={[20.2961, 85.8245]}
        zoom={13}
        style={{ height: "90vh", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {buses.map((bus, index) => (
          <Marker
            key={index}
            position={[bus.latitude, bus.longitude]}
          >
           <Popup>
              <h3>{bus.busNumber}</h3>
              <p>Speed: {bus.speed} km/h</p>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

export default App;