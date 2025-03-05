import { Router } from "express";
import { addService, addServiceDetail, deleteService, deleteServiceDetail, getDigitalService, getService, getServiceDetail, getServiceMoreDetail, getSpecificDetail, updateService, updateServiceDetail } from "../controller/service.controller.js";
import upload from "../middleware/multer.middleware.js";


const ServiceRouter=Router()



ServiceRouter.post("/",upload.single("servicePhoto"),addService)
ServiceRouter.get("/",getService)
ServiceRouter.get("/digital",getDigitalService)
ServiceRouter.get("/detail/service",getServiceMoreDetail)
ServiceRouter.put("/:serviceId",upload.single("servicePhoto"),updateService)
ServiceRouter.delete("/:serviceId",deleteService)
ServiceRouter.post(
    "/detail/:serviceId",
    upload.fields([
        { name: "servicePhoto", maxCount: 1 },
        { name: "iconPhoto", maxCount: 1 }
    ]),
    addServiceDetail
);

ServiceRouter.put(
    "/detail/:serviceDetailId",
    upload.fields([
        { name: "servicePhoto", maxCount: 1 },
        { name: "iconPhoto", maxCount: 1 }
    ]),
    updateServiceDetail
);

ServiceRouter.get("/detail/:serviceId",getServiceDetail)
ServiceRouter.get("/detail/specific/:slug",getSpecificDetail)
ServiceRouter.delete("/detail/:serviceDetailId",deleteServiceDetail)


export default ServiceRouter