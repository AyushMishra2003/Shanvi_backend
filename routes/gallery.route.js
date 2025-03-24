import { Router } from "express";
import { addGalery, deleteAllGalleryPhotos, deleteGallery, editGalery, getGallery } from "../controller/gallery.controller.js";
import upload from "../middleware/multer.middleware.js";

const galleryRoute=Router()


galleryRoute.get("/",getGallery)
galleryRoute.delete("",deleteAllGalleryPhotos)
galleryRoute.post("/",upload.single("photo"),addGalery)
galleryRoute.put("/:id",upload.single("photo"),editGalery)
galleryRoute.delete("/:id",deleteGallery)


export default galleryRoute


