import AppError from "../utils/error.utlis.js"
import cloudinary from "cloudinary";
import fs from "fs/promises";
import PathologyDetail from "../models/pathology.model.js";
import labTagModel from "../models/LabTestTag.model.js";
import slugify from "slugify";

// Add Pathology Details
const addPathologyDetails = async (req, res, next) => {
  try {
    const {
      paramterInclude,
      testRequirement,
      reportTime,
      parameters,
      testDetailName,
      fasting,
      pathologyOverview,
      pathologyParamterDetails,
      testInstructionsEng,
      testInstructionsHin,
      testDetails,
      age,
      reportConsuling,
      sampleCollection,
      testPrice,
      recommedFor
    } = req.body;

    console.log(testDetailName);
    

    console.log(req.body);


    // Parse the `parameters` field if it exists
    // const parsedParameters = parameters ? JSON.parse(parameters) : [];
      let slug = slugify(testDetailName, { lower: true, strict: true });

    const newPathologyDetail = new PathologyDetail({
      testDetailName,
      reportTime,
      fasting,
      testDetails1:testInstructionsEng,
      testDetails2:testInstructionsHin,
      testRequirement1:testDetails,
      age,
      reportConsuling,
      reportTime,
      sampleCollection,
      testPrice,
      paramterInclude,
      slug,
      recommedFor
    });

    

    // // Handle file upload to Cloudinary
    // if (req.file) {
    //   const result = await cloudinary.v2.uploader.upload(req.file.path, {
    //     folder: "pathologies",
    //   });

    //   if (result) {
    //     newPathologyDetail.pathologyPhoto.public_id = result.public_id;
    //     newPathologyDetail.pathologyPhoto.secure_url = result.secure_url;
    //   }
    //   await fs.unlink(req.file.path); // Remove the uploaded file from local storage
    // }

    await newPathologyDetail.save();

    res.status(200).json({
      success: true,
      message: "Pathology detail added successfully",
      data: newPathologyDetail,
    });
  } catch (error) {
    console.error(error);
    next(new AppError(error.message, 500));
  }
};

// Get Pathology Details
const getPathologyDetails = async (req, res, next) => {
  try {

    const pathologyDetails = await PathologyDetail.find({});

    // const pathologyDetails = await PathologyDetail.find({}, "testDetailName slug testPrice");

    if (!pathologyDetails) {
      return next(new AppError("Pathology details not found", 404));
    }

    res.status(200).json({
      success: true,
      message: "Pathology details retrieved successfully",
      data: pathologyDetails,
    });
  } catch (error) {
    console.error(error);
    next(new AppError(error.message, 500));
  }
};

const updatePathologyDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      paramterInclude,
      testRequirement,
      reportTime,
      parameters,
      testDetailName,
      fasting,
      testInstructionsEng,
      testInstructionsHin,
      testDetails,
      age,
      reportConsuling,
      sampleCollection,
      testPrice,
      recommedFor
    } = req.body;

    // Find existing test details
    const existingTestDetail = await PathologyDetail.findById(id);
    if (!existingTestDetail) {
      return next(new AppError("Test details not found", 404));
    }

    // Update fields if provided
    if (testDetailName) existingTestDetail.testDetailName = testDetailName;
    if (reportTime) existingTestDetail.reportTime = reportTime;
    if (fasting) existingTestDetail.fasting = fasting;
    if (testInstructionsEng) existingTestDetail.testDetails1 = testInstructionsEng;
    if (testInstructionsHin) existingTestDetail.testDetails2 = testInstructionsHin;
    if (testDetails) existingTestDetail.testRequirement1 = testDetails;
    if (age) existingTestDetail.age = age;
    if (reportConsuling) existingTestDetail.reportConsuling = reportConsuling;
    if (sampleCollection) existingTestDetail.sampleCollection = sampleCollection;
    if (testPrice) existingTestDetail.testPrice = testPrice;
    if (paramterInclude) existingTestDetail.paramterInclude = paramterInclude;
    if (recommedFor) existingTestDetail.recommedFor = recommedFor;
    
    // Save updated details
    await existingTestDetail.save();

    res.status(200).json({
      success: true,
      message: "Test details updated successfully",
      data: existingTestDetail,
    });
  } catch (error) {
    console.error("Error updating test details:", error);
    next(new AppError(error.message, 500));
  }
};


//  paggination pathology

const getPathologyDetailsWithPagination = async (req, res, next) => {
      try{
       
        const page = parseInt(req.query.page) || 1;   
        const limit = parseInt(req.query.limit) || 10; 
    
        const skip = (page - 1) * limit;             
    
        const allpathology = await PathologyDetail.find().skip(skip).limit(limit); 
        const total = await PathologyDetail.countDocuments();    

        res.status(200).json({
           success:true,
           message:"Paggination Pathology details",
           data:{
               allpathology,
               total
           }
        })


      }catch(error){
         return  next(new AppError(error.message,500))
      }
}







// Delete Pathology Details
const deletePathologyDetails = async (req, res, next) => {
  try {
    const { id } = req.params;

    const pathologyDetail = await PathologyDetail.findById(id);
    if (!pathologyDetail) {
      return next(new AppError("Pathology detail not found", 404));
    }

    await PathologyDetail.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Pathology detail deleted successfully",
    });
  } catch (error) {
    console.error(error);
    next(new AppError(error.message, 500));
  }
};

const singlePathology = async (req, res, next) => {
  try {
    const { slug } = req.params

    const validPathology = await PathologyDetail.findOne({ slug })
    console.log(validPathology);


    if (!validPathology) {
      return next(new AppError("Pathology is not Found", 400))
    }

    res.status(200).json({
      success: true,
      message: "Pathology Details is",
      data: validPathology
    })

  } catch (error) {
    return next(new AppError(error.message, 500))
  }
}

const addLabTag = async (req, res, next) => {
  try {
    const { slug } = req.params
    const { labTagName } = req.body
    const validlabDetail = await PathologyDetail.findOne({ slug })

    if (!validlabDetail) {
      return next(new AppError("lab Details Not Found", 400))
    }

    const labTag = new labTagModel({
      labTagName,
      labSlugName: validlabDetail.slug,
      labId: validlabDetail._id
    })

    if (!labTag) {
      return next(new AppError("lab Not Added", 400))
    }

    if (req.file) {
      const result = await cloudinary.v2.uploader.upload(req.file.path, {
        folder: "lms",
      });

      if (result) {
        (labTag.icon.public_id = result.public_id),
          (labTag.icon.secure_url = result.secure_url);
      }
      fs.rm(`uploads/${req.file.filename}`);
    }


    await labTag.save()

    res.status(200).json({
      success: true,
      message: "lab Added Succesfully",
      data: labTag
    })


  } catch (error) {
    return next(new AppError(error.message, 500))
  }
}

const getLabTag = async (req, res, next) => {
  try {

    const allTag = await labTagModel.find({})

    if (!allTag) {
      return next(new AppError("Not Found", 400))
    }

    res.status(200).json({
      success: true,
      message: 'All Tag are',
      data: allTag
    })

  } catch (error) {
    return next(new AppError(error.message, 500))
  }
}

const  deleteLabTag = async (req, res, next) => {
  try {

    const {id}=req.params

    const validTag=await labTagModel.findById(id)

    if(!validTag){
       return next(new AppError("Tag is Not Valid",400))
    }

    await labTagModel.findByIdAndDelete(id)


    res.status(200).json({
      success: true,
      message: 'tag delete Succesfully',
    })

  } catch (error) {
    return next(new AppError(error.message, 500))
  }
}

const editLabTag = async (req, res, next) => {
  try {
  

  
    const { id } = req.params; // Getting tag ID from params
    const { labTagName ,slug} = req.body; // Getting new tag name (if provided)
   
    console.log(id);

    console.log(labTagName,slug);
    
    


    const validlabDetail = await PathologyDetail.findOne({ slug })
    // ✅ Find existing lab tag
    const existingLabTag = await labTagModel.findById(id);
    if (!existingLabTag) {
      return next(new AppError("Lab Tag Not Found", 404));
    }

    if(!validlabDetail){
        return next(new AppError("Lab Not Found",404))
    }

    // ✅ Update tag name if provided
    if (labTagName) {
      existingLabTag.labTagName = labTagName;
    }

    existingLabTag.labSlugName=validlabDetail.slug
    existingLabTag.labId=validlabDetail._id

    // ✅ If a new icon is uploaded, update Cloudinary
    if (req.file) {
      // Delete old icon from Cloudinary if it exists
      if (existingLabTag.icon.public_id) {
        await cloudinary.v2.uploader.destroy(existingLabTag.icon.public_id);
      }

      // Upload new icon
      const result = await cloudinary.v2.uploader.upload(req.file.path, {
        folder: "lms",
      });

      if (result) {
        existingLabTag.icon.public_id = result.public_id;
        existingLabTag.icon.secure_url = result.secure_url;
      }

      // Delete file from local uploads
      fs.rm(`uploads/${req.file.filename}`);
    }

    // ✅ Save updated lab tag
    await existingLabTag.save();

    res.status(200).json({
      success: true,
      message: "Lab Tag Updated Successfully",
      data: existingLabTag,
    });

  } catch (error) {
    console.log(error);
    
    return next(new AppError(error.message, 500));
  }
};




export {
  addPathologyDetails,
  getPathologyDetails,
  deletePathologyDetails,
  updatePathologyDetails,
  singlePathology,
  addLabTag,
  getLabTag,
  deleteLabTag,
  editLabTag,
  getPathologyDetailsWithPagination
}