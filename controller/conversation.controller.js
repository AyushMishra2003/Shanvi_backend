import ConversationModel from "../models/conversation.model.js"
import AppError from "../utils/error.utlis.js"


const addConversation=async(req,res,next)=>{
     try{

        const {message}=req.body
        const io = req.app.get("io");

        if(!message){
            return next(new AppError("Please provide message",400))
        }

        const conversation= ConversationModel.create({
            message
        })

        io.emit("conversation");

     

        res.status(201).json({
            status:"success",
            data:{
                conversation
            }
        })
         



     }catch(error){
        console.log(error);
        
         return next(new AppError(error.message,500))
     }
}


const getAllConversation=async(req,res,next)=>{
    try{

        const conversations=await ConversationModel.find()

        res.status(200).json({
            status:"success",
            data: conversations
            
        })

    }catch(error){
        console.log(error);
        
        return next(new AppError(error.message,500))
    }
}

const deleteConversation=async(req,res,next)=>{
     try{
        
         const isDeleted=await ConversationModel.deleteMany({})

         if(!isDeleted){
            return next(new AppError("Unable to delete conversation",400))
         }
         
         res.status(200).json({
            status:"success",
            message:"All conversations deleted successfully"
         })

     }catch(error){
         return next(new AppError(error.message,500))
     }
}

export {addConversation,getAllConversation,deleteConversation}