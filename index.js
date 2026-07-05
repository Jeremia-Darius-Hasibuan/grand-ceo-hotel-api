import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";

import Sequelize from "./config/db.js";

const app = express();
const port = process.env.PORT || 3000;

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
  },
});

app.use(express.json());
app.use(express.static("public"));

app.set("io", io);

io.on("connection", (socket) => {
  console.log(` User terhubung dengan Socket ID: ${socket.id}`);

  socket.on("disconnect", () => {
    console.log(" User terputus dari socket");
  });
});

// ==========================================
// IMPORT MODELS
// ==========================================
import User from "./models/user.js";
import Room from "./models/room.js";
import Reservasi from "./models/reservasi.js";
import Payment from "./models/payment.js";
import Review from "./models/review.js";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import roomRoutes from "./routes/roomRoutes.js";
import reservasiRoutes from "./routes/reservasiRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";

app.use(authRoutes);
app.use(userRoutes);
app.use(roomRoutes);
app.use(reservasiRoutes);
app.use(paymentRoutes);
app.use(reviewRoutes);

Sequelize.sync({ alter: true })
  .then(() => {
    console.log(" Tabel di Database berhasil disinkronisasi otomatis!");
    httpServer.listen(port, () => console.log(` Server & Socket.io berjalan di http://localhost:${port}`));
  })
  .catch((err) => {
    console.error(" Gagal sinkronisasi database:", err);
  });
