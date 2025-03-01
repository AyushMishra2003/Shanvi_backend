import { Router } from "express";
import { addBanner, getBanner } from "../controller/Banner.controller.js";
import upload from "../middleware/multer.middleware.js";


const bannerRoute=Router()

bannerRoute.post("/",upload.single("photo"),addBanner)
bannerRoute.get("/:types",getBanner)

export default bannerRoute
