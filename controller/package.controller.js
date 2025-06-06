import { log } from "console";
import PackageModel from "../models/package.model.js"
import { PackageDetail } from "../models/packageDetails.model.js";
import AppError from "../utils/error.utlis.js"
import cloudinary from "cloudinary";
import fs from "fs/promises";
import PackageTagModel from "../models/PackagTag.model.js";
import slugify from "slugify";


const addPackage = async (req, res, next) => {
  const { packageName } = req.body


  if (!packageName) {
    return next(new AppError("Package Name is Required", 400))
  }


  const addPackage = new PackageModel({
    packageName
  })

  if (!addPackage) {
    return next(new AppError("Package is not Added", 402))
  }


  await addPackage.save()

  res.status(200).json({
    success: true,
    message: "Package added Succesfully",
    data: addPackage
  })

}

const getPackage = async (req, res, next) => {
  try {
    // Replace 'Health Checkup Package' with your desired package name
    const specificPackageName = "Health Checkup Package";

    // Fetch only the package with the specific name
    const specificPackage = await PackageModel.findOne({ packageName: specificPackageName })
      .populate({
        path: 'packageDetails', // The field to populate
        model: 'PackageDetail', // Referencing the PackageDetail model
      });

    if (!specificPackage) {
      return res.status(404).json({
        success: false,
        message: "Package not found",
      });
    }



    res.status(200).json({
      success: true,
      message: "Package found",
      data: specificPackage.packageDetails,
    });
  } catch (error) {
    console.error('Error fetching package:', error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};


const updatePackage = async (req, res, next) => {
  try {

    const { packageName } = req.body
    const { id } = req.params

    const validPackage = await PackageModel.findById(id)

    if (!validPackage) {
      return next(new AppError("Package not Found", 400))
    }


    validPackage.packageName = packageName

    await validPackage.save()


    res.status(200).json({
      success: true,
      message: "Package Updated Succesfully",
      data: validPackage

    })

  } catch (error) {
    return next(new AppError(error.message, 500))
  }
}

const deletePackage = async (req, res, next) => {
  try {
    const { id } = req.params; // Extract service ID from params

    // Find the service by ID
    const service = await PackageModel.findById(id);

    if (!service) {
      return next(new AppError("Service not found", 404));
    }

    // Delete all related service details
    if (service.packageDetails && service.packageDetails.length > 0) {
      await PackageDetail.deleteMany({ _id: { $in: service.packageDetails } });
    }

    // Delete the service itself
    await PackageModel.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Package and related details deleted successfully",
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
}


const addPackageDetails = async (req, res, next) => {
  try {

    const { packageCategory, packageRate, parameterInclude, parameters, packageName, packageParamterDetails,age,fasting, instructionEnglish, instructionHindi,  packageDiscount, packageOverview, recommededfor,report} = req.body


    console.log(req.body);
    

    const { packageId } = req.params

    const specificPackageName = "Health Checkup Package";

    // Fetch only the package with the specific name
    const validPackages = await PackageModel.findOne({ packageName: specificPackageName })
      .populate({
        path: 'packageDetails', // The field to populate
        model: 'PackageDetail', // Referencing the PackageDetail model
      });


    let slug = slugify(packageName, { lower: true, strict: true });

    const addPackageDetail = new PackageDetail({
      packageCategory,
      packageRate,
      packageDiscount,
      parameterInclude,
      report,
      packagePhoto: {
        public_id: "",
        secure_url: ""
      },
      packageName,
      packageOverview,
      packageId, // Link to Package,
      packageParamterDetails,
      instructionEnglish,
      instructionHindi,
      slug
    })



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
      success: true,
      message: "Package Detail are Added",
      data: addPackageDetail
    })



  } catch (error) {
    console.log(error);

    return next(new AppError(error.message, 500))
  }
}

const getPackageDetails = async (req, res, next) => {
  try {

    const { packageId } = req.params

    console.log(packageId);


    const validPackage = await PackageModel.findById(packageId)

    console.log(packageId);


    if (!validPackage) {
      return next(new AppError("Package is Not Found", 400))
    }


    const packageDetails = await PackageDetail.find({ packageId }).populate("packageId");

    if (!packageDetails) {
      return next(new AppError("Package Details not Found,Something Went Wrong", 400))
    }

    res.status(200).json({
      success: true,
      message: "Package details are:-",
      data: packageDetails
    })



  } catch (error) {
    return next(new AppError(error.message, 500))
  }
}

const getPackageDetailsSlug = async (req, res, next) => {
  try {

    const { slug } = req.params

 
    
    const validPackage = await PackageDetail.findOne({slug})

    if (!validPackage) {
      return next(new AppError("Package is Not Found", 400))
    }


    res.status(200).json({
      success: true,
      message: "Package details are:-",
      data: validPackage
    })

  } catch (error) {
    return next(new AppError(error.message, 500))
  }
}


const updatePackageDetails = async (req, res, next) => {
  try {
    const { packageDetailId } = req.params;
    const { packageCategory, packageRate, parameterInclude, packageName, packageParamterDetails, instructionEnglish, instructionHindi, packageDiscount, packageOverview, report } = req.body;

    console.log(req.body);

    // Step 1: Find the existing PackageDetail by ID
    let existingPackageDetail = await PackageDetail.findById(packageDetailId);
    if (!existingPackageDetail) {
      return next(new AppError("Package Detail not found", 404));
    }

    // Generate slug only if packageName is updated
    let slug = packageName ? slugify(packageName, { lower: true, strict: true }) : existingPackageDetail.slug;

    // Step 2: Update fields dynamically
    existingPackageDetail.packageCategory = packageCategory || existingPackageDetail.packageCategory;
    existingPackageDetail.packageRate = packageRate || existingPackageDetail.packageRate;
    existingPackageDetail.parameterInclude = parameterInclude || existingPackageDetail.parameterInclude;
    existingPackageDetail.packageName = packageName || existingPackageDetail.packageName;
    existingPackageDetail.packageParamterDetails = packageParamterDetails || existingPackageDetail.packageParamterDetails;
    existingPackageDetail.instructionEnglish = instructionEnglish || existingPackageDetail.instructionEnglish;
    existingPackageDetail.instructionHindi = instructionHindi || existingPackageDetail.instructionHindi;
    existingPackageDetail.packageDiscount = packageDiscount || existingPackageDetail.packageDiscount;
    existingPackageDetail.packageOverview = packageOverview || existingPackageDetail.packageOverview;
    existingPackageDetail.report = report || existingPackageDetail.report;
    existingPackageDetail.slug = slug;

    // Step 3: Handle file upload (if a new file is uploaded)
    if (req.file) {
      const result = await cloudinary.v2.uploader.upload(req.file.path, {
        folder: "lms",
      });

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
    return next(new AppError(error.message || "Error updating Package Detail", 500));
  }
};



const deletePackageDetails = async (req, res, next) => {
  try {
    const { packageDetailId } = req.params; // ID of the PackageDetail to delete

  

    // Find the PackageDetail by ID
    const packageDetail = await PackageDetail.findById(packageDetailId);

    if (!packageDetail) {
      return next(new AppError("Package Detail not found", 404));
    }

    await PackageDetail.findByIdAndDelete(packageDetailId)


    res.status(200).json({
      success: true,
      message: "Package Detail deleted successfully",
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};



const updatePackageDetails1 = async (req, res, next) => {
  const STATIC_PACKAGE_DATA = {
    fasting: "Fasting is required for at least 8-10 hours before the pre-surgical tests.",
    recommendedFor: "Recommended for patients undergoing surgery to assess their health status and minimize surgical risks.",
    age: "All age groups",
    instructionHindi: `
      <ul>
        <li>सर्जरी से पहले आवश्यक परीक्षणों के लिए 8-10 घंटे का उपवास करें।</li>
        <li>परीक्षण के लिए हल्के और आरामदायक कपड़े पहनें।</li>
        <li>यदि आप कोई दवा ले रहे हैं, तो डॉक्टर से परामर्श करें कि इसे जारी रखना है या नहीं।</li>
        <li>परीक्षण के दौरान किसी भी असुविधा का अनुभव होने पर स्टाफ को सूचित करें।</li>
      </ul>
    `,
    instructionEnglish: `
      <ul>
        <li>Fast for at least 8-10 hours before the required pre-surgical tests.</li>
        <li>Wear light and comfortable clothing for the test.</li>
        <li>If you are on any medication, consult your doctor about whether to continue it before the test.</li>
        <li>Inform the staff if you feel any discomfort during the test.</li>
      </ul>
    `
  };
  
  
  const { id } = req.params;
  let packageDetail = await PackageDetail.findById(id);

  packageDetail.recommededfor=STATIC_PACKAGE_DATA.recommendedFor
  packageDetail.age=STATIC_PACKAGE_DATA.age
  packageDetail.fasting=STATIC_PACKAGE_DATA.fasting
  packageDetail.instructionHindi=STATIC_PACKAGE_DATA.instructionHindi
  packageDetail.instructionEnglish=STATIC_PACKAGE_DATA.instructionEnglish

  await packageDetail.save()

  return res.status(201).json({
    success: true,
    message: "Package Detail Created Successfully!",
    data: packageDetail
  });

}


const addPackageTag=async(req,res,next)=>{
    try{

      const {slug}=req.params

      const {packageTagName}=req.body
      const validPackageDetail=await PackageDetail.findOne({slug})

      if(!validPackageDetail){
        return next(new AppError("Package Details Not Found",400))
      }

      const packageTag=new PackageTagModel({
          packageTagName,
          packageSlugName:validPackageDetail.slug,
          packageId:validPackageDetail._id
      })

      if(!packageTag){
        return next(new AppError("Package Not Added",400))
      }

      if (req.file) {
        const result = await cloudinary.v2.uploader.upload(req.file.path, {
          folder: "lms",
        });
  
        if (result) {
          (packageTag.icon.public_id = result.public_id),
            (packageTag.icon.secure_url = result.secure_url);
        }
        fs.rm(`uploads/${req.file.filename}`);
      }


      await packageTag.save()

      res.status(200).json({
        success:true,
        message:"Package Added Succesfully",
        data:packageTag
      })
  

    }catch(error){
      return next(new AppError(error.message,500))
    }
}

const getPackageTag=async(req,res,next)=>{
   try{  

    const allTag=await PackageTagModel.find({})

    if(!allTag){
      return next(new AppError("Not Found",400))
    }

    res.status(200).json({
      success:true,
      message:'All Tag are',
      data:allTag
    })
    
   }catch(error){
    console.log(error);
    
    return next(new AppError(error.message,500))
   }
}

const editPackageTag = async (req, res, next) => {
  try {
      const { id } = req.params; // Tag ID from params
      const { packageTagName, slug } = req.body; // Package slug from body
      
      
      // Find the package detail by slug
      const validPackageDetail = await PackageDetail.findOne({ slug });
      if (!validPackageDetail) {
          return next(new AppError("Package Details Not Found", 400));
      }

      // Find the package tag by ID
      const packageTag = await PackageTagModel.findById(id);
      if (!packageTag) {
          return next(new AppError("Package Tag Not Found", 400));
      }

      // Update packageTag details
      packageTag.packageTagName = packageTagName || packageTag.packageTagName;
      packageTag.packageSlugName = validPackageDetail.slug;
      packageTag.packageId = validPackageDetail._id;

      // Handle file upload if a new icon is provided
      if (req.file) {
          if (packageTag.icon.public_id) {
              await cloudinary.v2.uploader.destroy(packageTag.icon.public_id);
          }
          const result = await cloudinary.v2.uploader.upload(req.file.path, {
              folder: "lms",
          });
          packageTag.icon.public_id = result.public_id;
          packageTag.icon.secure_url = result.secure_url;
          fs.rm(`uploads/${req.file.filename}`);
      }

      await packageTag.save();

      res.status(200).json({
          success: true,
          message: "Package Tag Updated Successfully",
          data: packageTag
      });
  } catch (error) {
      return next(new AppError(error.message, 500));
  }
};


const deletePackageTag=async(req,res,next)=>{
   try{

    const {id}=req.params

    const validPackageTag=await PackageTagModel.findById(id)

    if(!validPackageTag){
       return next(new AppError("Package Tag Not Found",404))
    }

    await PackageTagModel.findByIdAndDelete(id)

    res.status(200).json({
       success:true,
       message:"Delete Succesfully"
    })

   }catch(error){
     return next(new AppError(error.message,500))
   }
}

const getPackageByTag=async(req,res,next)=>{
  try{
    
    const {id}=req.body
    
    
    
    if(!id){
      

        const specificPackageName = "Health Checkup Package";

        // Fetch only the package with the specific name

        const allPackage=await PackageDetail.find({})
      
        if (!allPackage) {
          return res.status(404).json({
            success: false,
            message: "Package not found",
          });
        }
    
        res.status(200).json({
          success:true,
          message:"package are:-",
          data:allPackage
        })
    }else{

       const packageTag=await PackageTagModel.findById(id)
      console.log(packageTag);
  

    if(!packageTag){
       return next(new AppError("Package Tag Not Found",400))
    }

    
    const allPackage=await PackageDetail.find({slug:packageTag.packageSlugName})

    if(!allPackage){
       return next(new AppError("Package Not Found",400))
    }

    res.status(200).json({
      success:true,
      message:"Package are:-",
      data:allPackage
    })
    }
    
  }catch(error){
    return next(new AppError(error.message,500))
  }
}





export {
  addPackage,
  getPackage,
  addPackageDetails,
  getPackageDetails,
  deletePackageDetails,
  updatePackageDetails,
  updatePackage,
  deletePackage,
  updatePackageDetails1,
  getPackageDetailsSlug,
  addPackageTag,
  getPackageTag,
  getPackageByTag,
  deletePackageTag,
  editPackageTag
}