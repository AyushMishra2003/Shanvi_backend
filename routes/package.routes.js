import { Router } from "express";
import { addPackage, addPackageDetails, deletePackageDetails, getPackage, getPackageDetails, updatePackageDetails } from "../controller/package.controller.js";
import upload from "../middleware/multer.middleware.js";


const packageRouter=Router()

packageRouter.post("/",addPackage)  
packageRouter.get("/",getPackage)
packageRouter.post("/detail/:packageId",upload.single("packagePhoto"),addPackageDetails)
packageRouter.get("/detail/:packageId",getPackageDetails)
packageRouter.delete("/detail/:packageDetailId",deletePackageDetails)
packageRouter.put("/detail/:packageDetailId",upload.single("packagePhoto"),updatePackageDetails)

export default packageRouter