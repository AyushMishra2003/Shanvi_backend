import { Router } from "express";
import { addBanner, deleteBanner, editBanner, getAllBanner, getBanner } from "../controller/Banner.controller.js";
import upload from "../middleware/multer.middleware.js";
import isAdmin from "../middleware/isAdmin.controller.js";


const bannerRoute=Router()

bannerRoute.post("/",upload.single("photo"),isAdmin,addBanner)
bannerRoute.get("/",getAllBanner)
bannerRoute.get("/:types",getBanner)
bannerRoute.put("/:id",upload.single("photo"),editBanner)
bannerRoute.delete("/:id",deleteBanner)


export default bannerRoute
