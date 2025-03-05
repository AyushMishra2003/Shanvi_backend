import { Router } from "express";
import { addTest, addTestDetails, deleteTest, deleteTestDetail, deleteTestSpecificDetail, getServiceTestDetail, getSingleTest, getSingleTestDetail, getTest, getTestDetail, getTestSpecificDetail, updateSpecificTestFields, updateTest, updateTestDetails, uploadExcelForTestDetails, uploadTestDetailsInstru } from "../controller/test.controller.js";
import upload from "../middleware/multer.middleware.js";


const testRouter=Router()


testRouter.post("/",upload.single("testPhoto"),addTest)
testRouter.get("/",getSingleTest)
testRouter.get("/single",getSingleTest)
testRouter.put("/:testId",upload.single("testPhoto"),updateTest)
testRouter.put("/instruct/:testId",uploadTestDetailsInstru)
testRouter.put("/extra/:testId",updateSpecificTestFields)
testRouter.delete("/:testId",deleteTest)
testRouter.post("/single/name",getSingleTestDetail)
testRouter.get("/service/scan/:slugName",getServiceTestDetail)
testRouter.post("/add/details/:slug",addTestDetails)
testRouter.post("/detail/test/:testId",upload.single("file"),uploadExcelForTestDetails)
testRouter.get("/detail/:testId",getTestDetail)
testRouter.get("/detail/specific/:slug",getTestSpecificDetail)
testRouter.delete("/detail/specific/:slug",deleteTestSpecificDetail)
testRouter.put("/detail/:testDetailId",updateTestDetails)
testRouter.delete("/detail/:testDetailId",deleteTestDetail)



export default testRouter