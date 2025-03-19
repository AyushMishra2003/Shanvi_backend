import AppError from "../utils/error.utlis.js"
import cloudinary from "cloudinary";
import fs from "fs/promises";
import BannerModel from "../models/Banner.model.js";
import { log } from "console";



const addBanner = async (req, res, next) => {
    try {

        const { name, types, index } = req.body

        if (!types) {
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
            success: true,
            message: "Banner added succesfully",
            data: createBanner
        })



    } catch (error) {
        console.log(error);
        
        return next(new AppError(error.message, 500))
    }
}


const getBanner = async (req, res, next) => {
    try {
   
        console.log("chala");
        
        const { types } = req.params

        console.log(req.params);
        

        console.log(types);

        const allBanner = await BannerModel.find({ types })

        if (!allBanner) {
            return next(new AppError("Banner not Found", 400))
        }

        res.status(200).json({
            success: true,
            message: "All Banner",
            data: allBanner
        })

    } catch (error) {
        return next(new AppError(error.message, 500))
    }
}

const editBanner = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, types, index } = req.body;

        if (!id) {
            return next(new AppError("Banner ID is required", 400));
        }

        // Pehle banner ko find karo
        const banner = await BannerModel.findById(id);
        if (!banner) {
            return next(new AppError("Banner not found", 404));
        }

        // Agar naye fields aaye toh update karo
        if (name) banner.name = name;
        if (types) banner.types = types;
        if (index) banner.index = index;

        // Agar naye file aaye toh pehle purani file delete karke nayi upload karo
        if (req.file) {
            // Purani photo Cloudinary se delete karo agar hai toh
            if (banner.photo.public_id) {
                await cloudinary.v2.uploader.destroy(banner.photo.public_id);
            }

            // Nayi file upload karo Cloudinary par
            const result = await cloudinary.v2.uploader.upload(req.file.path, {
                folder: "lms",
            });

            // Naya photo set karo
            banner.photo.public_id = result.public_id;
            banner.photo.secure_url = result.secure_url;

            // Local uploads folder se file delete karo
            fs.rm(`uploads/${req.file.filename}`);
        }

        // Updated banner save karo
        await banner.save();

        res.status(200).json({
            success: true,
            message: "Banner updated successfully",
            data: banner,
        });
    } catch (error) {
        console.log(error);
        return next(new AppError(error.message, 500));
    }
};



const getAllBanner = async (req, res, next) => {
    try {


        const allBanner = await BannerModel.find({})




        if (!allBanner) {
            return next(new AppError("Banner not Found", 400))
        }

        res.status(200).json({
            success: true,
            message: "All Banner",
            data: allBanner
        })

    } catch (error) {
        return next(new AppError(error.message, 500))
    }
}


const deleteBanner = async (req, res, next) => {
    try {

        const {id} = req.params

        const validBanner = await BannerModel.findById(id)

        if (!validBanner) {
            return next(new AppError("Banner not Found", 400))
        }

        await BannerModel.findByIdAndDelete(id)

        res.status(200).json({
            success: true,
            message: "Delete Banner Succesfully",
           
        })

    } catch (error) {
        return next(new AppError(error.message, 500))
    }
}

export {
    addBanner,
    getBanner,
    getAllBanner,
    deleteBanner,
    editBanner
}