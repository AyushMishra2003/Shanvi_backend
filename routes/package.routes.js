import { Router } from "express";
import { addPackage, addPackageDetails, deletePackage, deletePackageDetails, getPackage, getPackageDetails, updatePackage, updatePackageDetails } from "../controller/package.controller.js";
import upload from "../middleware/multer.middleware.js";


const packageRouter=Router()

packageRouter.post("/",addPackage)  
packageRouter.get("/",getPackage)
packageRouter.put("/:id",updatePackage)
packageRouter.delete("/:id",deletePackage)
packageRouter.post("/detail",upload.single("packagePhoto"),addPackageDetails)
packageRouter.get("/detail/:id",getPackageDetails)
packageRouter.delete("/detail/:packageDetailId",deletePackageDetails)
packageRouter.put("/detail/:packageDetailId",upload.single("packagePhoto"),updatePackageDetails)


export default packageRouter