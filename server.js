import cloudinary from 'cloudinary';
import app from './app.js';
import ConnectionToDB from './config/dbConnection.js';
import Razorpay from 'razorpay';
import { config } from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import MessageModel from './models/Message.model.js';
import checkoutModel from './models/checkout.model.js';
import collectionModel from './models/collectionSales.js';
import mongoose from 'mongoose';
import OrderModel from './models/order.model.js';
import User from './models/user.model.js';


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

function generateRandomLatLng() {
  const baseLat = 26.8625781; // Base latitude
  const baseLng = 80.999599;  // Base longitude

  // Define a larger range for randomization (1 to 5 degrees)
  const latRange = Math.random() * 5 + 1; // Randomly adds 1 to 5 degrees
  const lngRange = Math.random() * 5 + 1; // Randomly adds 1 to 5 degrees

  // Randomly add or subtract to get more significant distance
  const randomLat = baseLat + (Math.random() < 0.5 ? latRange : -latRange);
  const randomLng = baseLng + (Math.random() < 0.5 ? lngRange : -lngRange);

  console.log("Random LatLng:", randomLat, randomLng);

  return { lat: randomLat, lng: randomLng };
}


const onlineUsers = new Map();
const onlineActiveUsers = new Map()




// ✅ Real-time message handling

io.on("connection", (socket) => {
  console.log("🟢 New Client Connected:", socket.id);

  // 4. Send message to client
  socket.emit("welcome", "🚀 Welcome to the Server!");

  // Listen for room join event
  socket.on("joinRoom", (salesPersonId) => {
    console.log(`🏠 Salesperson ${salesPersonId} joined room: ${salesPersonId}`);
    socket.join(salesPersonId); // Join Room
    onlineUsers.set(salesPersonId, socket.id);
    console.log(`✅ Emitted to all: Babu ${salesPersonId} joined`);
  });

  socket.on("sales-dashboard-join", async (data) => {

    console.log("sales-dashboard-join", data);

    const validSales = await collectionModel.findById(data.salesId);
    let validOrder
    let validUser
    if (validSales) {
      validOrder = await OrderModel.findOne({
        assignedTo: data.salesId,
        bookingStatus: "ongoing"
      });
    }
    if (validOrder) {
      validUser = await User.findById(validOrder.userId)
    }


    if (validSales) {
      validSales.lat = data.lat;
      validSales.lng = data.lng;
    }
    await validSales.save();


    const getSalesData = onlineActiveUsers.get(data.salesId);
      
    console.log("babu ko bheja jaa raha hai ",getSalesData);
    

    if (getSalesData) {
      io.to(getSalesData.socketId).emit("get-updated-sales-lat-lng", {
        sales_lat: data.lat,
         sales_lng: data.lng
      });

      // const { lat, lng } = generateRandomLatLng();


      // io.to(socket).emit("get-updated-sales-lat-lng", { sales_lat: data.lat, sales_lng: data.lng })

      // io.emit("get-updated-sales-lat-lng", { sales_lat: data.lat, sales_lng: data.lng })

    }
    


    // socket.emit("get-updated-sales-lat-lng", { sales_lat: validSales.lat, sales_lng: validSales.lng })

  })


  // socket.on("new-lat-lng", async (data) => {
  //  if(data){
  //     const socketId = onlineUsers.get(data.salesId);
  //     const message="chota don"

  //     if (socketId) {
  //       io.to(socketId).emit("sales-lat-lng", {
  //         lat: data.lat,
  //         lng: data.lng,
  //         message:"bada don",
  //       });
  //     }
  //   }
  // }

  //   console.log(data);




  //  if( data.salesId && data.salesId!="" ){
  //    const validSales = await collectionModel.findById(data.salesId);

  //   if (validSales) {
  //     validSales.lat = data.lat;
  //     validSales.lng = data.lng;
  //   }

  //   if (validSales) {
  //     await validSales.save();

  // }


  // });

  socket.on("change-track-path", async (data) => {
    console.log(data);
    const orderDetail = await OrderModel.findById(data.orderDetailId)


    const validSales = await collectionModel.findById(orderDetail.assignedTo);

    // console.log(validSales)
    const Updateddata = {
      user_lat: orderDetail.lat,
      user_lng: orderDetail.lng,
      sales_lat: validSales.lat,
      sales_lng: validSales.lng
    }

    io.emit("updated-track-lat-lng", Updateddata)
  });

  socket.on("get-sales-lat-lng", async (data) => {
    const validOrder = await OrderModel.findById(data.orderDetailId);

    const validSales = await collectionModel.findById(validOrder.assignedTo);

    // Mapping salesId to userId instead of userId to socket
    socket.join(validOrder.userId);
    onlineActiveUsers.set(validSales._id.toString(), {
      userId: validOrder.userId,
      socketId: socket.id,
    });

    
    
    
    const getSalesData = onlineActiveUsers.get(validSales._id.toString());
    
    
  
    

    if (getSalesData) {
      io.to(getSalesData.socketId).emit("get-updated-sales-lat-lng", {
        sales_lat: validSales.lat,
         sales_lng: validSales.lng
      });

      // const { lat, lng } = generateRandomLatLng();


      // io.to(socket).emit("get-updated-sales-lat-lng", { sales_lat: data.lat, sales_lng: data.lng })

      // io.emit("get-updated-sales-lat-lng", { sales_lat: data.lat, sales_lng: data.lng })

    }

    // socket.emit("get-updated-sales-lat-lng", { sales_lat: validSales.lat, sales_lng: validSales.lng })

  })



  socket.on("check-welcome",(data)=>{
    console.log("welcomep-check",data)
    socket.emit("check-karo","laad-chaata ")
  })

  socket.on("disconnect", () => {
    console.log("❌ Client disconnected:", socket.id);
    for (let [key, value] of onlineUsers.entries()) {
      if (value === socket.id) {
        onlineUsers.delete(key);
        console.log(`🛑 Removed ${key} from onlineUsers.`);
      }
    }


    for (let [key, value] of onlineActiveUsers.entries()) {
      if (value.socketId === socket.id) {
        onlineActiveUsers.delete(key);
        console.log(`🛑 Removed ${key} from onlineActiveUsers.`);
      }
    }
  });


});


app.set("io", io); 
app.set("onlineUsers", onlineUsers); 

server.listen(PORT, async () => {
  await ConnectionToDB();
  console.log(`🚀 App is running at : ${PORT}`);
});
