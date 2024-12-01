import { Router } from "express";
import { addTest, addTestDetails, getTest } from "../controller/test.controller.js";
import upload from "../middleware/multer.middleware.js";


const testRouter=Router()


testRouter.post("/",upload.single("testPhoto"),addTest)
testRouter.get("/",getTest)
testRouter.post("/detail/:testId",addTestDetails)



export default testRouter