import { Router } from "express";
import { addCV, deleteCv, getCVs } from "../controller/carrer.Controller.js";
import upload from "../middleware/multer.middleware.js";


const cvRouter=Router()

cvRouter.post("/",upload.single("resume"),addCV)
cvRouter.get("/",getCVs)
cvRouter.delete("/:id",deleteCv)

export default cvRouter