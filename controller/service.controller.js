import {ServiceModel} from "../models/service.model.js"
import {ServiceDetailModel} from "../models/servicedetails.model.js";
import AppError from "../utils/error.utlis.js"
import cloudinary from "cloudinary";
import fs from "fs/promises";

const addService=async(req,res,next)=>{
    try{

        const {serviceName                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  }=req.body

        if(!serviceName){
            return next(new AppError("Service Name is Required",400))
        }

        const addService=await ServiceModel({
            serviceName,
            servicePhoto:{
                public_id:"",
                secure_url:""
            }
        })

        if(!addService){
            return next(new AppError("Service not Found",400))
        }

            if (req.file) {
                    const result = await cloudinary.v2.uploader.upload(req.file.path, {
                      folder: "lms",
                    });
        
                    console.log(result);
                    
                    if (result) {
                      (addService.servicePhoto.public_id = result.public_id),
                        (addService.servicePhoto.secure_url = result.secure_url);
                    }
                    fs.rm(`uploads/${req.file.filename}`);
         }


        await addService.save()

        res.status(200).json({
            success:true,
            message:"Service Added Succesfully",
            data:addService
        })

    }catch(error){
        return next(new AppError(error.message,500))
    }
}
  

const getService = async (req, res, next) => {
    try {
        const allService = await ServiceModel.find({}).populate('serviceDetails');

        const desiredSequence = [
            "Digital PET-CT Scan",
			"Digital 3.0 Tesla MRI(48 Channel)",
			"128 Slice CT Scan",
            "Digital Gamma Scans",
			 "Digital Mammography",
            "Fetal Medicine",
			 "Dexa Scan",
			 "Digital X-Ray",
			 "UltraSound (3D/4D/Dopplers/TIFFA)",
            "Cardiology",
            "Neurology",
			"Gastrology",
			"Medical Oncology",
			"Therapy",
			"Interventional Radiology"
        ];

        if (!allService) {
            return next(new AppError("Service not Found", 400));
        }

        // Rearrange services based on serviceDetails name sequence
        const orderedServices = [];
        const remainingServices = [];

        // Separate services into desired order and remaining ones
        desiredSequence.forEach(detailName => {
            allService.forEach(service => {
                if (
                    service.serviceDetails &&
                    service.serviceDetails.some(detail => detail.name === detailName)
                ) {
                    orderedServices.push(service);
                }
            });
        });

        // Add the rest of the services that were not in the desired sequence
        allService.forEach(service => {
            if (
                !service.serviceDetails ||
                !service.serviceDetails.some(detail => desiredSequence.includes(detail.name))
            ) {
                remainingServices.push(service);
            }
        });

        // Combine the ordered services and remaining services
        const finalServiceOrder = [...orderedServices, ...remainingServices];

  
        

        res.status(200).json({
            success: true,
            message: "Service Data are:-",
            data: finalServiceOrder,
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};


const getDigitalService = async (req, res, next) => {
    try {
       
        
          const allService = await ServiceModel.find({}).populate('serviceDetails');
          console.log("MAI AAYA HU")
          

          const desiredSequence = [
            "Digital PET-CT Scan",
			"Digital 3.0 Tesla MRI(48 Channel)",
			"128 Slice CT Scan",
            "Digital Gamma Scans",
			 "Digital Mammography",
            "Fetal Medicine",
			 "Dexa Scan",
			 "Digital X-Ray",
			 "UltraSound (3D/4D/Dopplers/TIFFA)",
            "Cardiology",
            "Neurology",
			"Gastrology",
			"Medical Oncology",
			"Therapy",
			"Interventional Radiology"
        ];

        if (!allService) {
            return next(new AppError("Service not Found", 400));
        }

        // Rearrange services based on serviceDetails name sequence
        const orderedServices = [];
        const remainingServices = [];

        // Separate services into desired order and remaining ones
        desiredSequence.forEach(detailName => {
            allService.forEach(service => {
                if (
                    service.serviceDetails &&
                    service.serviceDetails.some(detail => detail.name === detailName)
                ) {
                    orderedServices.push(service);
                }
            });
        });

        // Add the rest of the services that were not in the desired sequence
        allService.forEach(service => {
            if (
                !service.serviceDetails ||
                !service.serviceDetails.some(detail => desiredSequence.includes(detail.name))
            ) {
                remainingServices.push(service);
            }
        });

        // Combine the ordered services and remaining services
        const finalServiceOrder = [...orderedServices, ...remainingServices];

        res.status(200).json({
            success: true,
            message: "Service Data are:-",
            data: finalServiceOrder,
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }

};



const getServiceMoreDetail = async (req, res, next) => {
    try {
        // Fetch all services and populate serviceDetails
        const allServices = await ServiceModel.find({}).populate('serviceDetails');

        console.log("Fetching service details...");

        if (!allServices || allServices.length === 0) {
            return next(new AppError("No services found", 400));
        }

        // Define the desired serviceDetails sequence
        const desiredSequence = [
            "Digital PET CT Scan",
			"Digital 3.0 Tesla MRI",
			"128 Slice High Speed CT Scan",
            "Digital Gamma Scans",
			 "Digital Mammography",
            "Fetal Medicine",
			 "Dexa Scan",
			 "Digital X-Ray",
			 "Ultrasound (3D/4D/ Dopplers/ TIFFA)",
            "Cardiology",
            "Neurology",
			"Gastrology",
			"Medical Oncology",
			"Therapy",
			"Interventional Radiology"
        
        ].map(name => name.toLowerCase().trim()); // Normalize sequence names

        // Extract all serviceDetails, ensuring they are valid
        let allServiceDetails = [];
        allServices.forEach(service => {
            if (service.serviceDetails && Array.isArray(service.serviceDetails)) {
                allServiceDetails.push(...service.serviceDetails);
            }
        });

        // Filter out undefined or null serviceDetails
        // allServiceDetails.forEach(detail => console.log("Checking Detail:", detail.serviceDetailName));

        // Create a mapping of serviceDetails using serviceDetailName
        const serviceDetailsMap = new Map();
        allServiceDetails.forEach(detail => {
            const normalizedName = detail.serviceDetailName.toLowerCase().trim();
            serviceDetailsMap.set(normalizedName, detail);
        });

        // Sort serviceDetails based on the defined sequence
        const orderedServiceDetails = desiredSequence
            .map(name => serviceDetailsMap.get(name))
            .filter(detail => detail !== undefined); // Remove undefined values (if any detail is missing)

        // Find serviceDetails that were not in the desired sequence and add them at the end
        const remainingServiceDetails = allServiceDetails.filter(
            detail => !desiredSequence.includes(detail.serviceDetailName.toLowerCase().trim())
        );

        // Combine ordered and remaining serviceDetails
        const finalServiceDetailsOrder = [...orderedServiceDetails, ...remainingServiceDetails];

        // Debugging: Log the final ordered list
        console.log("Final Ordered List:");
        finalServiceDetailsOrder.forEach(detail => console.log(detail.serviceDetailName));

        // Send the response
        res.status(200).json({
            success: true,
            message: "Service details sorted successfully.",
            data: finalServiceDetailsOrder,
        });
    } catch (error) {
        console.error("Error fetching services:", error);
        return next(new AppError("Internal Server Error", 500));
    }
};




const updateService=async(req,res,next)=>{
    try{
        
        const {serviceName}=req.body

      
        const {serviceId}=req.params

        const validService=await ServiceModel.findById(serviceId)

        if(!validService){
            return next(new AppError("Service is Not Found",404))
        }

        console.log(validService);
        
        if(serviceName){
            validService.serviceName=serviceName
        }

        console.log(req.file);
        
     

            if (req.file) {
                    // Delete the old photo from Cloudinary if it exists
                    // if (test.testPhoto.public_id) {
                    //     await cloudinary.v2.uploader.destroy(test.testPhoto.public_id);
                    // }
        
                    // Upload the new photo to Cloudinary
                    console.log("helli i am coming");
                    
                    const result = await cloudinary.v2.uploader.upload(req.file.path, {
                        folder: "lms",
                    });
        
                    if (result) {
                          validService.servicePhoto.public_id = result.public_id;
                          validService.servicePhoto.secure_url = result.secure_url;
                    }
        
                    // Delete the uploaded file from local storage
                    fs.rm(`uploads/${req.file.filename}`);
                }

        await validService.save()

        res.status(200).json({
            success:true,
            message:"Service Update Succesfully",
            data:validService
        })


    }catch(error){
        console.log(error);
        
        return next(new AppError(error.message,500))
    }
}

const deleteService = async (req, res, next) => {
    try {
      const { serviceId } = req.params; // Extract service ID from params
  
      // Find the service by ID
      const service = await ServiceModel.findById(serviceId);
  
      if (!service) {
        return next(new AppError("Service not found", 404));
      }
  
      // Delete all related service details
      if (service.serviceDetails && service.serviceDetails.length > 0) {
        await ServiceDetailModel.deleteMany({ _id: { $in: service.serviceDetails } });
      }
  
      // Delete the service itself
      await ServiceModel.findByIdAndDelete(serviceId);
  
      res.status(200).json({
        success: true,
        message: "Service and related details deleted successfully",
      });
    } catch (error) {
      return next(new AppError(error.message, 500));
    }
  };
  


const addServiceDetail=async(req,res,next)=>{
    try{

        const {serviceDetailName,serviceDetail}=req.body
        const {serviceId}=req.params

        if(!serviceDetailName || !serviceDetail){
            return next(new AppError("All Field are Required",400))
        }

        const validService=await ServiceModel.findById(serviceId)

        if(!validService){
            return next(new AppError("Valid Service is Not Found",404))
        }

        console.log(validService);
        

        const addServiceDetail=new ServiceDetailModel({
            serviceDetailName,
            serviceDetail,
            servicePhoto:{
                public_id:"",
                secure_url:""
            },
            serviceId
        })
   
        if (req.file) {
            const result = await cloudinary.v2.uploader.upload(req.file.path, {
              folder: "lms",
            });
            
            if (result) {
              (addServiceDetail.servicePhoto.public_id = result.public_id),
                (addServiceDetail.servicePhoto.secure_url = result.secure_url);
            }
            fs.rm(`uploads/${req.file.filename}`);
        }


        console.log((addServiceDetail));
        

        await validService.serviceDetails.push(addServiceDetail._id);


        await validService.save()

        await addServiceDetail.save()



        res.status(200).json({
            success:true,
            message:"Add Service Details",
            data:addServiceDetail
        })



    }catch(error){
        return next(new AppError(error.message))
    }
}


const getServiceDetail=async(req,res,next)=>{
    try{

        const {serviceId}=req.params

        const validService=await ServiceModel.findById(serviceId)

        if(!validService){
            return next(new AppError("Sevice is not Valid",400))
        }
         
        const serviceDetails=await ServiceDetailModel.find({serviceId}).populate("serviceId");


        if(!serviceDetails){
            return next(new AppError("Service Details not Found,Something Went Wrong",400))
        }


        res.status(200).json({
            success:true,
            message:"Service Details are:-",
            data:serviceDetails
        })



    }catch(error){
        return next(new AppError(error.message,500))
    }
}

const updateServiceDetail = async (req, res, next) => {
    try {
      const { serviceDetailId } = req.params; // Extract service detail ID from params
      console.log(serviceDetailId)
      
      const { serviceDetailName, serviceDetail } = req.body; // Extract fields to update
      // Check if the serviceDetailId is valid
      const all=await ServiceDetailModel.find({})
    //   console.log(all);
      

      const existingServiceDetail = await ServiceDetailModel.findById(serviceDetailId);
      if (!existingServiceDetail) {
        return next(new AppError("Service Detail not found", 402));
      }
  
      // Update fields only if provided in the request
      if (serviceDetailName) existingServiceDetail.serviceDetailName = serviceDetailName;
      if (serviceDetail) existingServiceDetail.serviceDetail = serviceDetail;
  
      // Handle file upload if a new image is provided
      if (req.file) {
        // Upload the new image to Cloudinary
        const result = await cloudinary.v2.uploader.upload(req.file.path, {
          folder: "lms",
        });
  
        // Update the servicePhoto field with new image data
        existingServiceDetail.servicePhoto = {
          public_id: result.public_id,
          secure_url: result.secure_url,
        };
  
        // Remove the uploaded file from the server
        // fs.rmSync(`uploads/${req.file.filename}`);
      }
  
      // Save the updated document to the database
      await existingServiceDetail.save();
  
      res.status(200).json({
        success: true,
        message: "Service Detail updated successfully",
        data: existingServiceDetail,
      });
    } catch (error) {
      return next(new AppError(error.message, 500));
    }
};



const deleteServiceDetail = async (req, res, next) => {
    try {
        const { serviceDetailId } = req.params; // Extract service detail ID from params

        console.log("ServiceDetailId:", serviceDetailId);

        // Find the service detail by ID
        const serviceDetail = await ServiceDetailModel.findById(serviceDetailId);
        if (!serviceDetail) {
            return next(new AppError("Service Detail not found", 404));
        }

        // Find the associated service and remove the serviceDetailId
        const service = await ServiceModel.findById(serviceDetail.serviceId);
        if (service) {
            service.serviceDetails = service.serviceDetails.filter((id) => {
                if (!id) return false; // Skip null/undefined IDs
                return id.toString() !== serviceDetailId;
            });
            await service.save(); // Save the updated service
        } else {
            console.warn(`Service not found for serviceDetailId: ${serviceDetailId}`);
        }

        // Delete the service detail document
        await ServiceDetailModel.findByIdAndDelete(serviceDetailId);

        res.status(200).json({
            success: true,
            message: "Service Detail deleted successfully",
        });
    } catch (error) {
        console.error("Error in deleteServiceDetail:", error);
        return next(new AppError(error.message, 500));
    }
};


const getSpecificDetail=async(req,res,next)=>{
    try{

        const {slug}=req.params
  
        const service=await ServiceDetailModel.findOne({slug})        

        if(!service){
            return next(new AppError("Service not Found",404))
        }

        console.log(service);
        

        res.status(200).json({
            success:true,
            message:"Service Detail are:-",
            data:service
        })


    }catch(error){
        return next(new AppError(error.message,500))
    }
}

  





export {
    addService,
    getService,  
    updateService,
    deleteService,
    addServiceDetail,
    getServiceDetail,
    updateServiceDetail,
    deleteServiceDetail,
    getSpecificDetail,
    getDigitalService,
    getServiceMoreDetail
}