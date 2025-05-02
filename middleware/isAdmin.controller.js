import AppError from "../utils/error.utlis.js"


const isAdmin=async(req,res,next)=>{
     try{

        const token = req.cookies.authToken; 
         console.log(token);

        next()
         

     }catch(error){
        return next(new AppError(error.message,500))
     }
}

export default isAdmin