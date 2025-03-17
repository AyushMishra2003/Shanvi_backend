import { Router } from "express";
import { addOrder, getLatestOrder, getOrder, getTodayOrdersSummary } from "../controller/Order.controller.js";


const orderRoute=Router()

orderRoute.post("/",addOrder)
orderRoute.get("/",getOrder)
orderRoute.get("/summary",getTodayOrdersSummary)
orderRoute.get("/latest",getLatestOrder)



export default orderRoute