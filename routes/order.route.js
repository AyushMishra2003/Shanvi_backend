import { Router } from "express";
import { addOrder, getOrder } from "../controller/Order.controller.js";


const orderRoute=Router()

orderRoute.post("/",addOrder)
orderRoute.get("/",getOrder)



export default orderRoute