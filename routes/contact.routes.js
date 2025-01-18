import { Router } from "express";
import { addContact, getContact } from "../controller/contact.Controller.js";


const contactRoute=Router()


contactRoute.post("/",addContact)
contactRoute.get("/",getContact)

export default contactRoute