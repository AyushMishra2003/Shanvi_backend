import { Router } from "express";
import { addCollectionSales, assignedOrder, collectionOrderSummary, getCollectionSales, getCollectionSalesDetail, loginCollectionSales } from "../controller/collectionSales.controller.js";



const collectionRouter=Router()

collectionRouter.post("/",addCollectionSales)
collectionRouter.get("/",getCollectionSales)
collectionRouter.post("/login",loginCollectionSales)
collectionRouter.post("/assigned",assignedOrder)
collectionRouter.get("/detail/:id",getCollectionSalesDetail)
collectionRouter.get("/summary/:id",collectionOrderSummary)

export default collectionRouter