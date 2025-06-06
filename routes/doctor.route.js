import { Router } from "express";
import { addDoctor, deleteAllDoctors, deleteDoctor, editDoctor, getDoctor, testingDoctors } from "../controller/doctor.controller.js";
import upload from "../middleware/multer.middleware.js";

const doctorRoute=Router()



doctorRoute.post("/",upload.single("doctorPhoto"),addDoctor)
doctorRoute.get("/",getDoctor)
doctorRoute.post("/testing",testingDoctors)
doctorRoute.put("/:id",upload.single("doctorPhoto"),editDoctor)
doctorRoute.delete("/many",deleteAllDoctors)
doctorRoute.delete("/:id",deleteDoctor)



export default doctorRoute