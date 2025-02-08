import AppError from "../utils/error.utlis.js"
import cloudinary from "cloudinary";
import fs from "fs/promises";
import PathologyDetail from "../models/pathology.model.js";

// Add Pathology Details
 const addPathologyDetails = async (req, res, next) => {
  try {
    const {
      pathologyCategory,
      pathologyRate,
      pathologyDiscount,
      parameterInclude,
      report,
      parameters,
      pathologyName,
      pathologyOverview,
      pathologyParamterDetails,
    } = req.body;

    console.log(req.body);
    

    // Parse the `parameters` field if it exists
    const parsedParameters = parameters ? JSON.parse(parameters) : [];

    const newPathologyDetail = new PathologyDetail({
      pathologyCategory,
      pathologyRate,
      pathologyDiscount,
      parameterInclude,
      report,
     
      pathologyPhoto: {
        public_id: "",
        secure_url: "",
      },
      pathologyName,
      pathologyOverview,
      pathologyParamterDetails,
    });

    // Handle file upload to Cloudinary
    if (req.file) {
      const result = await cloudinary.v2.uploader.upload(req.file.path, {
        folder: "pathologies",
      });

      if (result) {
        newPathologyDetail.pathologyPhoto.public_id = result.public_id;
        newPathologyDetail.pathologyPhoto.secure_url = result.secure_url;
      }
      await fs.unlink(req.file.path); // Remove the uploaded file from local storage
    }

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
      pathologyName,
      pathologyCategory,
      pathologyRate,
      pathologyDiscount,
      parameterInclude,
      report,
      pathologysParameter,
      pathologyOverview,
      pathologyParamterDetails,
    } = req.body;

    const existingPathologyDetail = await PathologyDetail.findById(id);
    if (!existingPathologyDetail) {
      return next(new AppError("Pathology detail not found", 404));
    }

    // Update fields if provided
    if (pathologyName) existingPathologyDetail.pathologyName = pathologyName;
    if (pathologyCategory) existingPathologyDetail.pathologyCategory = pathologyCategory;
    if (pathologyRate) existingPathologyDetail.pathologyRate = pathologyRate;
    if (pathologyDiscount) existingPathologyDetail.pathologyDiscount = pathologyDiscount;
    if (parameterInclude) existingPathologyDetail.parameterInclude = parameterInclude;
    if (report) existingPathologyDetail.report = report;
    if (pathologyOverview) existingPathologyDetail.pathologyOverview = pathologyOverview;
    if (pathologyParamterDetails) existingPathologyDetail.pathologyParamterDetails = pathologyParamterDetails;

    // Update pathologysParameter if provided
    if (Array.isArray(pathologysParameter)) {
      existingPathologyDetail.pathologysParamter = pathologysParameter.map(item => ({
        parameterName: item?.parameterName,
        description: item?.description,
      }));
    }

    // Handle file upload
    if (req.file) {
      const result = await cloudinary.v2.uploader.upload(req.file.path, {
        folder: "pathologies",
      });

      if (result) {
        existingPathologyDetail.pathologyPhoto.public_id = result.public_id;
        existingPathologyDetail.pathologyPhoto.secure_url = result.secure_url;
      }
      await fs.unlink(req.file.path); // Remove the uploaded file from local storage
    }

    await existingPathologyDetail.save();

    res.status(200).json({
      success: true,
      message: "Pathology detail updated successfully",
      data: existingPathologyDetail,
    });
  } catch (error) {
    console.error(error);
    next(new AppError(error.message, 500));
  }
};

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

  
export {
    addPathologyDetails,
    getPathologyDetails,
    deletePathologyDetails,
    updatePathologyDetails,
}