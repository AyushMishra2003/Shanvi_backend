import { Router } from "express";
import { addOrder, getHomeCollectionDetails, getHomeCollectionOrder, getLatestOrder, getOrder, getTodayOrdersSummary } from "../controller/Order.controller.js";


const orderRoute=Router()

orderRoute.post("/",addOrder)
orderRoute.get("/",getOrder)
orderRoute.get("/summary",getTodayOrdersSummary)
orderRoute.get("/latest",getLatestOrder)
orderRoute.get("/home-collection",getHomeCollectionOrder)
orderRoute.get("/home-collection/:id",getHomeCollectionDetails)



export default orderRoute