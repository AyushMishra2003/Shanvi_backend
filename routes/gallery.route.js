import { Router } from "express";
import { addGalery, deleteAllGalleryPhotos, deleteGallery, getGallery } from "../controller/gallery.controller.js";
import upload from "../middleware/multer.middleware.js";

const galleryRoute=Router()


galleryRoute.get("/",getGallery)
galleryRoute.delete("",deleteAllGalleryPhotos)
galleryRoute.post("/",upload.single("photo"),addGalery)
galleryRoute.delete("/:id",deleteGallery)


export default galleryRoute


