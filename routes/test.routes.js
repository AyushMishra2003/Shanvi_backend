import { Router } from "express";
import { addTest, addTestDetails, deleteTest, deleteTestDetail, getSingleTest, getTest, getTestDetail, getTestSpecificDetail, updateTest, updateTestDetails, uploadExcelForTestDetails, uploadTestDetailsInstru } from "../controller/test.controller.js";
import upload from "../middleware/multer.middleware.js";


const testRouter=Router()


testRouter.post("/",upload.single("testPhoto"),addTest)
testRouter.get("/",getSingleTest)
testRouter.get("/single",getSingleTest)
testRouter.put("/:testId",upload.single("testPhoto"),updateTest)

testRouter.put("/instruct/:testId",uploadTestDetailsInstru)


testRouter.delete("/:testId",deleteTest)
testRouter.post("/detail/:testId",addTestDetails)
testRouter.post("/detail/test/:testId",upload.single("file"),uploadExcelForTestDetails)

testRouter.get("/detail/:testId",getTestDetail)
testRouter.get("/detail/specific/:id",getTestSpecificDetail)
testRouter.put("/detail/:testDetailId",updateTestDetails)
testRouter.delete("/detail/:testDetailId",deleteTestDetail)



export default testRouter