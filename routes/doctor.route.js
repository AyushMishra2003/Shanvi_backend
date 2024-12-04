import { Router } from "express";
import { addDoctor, deleteDoctor, editDoctor, getDoctor } from "../controller/doctor.controller.js";
import upload from "../middleware/multer.middleware.js";

const doctorRoute=Router()



doctorRoute.post("/",upload.single("doctorPhoto"),addDoctor)
doctorRoute.get("/",getDoctor)
doctorRoute.put("/:id",upload.single("doctorPhoto"),editDoctor)
doctorRoute.delete("/:id",deleteDoctor)


export default doctorRoute