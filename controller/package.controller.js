import PackageModel from "../models/package.model.js"
import PackageDetail from "../models/packageDetails.model.js";
import AppError from "../utils/error.utlis.js"
import cloudinary from "cloudinary";
import fs from "fs/promises";


const addPackage=async(req,res,next)=>{
     const {packageName}=req.body


     if(!packageName){
        return next(new AppError("Package Name is Required",400))
     }


     const addPackage=new PackageModel({
        packageName
     })

     if(!addPackage){
        return next(new AppError("Package is not Added",402))
     }


     await addPackage.save()

     res.status(200).json({
        success:true,
        message:"Package added Succesfully",
        data:addPackage
     })

}

const getPackage=async(req,res,next)=>{
    try {
        // Fetch all packages and populate the packageDetails
        const allPackages = await PackageModel.find({})
        .populate({
          path: 'packageDetails', // The field to populate
          model: 'PackageDetail', // Referencing the PackageDetail model
        });
    
        console.log(allPackages);

        res.status(200).json({
            success:true,
            message:"All Package are",
            data:allPackages
        })
        // return or send as response
      } catch (error) {
        console.error('Error fetching packages:', error);
      }
}

const updatePackage=async(req,res,next)=>{
    try{

        const {packageName}=req.body
        const {id}=req.params

        const validPackage=await PackageModel.findById(id)

        if(!validPackage){
            return next(new AppError("Package not Found",400))
        }

        validPackage.packageName=packageName

        await validPackage.save()


        res.status(200).json({
            success:true,
            message:"Package Updated Succesfully",
            data:validPackage

        })

    }catch(error){
        return next(new AppError(error.message,500))
    }
}

const deletePackage=async(req,res,next)=>{
  res.status(200).json({
    success:true,
    message:"delete runnign"
  })
}


const addPackageDetails=async(req,res,next)=>{
    try{
       
        const {packageCategory,packageRate,packageDiscount,parameterInclude,report,packagesParameter}=req.body

        console.log(req.body);
        

        const {packageId}=req.params


        const validPackages=await PackageModel.findById(packageId)

        if(!validPackages){
            return next(new AppError("Packages not Found",400))
        }

        const formattedPackages = Array.isArray(packagesParameter)
        ? packagesParameter.map((item) => ({
            parameterName: item?.parameterName,
            description: item?.content,
          }))
        : [];

        const addPackageDetail=new PackageDetail({
            packageCategory,
            packageRate,
            packageDiscount,
            parameterInclude,
            report,
            packagesParameter:formattedPackages,
            packagePhoto:{
                public_id:"",
                secure_url:""
            },
              packageId, // Link to Package
        })

        console.log(addPackageDetail);
        

        if (req.file) {
            const result = await cloudinary.v2.uploader.upload(req.file.path, {
              folder: "lms",
            });

            console.log(result);
            
            if (result) {
              (addPackageDetail.packagePhoto.public_id = result.public_id),
                (addPackageDetail.packagePhoto.secure_url = result.secure_url);
            }
            fs.rm(`uploads/${req.file.filename}`);
        }


        await validPackages.packageDetails.push(addPackageDetail._id);
         await validPackages.save();

          


        await addPackageDetail.save()


        res.status(200).json({
            success:true,
            message:"Package Detail are Added",
            data:addPackageDetail
        })



    }catch(error){
        return next(new AppError(error.message,500))
    }
}

const getPackageDetails=async(req,res,next)=>{
    try{

        const {packageId}=req.params

        console.log(packageId);
        

        const validPackage=await PackageModel.findById(packageId)

        console.log(packageId);
        

        if(!validPackage){
            return next(new AppError("Package is Not Found",400))
        }

            
        const packageDetails = await PackageDetail.find({ packageId }).populate("packageId");

        if(!packageDetails){
            return next(new AppError("Package Details not Found,Something Went Wrong",400))
        }

        res.status(200).json({
            success:true,
            message:"Package details are:-",
            data:packageDetails
        })



    }catch(error){
        return next(new AppError(error.message,500))
    }
}


const updatePackageDetails = async (req, res, next) => {
    try {
      const { packageDetailId } = req.params;
      const { packageCategory, packageRate, packageDiscount, parameterInclude, report, packagesParameter } = req.body;
  
      // Step 1: Find the existing PackageDetail by ID
      const existingPackageDetail = await PackageDetail.findById(packageDetailId);
      if (!existingPackageDetail) {
        return next(new AppError("Package Detail not found", 404));
      }
  
      // Step 2: Update the fields (if they are provided in the request)
      if (packageCategory) existingPackageDetail.packageCategory = packageCategory;
      if (packageRate) existingPackageDetail.packageRate = packageRate;
      if (packageDiscount) existingPackageDetail.packageDiscount = packageDiscount;
      if (parameterInclude) existingPackageDetail.parameterInclude = parameterInclude;
      if (report) existingPackageDetail.report = report;
  
      // If `packagesParameter` is provided, format it and update it
      if (Array.isArray(packagesParameter)) {
        existingPackageDetail.packagesParameter = packagesParameter.map((item) => ({
          parameterName: item?.parameterName,
          description: item?.content,
        }));
      }
  
      // Step 3: Handle file upload (if a new file is uploaded)
      if (req.file) {
        const result = await cloudinary.v2.uploader.upload(req.file.path, {
          folder: "lms",
        });
  
        // If file upload was successful, update the package photo details
        if (result) {
          existingPackageDetail.packagePhoto.public_id = result.public_id;
          existingPackageDetail.packagePhoto.secure_url = result.secure_url;
        }
        // Remove the uploaded file after uploading to Cloudinary
        fs.rm(`uploads/${req.file.filename}`);
      }
  
      // Step 4: Save the updated PackageDetail document
      await existingPackageDetail.save();
  
      // Step 5: Respond with the updated package details
      res.status(200).json({
        success: true,
        message: "Package Detail updated successfully",
        data: existingPackageDetail,
      });
    } catch (error) {
      console.error(error);
      return next(new AppError("Error updating Package Detail", 500));
    }
};
  

const deletePackageDetails = async (req, res, next) => {
    try {
      const { packageDetailId } = req.params; // ID of the PackageDetail to delete

      console.log("i am in");
      
  
      // Find the PackageDetail by ID
      const packageDetail = await PackageDetail.findById(packageDetailId);
  
      if (!packageDetail) {
        return next(new AppError("Package Detail not found", 404));
      }
  
      const { packageId } = packageDetail; // Get the associated packageId
  
      // Remove the PackageDetail document
      await PackageDetail.findByIdAndDelete(packageDetailId);
  
      // Find the associated Package and remove the reference to this PackageDetail
      const validPackage = await PackageModel.findById(packageId);
  
      if (validPackage) {
        validPackage.packageDetails = validPackage.packageDetails.filter(
          (detailId) => detailId.toString() !== packageDetailId
        );
        await validPackage.save(); // Save the updated Package
      }
  
      res.status(200).json({
        success: true,
        message: "Package Detail deleted successfully",
      });
    } catch (error) {
      return next(new AppError(error.message, 500));
    }
};
  

 


export {
    addPackage,
    getPackage,
    addPackageDetails,
    getPackageDetails,
    deletePackageDetails,
    updatePackageDetails
}