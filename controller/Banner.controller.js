import AppError from "../utils/error.utlis.js"
import cloudinary from "cloudinary";
import fs from "fs/promises";
import BannerModel from "../models/Banner.model.js";
import { log } from "console";



const addBanner = async (req, res, next) => {
    try {

        const { name, types ,index} = req.body

        console.log(req.body);
        

        if (!name || !types ) {
            return next(new AppError("All field are Required", 400))
        }

        const createBanner = new BannerModel({
            name,
            types,
            index,
            photo: {
                public_id: "",
                secure_url: ""
            }
        })

        if (req.file) {
            const result = await cloudinary.v2.uploader.upload(req.file.path, {
                folder: "lms",
            });

            if (result) {
                (createBanner.photo.public_id = result.public_id),
                    (createBanner.photo.secure_url = result.secure_url);
            }
            fs.rm(`uploads/${req.file.filename}`);
        }

        await createBanner.save()


        res.status(200).json({
            success:true,
            message:"Banner added succesfully",
            data:createBanner
        })



    } catch (error) {
        return next(new AppError(error.message, 500))
    }
}


const getBanner=async(req,res,next)=>{
     try{
        
        const {types}=req.params

        console.log(types);
        
        const allBanner=await BannerModel.find({types})

        if(!allBanner){
              return next(new AppError("Banner not Found",400))
        }

        res.status(200).json({
             success:true,
             message:"All Banner",
             data:allBanner
        })

     }catch(error){
         return next(new AppError(error.message,500))
     }
}

export {
     addBanner,
     getBanner
}