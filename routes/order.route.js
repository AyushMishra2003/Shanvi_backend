import { Router } from "express";
import { addOrder, changeOrderStatus, getHomeCollectionDetails, getHomeCollectionOrder, getLatestOrder, getOrder, getOrderDetail, getTodayOrdersSummary,getLatestHomeCollectionOrder } from "../controller/Order.controller.js";
import { orderReportAdded } from "../controller/collectionSales.controller.js";
import upload from "../middleware/multer.middleware.js";


const orderRoute=Router()

orderRoute.post("/",addOrder)
orderRoute.get("/",getOrder)

orderRoute.get("/summary",getTodayOrdersSummary)
orderRoute.get("/latest",getLatestOrder)
orderRoute.get("/latest/home-collection",getLatestHomeCollectionOrder)
orderRoute.get("/home-collection",getHomeCollectionOrder)
orderRoute.get("/home-collection/:id",getHomeCollectionDetails)
orderRoute.post("/report/:id",upload.single("report"),orderReportAdded)
orderRoute.post("/change-status/:id",changeOrderStatus)
orderRoute.get("/:id",getOrderDetail)


export default orderRoute