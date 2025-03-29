// /routes/notification.js
import express from "express";
import admin from "../firebase.js"
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

// ✅ Validate FCM Token Function
const isValidToken = (token) => {
  const fcmTokenRegex = /^[a-zA-Z0-9\-\_:]+$/;
  return fcmTokenRegex.test(token);
};

// ✅ Send Notification Function
const sendNotification = async (deviceToken, title, body) => {
  try {
    const message = {
      token: deviceToken,
      notification: {
        title,
        body,
      },
      android: {
        priority: "high",
      },
      apns: {
        headers: {
          "apns-priority": "10",
        },
      },
    };


    console.log("send notifcation is ",deviceToken);
    

    // ✅ Send message using Firebase Admin
    const response = await admin.messaging().send(message);
    console.log("Notification sent:", response);
    return response;
  } catch (error) {
    console.error("Error sending notification:", error);
    throw error;
  }
};

// ✅ Route to Send Notification
router.post("/send", async (req,res,next) => {
//   const { title, body } = req.body;

  const title="Test Notification";
  const body="Hello from Firebase!";
  const deviceToken = process.env.DEVICE_TOKEN;





  console.log(deviceToken);


  if (!deviceToken || !isValidToken(deviceToken)) {
    return res.status(400).json({ error: "Invalid or missing device token." });
  }
  

  if (!title || !body) {
    return res.status(400).json({ error: "Title and body are required." });
  }

  if (!deviceToken || !isValidToken(deviceToken)) {
    return res.status(400).json({ error: "Invalid or missing device token." });
  }

  try {
    const response = await sendNotification(deviceToken, title, body);
    res.status(200).json({ message: "Notification sent", response });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default sendNotification;
