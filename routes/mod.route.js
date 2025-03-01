import { Router } from "express";
import { addMod, getAllMod } from "../controller/Mod.controller.js";

const modRoute=Router()


modRoute.post("/",addMod)
modRoute.get("/",getAllMod)


export default modRoute