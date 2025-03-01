import { Schema } from "mongoose";
import AppError from "../utils/error.utlis.js";
import UtlisModel from "../models/utlis.model.js";


const addUtils = async (req, res, next) => {
    try {
        const utils = new UtlisModel({
            title: "RefundAndCancellationPolicy",
            url: "refund-cancellation",
            description: `<div>
                <span style="font-size: 2em; font-weight: 700;">Refund and Cancellation Policy</span>
                <p>At Shanya Diagnosis Center, we strive to provide the best medical services. Below are our policies regarding refunds and cancellations.</p>

                <h2 style="line-height: 1.75rem">1. Cancellation Policy</h2>
                <p>Appointments can be canceled up to 24 hours in advance for a full refund. Late cancellations may incur a fee.</p>

                <h2 style="line-height: 1.75rem">2. Refund Policy</h2>
                <p>Refunds will be processed within 7-10 business days for eligible cancellations. No refunds are issued for completed tests.</p>

                <h2 style="line-height: 1.75rem">3. Rescheduling</h2>
                <p>You may reschedule your appointment without additional charges if done at least 24 hours before the scheduled time.</p>

                <h2 style="line-height: 1.75rem">4. Contact for Assistance</h2>
                <p>For any issues regarding refunds or cancellations, please contact our support team.</p>
            </div>`
        });

        await utils.save();

        res.status(201).json({
            status: "success",
            message: "Refund and Cancellation Policy added successfully",
            data: utils
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};





const getUtils=async(req,res,next)=>{
     try{
       

        
    const {url}=req.params


    

    const utils=await UtlisModel.findOne({url})
    if(!utils){
        return next(new AppError('No utils found',404))
    }

     res.status(200).json({
        success:true,
        message:"Utils found",
        data:utils
     })



     }catch(error){
         return next(new AppError(error.message,500))
     }
}

export {addUtils,getUtils}