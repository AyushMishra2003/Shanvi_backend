import { Router } from "express";
import { addUser, getUser } from "../controller/Redis.controller.js";


const redisRouter=Router()


redisRouter.post("/",addUser)
redisRouter.get("/",getUser)



export default redisRouter