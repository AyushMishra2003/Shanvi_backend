import { Router } from "express";
import { addService, addServiceDetail, deleteService, deleteServiceDetail, getService, getServiceDetail, updateService, updateServiceDetail } from "../controller/service.controller.js";
import upload from "../middleware/multer.middleware.js";


const ServiceRouter=Router()



ServiceRouter.post("/",addService)
ServiceRouter.get("/",getService)
ServiceRouter.put("/:serviceId",updateService)
ServiceRouter.delete("/:serviceId",deleteService)
ServiceRouter.post("/detail/:serviceId",upload.single("servicePhoto"),addServiceDetail)
ServiceRouter.put("/detail/:serviceDetailId",upload.single("servicePhoto"),updateServiceDetail)
ServiceRouter.get("/detail/:serviceId",getServiceDetail)
ServiceRouter.delete("/detail/:serviceDetailId",deleteServiceDetail)


export default ServiceRouter