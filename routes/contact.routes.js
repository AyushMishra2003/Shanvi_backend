import { Router } from "express";
import { addContact, deleteContact, getContact } from "../controller/contact.Controller.js";


const contactRoute=Router()


contactRoute.post("/",addContact)
contactRoute.get("/",getContact)
contactRoute.delete("/:id",deleteContact)

export default contactRoute