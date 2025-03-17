import cloudinary from 'cloudinary';
import app from './app.js';
import ConnectionToDB from './config/dbConnection.js';
import Razorpay from 'razorpay';
import { config } from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import MessageModel from './models/Message.model.js';
import checkoutModel from './models/checkout.model.js';


config();

const PORT = process.env.PORT || 5500;

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET
});

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// ✅ Real-time message handling

io.on("connection", async (socket) => {
  console.log("🟢 New client connected:", socket.id);

  // Existing orders भेजना
  const orders = await checkoutModel.find().populate("orderDetails");
  socket.emit("loadOrders", orders);

  socket.on("disconnect", () => {
    console.log("🔴 Client disconnected:", socket.id);
  });
});


app.set("io", io); // Store Socket.io instance in app for global access

server.listen(PORT, async () => {
  await ConnectionToDB();
  console.log(`🚀 App is running at : ${PORT}`);
});
