import { Router } from "express";
import { addOrder } from "../controller/Order.controller.js";


const orderRoute=Router()

orderRoute.post("/",addOrder)



export default orderRoute