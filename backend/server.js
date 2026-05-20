const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 30000,
})
.then(() => {
  console.log("MongoDB Connected");
})
.catch((err) => {
  console.log("Mongo Error:", err.message);
});

const BusSchema = new mongoose.Schema({
  busNumber: String,
  latitude: Number,
  longitude: Number,
  speed: Number
});

const Bus = mongoose.model("Bus", BusSchema);

app.get("/buses", async (req, res) => {
  const buses = await Bus.find();
  res.json(buses);
});
app.post("/update-location", async (req, res) => {
  const { busNumber, latitude, longitude, speed } = req.body;

  const updatedBus = await Bus.findOneAndUpdate(
    { busNumber },
    { latitude, longitude, speed },
    { new: true, upsert: true }
  );

  io.emit("busLocation", updatedBus);

  res.json({ message: "Location Updated" });
});
io.on("connection", (socket) => {
  console.log("User Connected");
});

const PORT = 8080;
server.listen(PORT, () => {  console.log(`Server running on ${PORT}`);

});