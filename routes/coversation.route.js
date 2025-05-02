import { Router } from "express";
import { addConversation, deleteConversation, getAllConversation } from "../controller/conversation.controller.js";


const conversationRouter=Router()

conversationRouter.get("/",getAllConversation)
conversationRouter.post("/",addConversation)
conversationRouter.delete("/",deleteConversation)

export default conversationRouter