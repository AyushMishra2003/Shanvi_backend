import { Router } from "express";
import { addTest, addTestDetails, deleteTest, deleteTestDetail, getTest, getTestDetail, getTestSpecificDetail, updateTest, updateTestDetails } from "../controller/test.controller.js";
import upload from "../middleware/multer.middleware.js";


const testRouter=Router()


testRouter.post("/",upload.single("testPhoto"),addTest)
testRouter.get("/",getTest)
testRouter.put("/:testId",upload.single("testPhoto"),updateTest)
testRouter.delete("/:testId",deleteTest)
testRouter.post("/detail/:testId",addTestDetails)
testRouter.get("/detail/:testId",getTestDetail)
testRouter.get("/detail/specific/:id",getTestSpecificDetail)
testRouter.put("/detail/:testDetailId",updateTestDetails)
testRouter.delete("/detail/:testDetailId",deleteTestDetail)



export default testRouter