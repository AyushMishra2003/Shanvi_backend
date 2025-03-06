import { Router } from "express";
import { addLabTag, addPathologyDetails, deleteLabTag, deletePathologyDetails, editLabTag, getLabTag, getPathologyDetails, singlePathology, updatePathologyDetails } from "../controller/pathology.controller.js";
import upload from "../middleware/multer.middleware.js";


const pathologyRouter=Router()

pathologyRouter.get("/",getPathologyDetails)
pathologyRouter.get("/tag",getLabTag)
pathologyRouter.get("/:slug",singlePathology)
pathologyRouter.post("/tag/:slug",upload.single("icon"),addLabTag)
pathologyRouter.post("/",upload.single("pathologyPhoto"),addPathologyDetails)
pathologyRouter.put("/:pathologyDetailId",updatePathologyDetails)
pathologyRouter.put("/tag/:id",upload.single("pathologyPhoto"),editLabTag)
pathologyRouter.delete("/tag/:id",deleteLabTag)
pathologyRouter.delete("/:id",deletePathologyDetails)



export default pathologyRouter