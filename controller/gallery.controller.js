import GalleryModel from "../models/Gallery.model.js"
import AppError from "../utils/error.utlis.js"
import cloudinary from "cloudinary";
import fs from "fs/promises";


const addGalery=async(req,res,next)=>{
    try{
      
        const {name}=req.body

        if(!name){
            return next(new AppError("All field are Required",400))
        }

        const newGalery=await GalleryModel({
            name,
            photo:{
                public_id:"",
                secure_url:""
            }
        })

        if(!newGalery){
            return next(new AppError("Failed to add Gallery",400))
        }

         if (req.file) {
               const result = await cloudinary.v2.uploader.upload(req.file.path, {
                 folder: "lms",
               });
       
               console.log(result);
               
               if (result) {
                 (newGalery.photo.public_id = result.public_id),
                   (newGalery.photo.secure_url = result.secure_url);
               }
               fs.rm(`uploads/${req.file.filename}`);
        }

        await newGalery.save()

        res.status(200).json({
            success:true,
            message:"Gallery Added",
            data:newGalery
        })


    }catch(error){
        return next(new AppError(error.message, 500));
    }
}

const getGallery=async(req,res,next)=>{
    try{
        const gallery=await GalleryModel.find()

        if(!gallery){
            return next(new AppError("Gallery not found",400))
        }

        res.status(200).json({
            success:true,
            message:"Get Gallery",
            data:gallery
        })
    }catch(error){
        return next(new AppError(error.message, 500));
    }
}

const deleteGallery=async(req,res,next)=>{
    try{

        const {id}=req.params

        const validGallery=await GalleryModel.findById(id)

        if(!validGallery){
            return next(new AppError("Gallery not found",400))
        }

        await GalleryModel.findByIdAndDelete(id)

        res.status(200).json({
            success:true,
            message:"Gallery Deleted",
        })

    }catch(error){
        return next(new AppError(error.message, 500));
    }
}


const deleteAllGalleryPhotos = async (req, res, next) => {
    try {
        // Fetch all gallery documents
        const galleries = await GalleryModel.find();

        if (!galleries || galleries.length === 0) {
            return next(new AppError("No galleries found", 400));
        }

        // Loop through each gallery and delete associated photos
        for (const gallery of galleries) {
            const { photos } = gallery;

            if (photos && photos.length > 0) {
                await Promise.all(
                    photos.map(async (photoPath) => {
                        const fullPath = path.resolve(__dirname, '..', 'uploads', photoPath); // Adjust 'uploads' path as needed
                        try {
                            await fs.promises.unlink(fullPath); // Delete file
                            console.log(`Deleted photo: ${fullPath}`);
                        } catch (err) {
                            console.error(`Failed to delete photo: ${fullPath}`, err.message);
                        }
                    })
                );
            }
        }

        // Delete all gallery documents from the database
        await GalleryModel.deleteMany();

        res.status(200).json({
            success: true,
            message: "All galleries and their photos have been deleted successfully.",
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};

export {
    addGalery,
    getGallery,
    deleteGallery,
    deleteAllGalleryPhotos
}