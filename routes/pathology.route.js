import { Router } from "express";
import { addPathologyDetails, deletePathologyDetails, getPathologyDetails, updatePathologyDetails } from "../controller/pathology.controller.js";
import upload from "../middleware/multer.middleware.js";


const pathologyRouter=Router()

pathologyRouter.get("/",getPathologyDetails)
pathologyRouter.post("/",upload.single("pathologyPhoto"),addPathologyDetails)
pathologyRouter.put("/:pathologyDetailId ",updatePathologyDetails)
pathologyRouter.delete("/:id",deletePathologyDetails)



export default pathologyRouter