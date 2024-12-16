import { Router } from "express";
import { addService, addServiceDetail, deleteService, deleteServiceDetail, getService, getServiceDetail, getSpecificDetail, updateService, updateServiceDetail } from "../controller/service.controller.js";
import upload from "../middleware/multer.middleware.js";


const ServiceRouter=Router()



ServiceRouter.post("/",upload.single("servicePhoto"),addService)
ServiceRouter.get("/",getService)
ServiceRouter.put("/:serviceId",upload.single("servicePhoto"),updateService)
ServiceRouter.delete("/:serviceId",deleteService)
ServiceRouter.post("/detail/:serviceId",upload.single("servicePhoto"),addServiceDetail)
ServiceRouter.put("/detail/:serviceDetailId",upload.single("servicePhoto"),updateServiceDetail)
ServiceRouter.get("/detail/:serviceId",getServiceDetail)
ServiceRouter.get("/detail/specific/:id",getSpecificDetail)
ServiceRouter.delete("/detail/:serviceDetailId",deleteServiceDetail)


export default ServiceRouter