import AppError from "../utils/error.utlis.js"
import cloudinary from "cloudinary";
import fs from "fs/promises";
import TestModel from "../models/Test.model.js";


const addTest=async(req,res,next)=>{
    try{

        const {testName}=req.body

        if(!testName){
            return next(new AppError("All Field are Required",400))
        }
        
        const addTest=new TestModel({
            testName,
            testPhoto:{
                public_id:"",
                secure_url:""
            },
        })

        if(!addTest){
            return next(new AppError("Test not Added",400))
        }

        if (req.file) {
            const result = await cloudinary.v2.uploader.upload(req.file.path, {
              folder: "lms",
            });

            console.log(result);
            
            if (result) {
              (addTest.testPhoto.public_id = result.public_id),
                (addTest.testPhoto.secure_url = result.secure_url);
            }
            fs.rm(`uploads/${req.file.filename}`);
        }

        await addTest.save()

        res.status(200).json({
            success:true,
            message:"Test Added Succesfully",
            data:addTest
        })


    }catch(error){
        return next(new AppError(error.message,500))
    }
}

const getTest=async(req,res,next)=>{
    try{
        
        const allTest=await  TestModel.find({})

        if(!allTest){
            return next(new AppError("Test not Found",400))
        }

        res.status(200).json({
            success:true,
            message:"All Test",
            data:allTest
        })
        
    }catch(error){
        return next(new AppError(error.message,500))
    }
}


const addTestDetails=async(req,res,next)=>{
    try{ 

        const {testId}=req.params

        const {testDetailName,category,testPrice,testDetails1,testDetails2,testDiscount,testRequirnment1,testRequirnment2,testDeliver1,testDeliver2}=req.body

        if(!testDetailName || !category || !testPrice || !testDetails1 || !testDetails2 || !testDiscount || !testRequirnment1 || !testRequirnment2 || !testDeliver1 || !testDeliver2){
            return next(new AppError("All Field are Required",400))
        }

        const validTest=await TestModel.findById(testId)

        if(!validTest){
            return next(new AppError("Test is not Found",404))
        }
              
        const addTestDetail=new TestModel({
            testDetailName,
            category,
            testPrice,
            testDetails1,
            testDetails2,
            testDiscount,
            testRequirnment1,
            testRequirnment2,
            testDeliver1,
            testDeliver2,
            testId,
        })


        await validTest.testDetail.push(addTestDetails._id);
        await validTest.save();        
       await addTestDetail.save()


       res.status(200).json({
        success:true,
        message:"Test Detail Added Succesfully",
        data:addTestDetail
       })

    
    }catch(error){
        return next(new AppError(error.message,500))
    }
}



export {
    addTest,
    getTest,
    addTestDetails
}