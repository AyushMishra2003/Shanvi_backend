import DoctorModel from "../models/doctor.model.js"
import AppError from "../utils/error.utlis.js"
import cloudinary from "cloudinary";
import fs from "fs/promises";


const addDoctor=async(req,res,next)=>{
  try{
    const {doctorName, doctorDesination,refService,experience,degree,isDoctor}=req.body

    if(!doctorName || !doctorDesination ){
        return next(new AppError("All field are Required",400))
    }

    const addDoctor=new DoctorModel({
        doctorName,
        doctorDesination,
        doctorPhoto:{
            public_id:"",
            secure_url:""
        },
        experience,
        degree,
        isDoctor
    })

    if(!addDoctor){
        return next(new AppError("Doctor not Added Succesfully",400))
    }

    if (req.file) {
        const result = await cloudinary.v2.uploader.upload(req.file.path, {
          folder: "lms",
        });

        console.log(result);
        
        if (result) {
          (addDoctor.doctorPhoto.public_id = result.public_id),
            (addDoctor.doctorPhoto.secure_url = result.secure_url);
        }
        fs.rm(`uploads/${req.file.filename}`);
    }

    await addDoctor.save()

    res.status(200).json({
        success:true,
        message:"Adding Doctor Detail",
        data:addDoctor
    })

  }catch(error){
    return next(new AppError(error.message,500))
  }
}

const getDoctor = async (req, res, next) => {
    try {
      const { id } = req.params;
  
      if (id) {
        const doctor = await DoctorModel.find({});
  
        if (!doctor) {
          return next(new AppError("Doctor not found", 404));
        }
  
        return res.status(200).json({
          success: true,
          message: "Doctor details fetched successfully",
          data: doctor,
        });
      }
  
      const doctors = await DoctorModel.find();
  
      res.status(200).json({
        success: true,
        message: "Doctors list fetched successfully",
        data: doctors,
      });
    } catch (error) {
      return next(new AppError(error.message, 500));
    }
  };
  


const editDoctor = async (req, res, next) => {
    try {
      const { id } = req.params;
      const { doctorName, doctorDesination,refService ,degree} = req.body;

      console.log(req.body);
      
  
      // if (!doctorName && !doctorDesination && !req.file) {
      //   return next(new AppError("No fields provided for update", 400));
      // }
  
      const doctor = await DoctorModel.findById(id);
  
      if (!doctor) {
        return next(new AppError("Doctor not found", 404));
      }
  
      if (doctorName) doctor.doctorName = doctorName;
      if (doctorDesination) doctor.doctorDesination = doctorDesination;
      if(degree) doctor.degree=degree

      if(refService){
         doctor.refService=refService
      }
  
      if (req.file) {
        const result = await cloudinary.v2.uploader.upload(req.file.path, {
          folder: "lms",
        });
  
        if (result) {
          // Delete the old photo from cloudinary
          if (doctor.doctorPhoto.public_id) {
            await cloudinary.v2.uploader.destroy(doctor.doctorPhoto.public_id);
          }
  
          doctor.doctorPhoto.public_id = result.public_id;
          doctor.doctorPhoto.secure_url = result.secure_url;
        }
        fs.rm(`uploads/${req.file.filename}`);
      }
  
      await doctor.save();
  
      res.status(200).json({
        success: true,
        message: "Doctor details updated successfully",
        data: doctor,
      });
    } catch (error) {
      return next(new AppError(error.message, 500));
    }
  };

  const deleteDoctor = async (req, res, next) => {
    try {
      const { id } = req.params;

      console.log(req.params);
      
  
      const doctor = await DoctorModel.findById(id);
  
      if (!doctor) {
        return next(new AppError("Doctor not found", 404));
      }
  
      // Remove doctor photo from Cloudinary
      if (doctor.doctorPhoto.public_id) {
        await cloudinary.v2.uploader.destroy(doctor.doctorPhoto.public_id);
      }
  
      await DoctorModel.findByIdAndDelete(id);
  
      res.status(200).json({
        success: true,
        message: "Doctor deleted successfully",
        
      });
    } catch (error) {
      return next(new AppError(error.message, 500));
    }
  };

  const deleteAllDoctors = async (req, res, next) => {
    try {
        // Fetch all doctor documents
        const doctors = await DoctorModel.find();

        if (!doctors || doctors.length === 0) {
            return next(new AppError("No doctors found", 400));
        }

        // Delete all doctor documents from the database
        await DoctorModel.deleteMany();

        res.status(200).json({
            success: true,
            message: "All doctors have been deleted successfully.",
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};

const testingDoctors=async(req,res,next)=>{
   try{

    const io = req.app.get("io");

    // ✅ Socket.IO se event trigger karna
    io.emit("ham-aa-gaye");

    res.status(201).json({
      success: true,
      message: "Order created successfully!"
    });

   }catch(error){
      
   }
}

  

export {
    addDoctor,
    getDoctor,
    editDoctor,
    deleteDoctor,
    deleteAllDoctors,
    testingDoctors
}