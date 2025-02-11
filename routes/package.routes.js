import { Router } from "express";
import { addPackage, addPackageDetails, deletePackage, deletePackageDetails, getPackage, getPackageDetails, getPackageDetailsSlug, updatePackage, updatePackageDetails, updatePackageDetails1 } from "../controller/package.controller.js";
import upload from "../middleware/multer.middleware.js";


const packageRouter=Router()

packageRouter.post("/",addPackage)  
packageRouter.get("/",getPackage)
packageRouter.put("/:id",updatePackage)
packageRouter.delete("/:id",deletePackage)
packageRouter.post("/detail",upload.single("packagePhoto"),addPackageDetails)
packageRouter.get("/detail/:id",getPackageDetails)
packageRouter.get("/more/:slug",getPackageDetailsSlug)
packageRouter.delete("/detail/:packageDetailId",deletePackageDetails)
packageRouter.put("/detail/:packageDetailId",upload.single("packagePhoto"),updatePackageDetails)
packageRouter.put("/detail1/:id",updatePackageDetails1)


export default packageRouter