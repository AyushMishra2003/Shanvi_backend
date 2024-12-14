import AppError from "../utils/error.utlis.js"
import cloudinary from "cloudinary";
import fs from "fs/promises";
import TestModel from "../models/Test.model.js";
import TestDetailModel from "../models/TestDetail.model.js";


const addTest=async(req,res,next)=>{
    try{

        const {testName}=req.body

        console.log(testName);
        

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

const getTest = async (req, res, next) => {
    try {
        // Fetch all tests from the database
        const allTest = await TestModel.find({}).populate('testDetail');

        if (!allTest) {
            return next(new AppError("Test not Found", 400));
        }

        console.log(allTest);
        

        // Define the desired sequence of test names
        const desiredSequence = [
            "Digital PET-CT Scan",
            "Digital Gamma Camera" ,
            "NUCLEAR MEDICINE",
            "Theranostics",
            "Digital 3.0 Tesla MRI(48 Channel)",
            "128 Slice CT Scan",
            "UltraSound (3D/4D/Dopplers/TIFFA)",
            "Pathology Test",
            "Cardio Imaging",
            "Neuro Imaging",
            "Digital X-Ray",
            "Digital Mammography",
            "DEXA Scan"
        ];

        // Sort tests based on the desired sequence
        const orderedTests = [];
        const remainingTests = [];

        allTest.forEach(test => {
            const index = desiredSequence.indexOf(test.testName);
            // console.log(index);
            
            if (index !== -1) {
                orderedTests[index] = test; // Place test in the correct position
            } else {
                remainingTests.push(test); // Add test to remaining tests if not in sequence
            }
        });

        

        // Remove any undefined slots (in case of missing items from the sequence)
        const finalOrderedTests = orderedTests.filter(Boolean).concat(remainingTests);

        res.status(200).json({
            success: true,
            message: "All Test",
            data: finalOrderedTests
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};





const updateTest = async (req, res, next) => {
    try {
        const { testId } = req.params; // Extract testId from URL parameters
        const { testName } = req.body; // Extract new test name from request body

        if (!testName) {
            return next(new AppError("Test name is required", 400));
        }

        // Find the existing TestModel document by ID
        const test = await TestModel.findById(testId);

        if (!test) {
            return next(new AppError("Test not found", 404));
        }

        // Update test name
        test.testName = testName;

        // Check if a new file is uploaded for the test photo
        if (req.file) {
            // Delete the old photo from Cloudinary if it exists
            if (test.testPhoto.public_id) {
                await cloudinary.v2.uploader.destroy(test.testPhoto.public_id);
            }

            // Upload the new photo to Cloudinary
            const result = await cloudinary.v2.uploader.upload(req.file.path, {
                folder: "lms",
            });

            if (result) {
                test.testPhoto.public_id = result.public_id;
                test.testPhoto.secure_url = result.secure_url;
            }

            // Delete the uploaded file from local storage
            fs.rm(`uploads/${req.file.filename}`);
        }

        // Save the updated test document
        await test.save();

        res.status(200).json({
            success: true,
            message: "Test updated successfully",
            data: test,
        });
    } catch (error) {
        console.error("Error updating test:", error);
        return next(new AppError(error.message, 500));
    }
};


const deleteTest = async (req, res, next) => {
    try {
        const { testId } = req.params; // Extract testId from URL parameters

        console.log("test id is",testId);
        

        // Find the TestModel document by ID
        const test = await TestModel.findById(testId);

        if (!test) {
            return next(new AppError("Test not found", 404));
        }

        // Delete all associated TestDetail documents
        if (test.testDetail && test.testDetail.length > 0) {
            await TestDetailModel.deleteMany({ _id: { $in: test.testDetail } });
        }

        // Delete the test photo from Cloudinary if it exists
        if (test.testPhoto.public_id) {
            await cloudinary.v2.uploader.destroy(test.testPhoto.public_id);
        }

        // Delete the TestModel document
        await TestModel.findByIdAndDelete(testId);

        res.status(200).json({
            success: true,
            message: "Test and associated details deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting test:", error);
        return next(new AppError(error.message, 500));
    }
};




const addTestDetails=async(req,res,next)=>{
    try{ 

        const {testId}=req.params

        const {testDetailName,category,testPrice,testDetails1,testDetails2,testDiscount,testRequirement2, testRequirement1,testDeliver1,testDeliver2}=req.body

        console.log(req.body);
        

        // if(!testDetailName || !category || !testPrice || !testDetails1 || !testDetails2 || !testDiscount || !testRequirement1 || !testRequirement2 || !testDeliver1 || !testDeliver2){
        //     return next(new AppError("All Field are Required",400))
        // }

        const validTest=await TestModel.findById(testId)

        if(!validTest){
            return next(new AppError("Test is not Found",404))
        }
              
        const addTestDetail=new TestDetailModel({
            testDetailName,
            category,
            testPrice,
            testDetails1,
            testDetails2,
            testDiscount,
            testRequirement1,
            testRequirement2,
            testDeliver1,
            testDeliver2,
            testId,
        })
           
        console.log(validTest);
        

        await validTest.testDetail.push(addTestDetail._id);
        await validTest.save();  
        
        console.log(validTest);
        
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

const getTestDetail=async(req,res,next)=>{
    try{

        const {testId}=req.params

        const validTest=await TestModel.findById(testId)

        if(!validTest){
            return next(new AppError("Test Not Found",400))
        }

        const testDetail=await TestDetailModel.find({testId})

        if(!testDetail){
            return next(new AppError("Test Details not Found,Something went Wrong",400))
        }

        res.status(200).json({
            success:true,
            message:"ALL Test Detail are:-",
            data:testDetail
        })

    }catch(error){
        return next(new AppError(error.message,500))
    }
}


const updateTestDetails = async (req, res, next) => {
    try {
        const { testDetailId } = req.params; // Extract TestDetail ID from params
        const updateData = req.body; // Fields to be updated

        console.log(`Update data for TestDetail ID ${testDetailId}:`, updateData);

        // Find the TestDetail document by ID
        const testDetail = await TestDetailModel.findById(testDetailId);

        if (!testDetail) {
            return next(new AppError("Test Detail not found", 404));
        }

        // Update the fields in the TestDetail document
        // for (const key in updateData) {
        //     if (updateData.hasOwnProperty(key)) {
        //         testDetail[key] = updateData[key];
        //     }
        // }

        testDetail.testDetailName=updateData?.testDetailName
        testDetail.testPrice=updateData?.testPrice

        console.log(testDetail);
        

        // Save the updated document
        await testDetail.save();

        res.status(200).json({
            success: true,
            message: "Test Detail updated successfully",
            data: testDetail,
        });
    } catch (error) {
        console.error("Error updating Test Detail:", error);
        return next(new AppError(error.message, 500));
    }
};


const deleteTestDetail = async (req, res, next) => {
    try {
        const { testDetailId } = req.params; // Extract TestDetail ID from params

        // Find the TestDetail document by ID
        const testDetail = await TestDetailModel.findById(testDetailId);

        if (!testDetail) {
            return next(new AppError("Test Detail not found", 404));
        }

        // Check if testDetail.testId exists
        if (!testDetail.testId) {
            console.warn(`TestDetail ${testDetailId} does not have a valid testId.`);
            return next(new AppError("Associated TestModel not found", 404));
        }

        // Remove the reference from the associated TestModel
        const testModel = await TestModel.findById(testDetail.testId);

        if (testModel && Array.isArray(testModel.testDetail)) {
            // Remove the TestDetail ID from testDetail array
            testModel.testDetail = testModel.testDetail.filter((id) => {
                if (!id) return false; // Ensure id is not null/undefined
                return id.toString() !== testDetailId;
            });
            await testModel.save(); // Save the updated TestModel
        } else {
            console.warn(
                `Associated TestModel not found or invalid testDetail field for TestDetail ID: ${testDetailId}`
            );
        }

        // Delete the TestDetail document
        await TestDetailModel.findByIdAndDelete(testDetailId);

        res.status(200).json({
            success: true,
            message: "Test Detail deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting Test Detail:", error);
        return next(new AppError(error.message, 500));
    }
};


const getTestSpecificDetail=async(req,res,next)=>{
    try{
         const {id}=req.params

         console.log(id);
         

         const testDetail=await TestDetailModel.findById(id)

         if(!testDetail){
            return next(new AppError("Test Detail not Found",404))
         }

         res.status(200).json({
            success:true,
            message:"Specific Test Detail are:-",
            data:testDetail
         })

    }catch(error){
        return next(new AppError(error.message,500))
    }
}





export {
    addTest,
    getTest,
    updateTest,
    deleteTest,
    addTestDetails,
    getTestDetail,
    updateTestDetails,
    deleteTestDetail,
    getTestSpecificDetail
}