import OpeningModel from "../models/Opening.model.js"
import AppError from "../utils/error.utlis.js"

// Add Opening
export const addOpening = async (req, res, next) => {
    try {
        const { jobTitle, jobDescription, location, jobCategory, jobType, qualifications, responsibilities, salary, skills,deadline} = req.body;

  
        

        // if (!jobTitle || !jobDescription || !location || !jobCategory || !jobType || !qualifications || !responsibilities || !salary || !skills) {
        //     return next(new AppError("All fields are required", 400));
        // }

        const newOpening = await OpeningModel.create({
            jobTitle,
            jobDescription,
            location,
            jobCategory,
            jobType,
            qualifications,
            responsibilities,
            salary,
            deadline,
            skills,
            isOpen:true,
            numberApplied: 0 // Assuming the number of applicants starts at 0
        });

        res.status(200).json({
            success: true,
            message: "New opening added",
            data: newOpening
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};

// 📋 Get All Openings
export const getOpeningAll = async (req, res, next) => {
    try {
        const allOpening = await OpeningModel.find({});
        res.status(200).json({
            success: true,
            message: "All openings are fetched",
            data: allOpening
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};

// View Single Opening
export const getOpeningById = async (req, res, next) => {
    try {
         
        const {title}=req.params

        const opening = await OpeningModel.findOne({jobTitle:title})
        if (!opening) return next(new AppError("Opening not found", 404));

        res.status(200).json({
            success: true,
            data: opening
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};

// Update Opening
export const updateOpening = async (req, res, next) => {
    try {
        const updated = await OpeningModel.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!updated) return next(new AppError("Opening not found", 404));

        res.status(200).json({
            success: true,
            message: "Opening updated successfully",
            data: updated
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};

// Delete Opening
export const deleteOpening = async (req, res, next) => {
    try {
        const deleted = await OpeningModel.findByIdAndDelete(req.params.id);
        if (!deleted) return next(new AppError("Opening not found", 404));

        res.status(200).json({
            success: true,
            message: "Opening deleted successfully"
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};
