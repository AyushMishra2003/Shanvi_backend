import { Router } from "express";
import { addCollectionSales, assignedOrder, getCollectionSales, loginCollectionSales } from "../controller/collectionSales.controller.js";



const collectionRouter=Router()

collectionRouter.post("/",addCollectionSales)
collectionRouter.get("/",getCollectionSales)
collectionRouter.post("/login",loginCollectionSales)
collectionRouter.post("/assigned",assignedOrder)


export default collectionRouter