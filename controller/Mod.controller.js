import Redis from "ioredis";
import ModModel from "../models/Mod.model.js"
import AppError from "../utils/error.utlis.js"


const redis = new Redis(); // Connect to Redis

const addMod=async(req,res,next)=>{
      try{

        const {name}=req.body

        if(!name){
            return next(new AppError("All field are Required",400))
        }

        const newUser=new ModModel({name})

        await newUser.save()

        await redis.del("ModSchema")

        res.status(201).json({
            success:true,
            message:"Mod Added Succesfully",
            data:newUser
        })


      }catch(error){
        return next(new AppError(error.message,500))
      }
}

const getAllMod = async (req, res) => {
    try {
        // Check if data is in Redis cache
        const cachedUsers = await redis.get("modUsers");

        if (cachedUsers) {
            console.log(cachedUsers);
            
            return res.status(200).json({ success: true, data: JSON.parse(cachedUsers), cached: true });
        }

        // Fetch from MongoDB if not cached
        const users = await ModModel.find();

        // Store data in Redis with an expiration time of 60 seconds
        await redis.set("modUsers", JSON.stringify(users), "EX", 60);

        console.log(redis.get("modUsers"));
        

        res.status(200).json({
            success:true,
            message:"Mod User get",
            dat:users
        })
    } catch (error) {
        console.log(error);
        
        res.status(500).json({ success: false, message: error.message });
    }
};


export {addMod,getAllMod}