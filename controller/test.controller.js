import AppError from "../utils/error.utlis.js"
import cloudinary from "cloudinary";
import fs from "fs/promises";
import slugify from "slugify";
import xlsx from "xlsx";
import TestModel from "../models/Test.model.js";
import { TestDetailModel } from "../models/TestDetail.model.js";
import PathologyDetail from "../models/pathology.model.js";
import { ServiceDetailModel } from "../models/servicedetails.model.js";


const addTest = async (req, res, next) => {
    try {

        const { testName, refServiceName } = req.body

        if (!testName) {
            return next(new AppError("All Field are Required", 400))
        }

        const addTest = new TestModel({
            testName,
            testPhoto: {
                public_id: "",
                secure_url: ""
            },
            refServiceName
        })

        if (!addTest) {
            return next(new AppError("Test not Added", 400))
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
            success: true,
            message: "Test Added Succesfully",
            data: addTest
        })


    } catch (error) {
        return next(new AppError(error.message, 500))
    }
}

const getTest = async (req, res, next) => {
    try {
        // Fetch all tests from the database     
        // const allTest = await TestModel.find({}).populate('testDetail');
        const allTest = await TestModel.find({})
            .populate('testDetail')
            .lean();


        if (!allTest) {
            return next(new AppError("Test not Found", 400));
        }



        // Define the desired sequence of test names
        const desiredSequence = [
            "Digital PET-CT Scan",
            "Digital Gamma Camera",
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

const getSingleTest = async (req, res, next) => {
    try {
        // Fetch all tests from the database with only required fields (testName and photo)
        const allTest = await TestModel.find({})
            .populate('testDetail', '_id testDetailName') // Fetch only _id and testDetailName from TestDetail
            .lean();

        if (!allTest) {
            return next(new AppError("Test not Found", 400));
        }

        // Define the desired sequence of test names
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


        // Sort tests based on the desired sequence
        const orderedTests = [];
        const remainingTests = [];

        allTest.forEach(test => {
            const index = desiredSequence.indexOf(test.testName);
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

const getSingleTestDetail = async (req, res, next) => {
    try {

        const { serviceName } = req.body;
        console.log("service name is ",serviceName);
        
        const decodedServiceName = decodeURIComponent(serviceName);

        const regexCategory = new RegExp(decodedServiceName.replace(/-/g, ''), 'i');


        const details = await TestDetailModel.find({ 
            category: { $regex: regexCategory } 
        });

        // Fetch the test data
        // const test = await TestModel.findOne({ refServiceName: decodedServiceName })
        //     .populate('testDetail', '_id testDetailName') // Fetch only _id and testDetailName
        //     .lean();

        // if (!test) {
        //     return next(new AppError("Test Not Found", 400));
        // }

        // const { page = 1, limit = 50 } = req.query; 
        // const testId = test._id;

        // Count the total number of test details for the given testId
        // const total = await TestDetailModel.countDocuments({ testId });

        // Fetch the test details with pagination
        // const testDetails = await TestDetailModel.find({ testId })
        //     .skip((page - 1) * limit) // Skip records based on the current page
        //     .limit(parseInt(limit)); // Limit the number of records

        // Send response with both test and test details
        // res.status(200).json({
        //     success: true,
        //     message: "Test details fetched successfully",
        //     // testData: test, // Test Data
        //     data: testDetails, // Paginated Test Details
        //     total, // Total number of records
        //     page: parseInt(page), // Current page
        //     totalPages: Math.ceil(total / limit), // Total number of pages
        // });

        res.status(200).json({
            success: true,
            message: "Test details fetched successfully",
 
            data: details, 
        });

    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};



const getServiceTestDetail = async (req, res, next) => {
    try {
        
        const {slugName}=req.params
   
        
        const validService=await ServiceDetailModel.findOne({slug:slugName})

        if(!validService){
            return next(new AppError("Service is Not Valid",400))
        }

 


        
        // const regexCategory = new RegExp(validService?.serviceDetailName.replace(/-/g, ''), 'i');

        // console.log(regexCategory);
        

        const details = await TestDetailModel.find({ 
            category: slugName 
        });


        if (!details) {
            return next(new AppError("Test Not Found", 400));
        }

    

        // Send response with both test and test details
        res.status(200).json({
            success: true,
            message: "Test details fetched successfully",
 
            data: details, 
        });

    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};


const updateTest = async (req, res, next) => {
    try {
        const { testId } = req.params; // Extract testId from URL parameters
        const { testName, refServiceName } = req.body; // Extract new test name from request body

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

        if (refServiceName) {
            test.refServiceName = refServiceName
        }

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
}

const deleteTest = async (req, res, next) => {
    try {
        const { testId } = req.params; // Extract testId from URL parameters

        console.log("test id is", testId);


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


const addTestDetails = async (req, res, next) => {
    try {

        const {slug}=req.params

        const {
            testDetailName,
            category,
            department,
            fasting,
            paramterInclude,
            recommedFor,
            testRequirement,
            testDetails,
            testDiscount,
            testInstructionsHin,
            testInstructionsEng,
            refService,
            reportConsuling,
            sampleCollection,
            age,
            testPrice,
            reportTime,
            testId
          } = req.body; // 🔹req.body` 

          console.log(req.body);
          

        const validService=await ServiceDetailModel.findOne({slug})
        
        if(!validService){
             return next(new AppError("Service is not Valid",400))
        }
         
         // 🔹 Create a slug for testDetailName
         let testSlug = slugify(testDetailName, { lower: true, strict: true });

         // 🔹 Ensure the slug is unique
         let existingTest = await TestDetailModel.findOne({ slug: testSlug });
         let count = 1;
         while (existingTest) {
             testSlug = `${testSlug}-${count}`;
             existingTest = await TestDetailModel.findOne({ slug: testSlug });
             count++;
         }
 


        
          const addTestDetail = new TestDetailModel({
            testDetailName,
            fasting,
            paramterInclude,
            recommedFor,
            category:validService.slug,
            departement:validService.serviceDetailName,
            refService:validService.serviceDetailName,
            sampleCollection,
            age,
            reportTime,
            reportConsuling,
            testPrice,
            testDiscount,
            testRequirement1:testDetails,
            testDetails1:testInstructionsEng,
            testDetails2:testInstructionsHin,
            refService:validService.serviceDetailName,
            testId,
            slug:testSlug
           })

        // await validTest.testDetail.push(addTestDetail._id);
        // await validTest.save();



        await addTestDetail.save()



        res.status(200).json({
            success: true,
            message: "Test Detail Added Succesfully",
            data: addTestDetail
        })


    } catch (error) {
        return next(new AppError(error.message, 500))
    }
}



const getTestDetail = async (req, res, next) => {
    try {
        const { testId } = req.params;
        const { page = 1, limit = 50 } = req.query; // Default limit set to 50


        // Validate if the test exists
        const validTest = await TestModel.findById(testId);
        if (!validTest) {
            return next(new AppError("Test Not Found", 400));
        }

        // Count the total number of test details for the given testId
        const total = await TestDetailModel.countDocuments({ testId });

        // Fetch the test details with pagination
        const testDetails = await TestDetailModel.find({ testId })
            .skip((page - 1) * limit) // Skip the records based on the current page
            .limit(parseInt(limit)) // Limit the number of records to the specified limit

        // Send response with paginated data
        res.status(200).json({
            success: true,
            message: "Test details fetched successfully",
            data: testDetails,
            total, // Total number of records available
            page: parseInt(page), // Current page
            totalPages: Math.ceil(total / limit), // Total number of pages
        });
    } catch (error) {
        console.error(error);
        return next(new AppError(error.message, 500)); // Return server error
    }
};


const updateTestDetails = async (req, res, next) => {
    try {
        const { testDetailId } = req.params;
        console.log(req.params);
        
        const updateData = req.body;

        console.log(updateData);
        

        // Find and update the TestDetail document in one step
        const testDetail = await TestDetailModel.findByIdAndUpdate(
            testDetailId, 
            updateData, 
            { new: true, runValidators: true } // Returns updated document & runs validation
        );

        console.log(testDetail);
        

        if (!testDetail) {
            return next(new AppError("Test Detail not found", 404));
        }

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


const getTestSpecificDetail = async (req, res, next) => {
    try {
        const { slug } = req.params

        console.log(req.params);
        
        const testDetail = await TestDetailModel.findOne({slug})

        // console.log(testDetail);
        

        if (!testDetail) {
            return next(new AppError("Test Detail not Found", 404))
        }

        res.status(200).json({
            success: true,
            message: "Specific Test Detail are:-",
            data: testDetail
        })

    } catch (error) {
        return next(new AppError(error.message, 500))
    }
}

const deleteTestSpecificDetail = async (req, res, next) => {
    try {
        const { slug } = req.params
        const testDetail = await TestDetailModel.findOne({ slug })

        if (!testDetail) {
            return next(new AppError("Test Detail not Found", 404))
        }

        await TestDetailModel.deleteOne({slug})

        res.status(200).json({
            success: true,
            message: "Test Detail Delete Succesfully",
            data: testDetail
        })

    } catch (error) {
        return next(new AppError(error.message, 500))
    }
}



const uploadExcelForTestDetails = async (req, res, next) => {

    try {
        const { testId } = req.params;

        if (!req.file) {
            return next(new AppError("No file uploaded", 400));
        }
        
        const result = await TestDetailModel.updateMany(
            { category: "Fetail Medicine" },  // Pehle isko search karo
            { $set: { category: "Fetal Medicine" } }  // Phir update karo
        );



        // }   
        // await result.save();

        res.status(200).json({
            success: true,
            message: "Test details uploaded successfully from Excel (Overwritten if existing).",
            data: result,
        });
    } catch (error) {
        console.log(error);
        return next(new AppError(error.message, 500));
    }
}



// const uploadExcelForTestDetails = async (req, res, next) => {
//     try {
//         const { testId } = req.params;
//         console.log("Received Test ID:", testId);

//         // Step 1: Find TestModel by testId
//         const test = await TestModel.findById(testId);
//         if (!test) {
//             return res.status(404).json({
//                 success: false,
//                 message: "Test not found.",
//             });
//         }
//         console.log("Found Test:", test);

//         // Step 2: Fetch TestDetail using testDetail array from TestModel
//         if (!test.testDetail || test.testDetail.length === 0) {
//             return res.status(404).json({
//                 success: false,
//                 message: "No testDetail IDs found in TestModel.",
//             });
//         }

//         console.log("TestDetail IDs:", test.testDetail);

//         const testDetails = await TestDetailModel.find({ _id: { $in: test.testDetail } });

//         if (testDetails.length === 0) {
//             return res.status(404).json({
//                 success: false,
//                 message: "No TestDetails found for this test.",
//             });
//         }

//         console.log("Fetched TestDetails:", testDetails);

//         for (const detail of testDetails) {
//             const newSlug = slugify(detail.testDetailName, { lower: true, strict: true });

//             await TestDetailModel.findByIdAndUpdate(detail._id, { slug: newSlug });

//             console.log(`Updated slug for ${detail.testDetailName} => ${newSlug}`);
//         }

//         // Step 3: Update TestDetails
//         // const updateResult = await TestDetailModel.updateMany(
//         //     { _id: { $in: test.testDetail } },
//         //     { $set: {  category:"Fetal Medicine"} } // Change this field as per requirement
//         // );

//         // console.log("Updated TestDetails:", updateResult);

//         return res.status(200).json({
//             success: true,
//             message: "All test details updated successfully.",
//             data: testDetails
//         });

//     } catch (error) {
//         console.error("Error updating test details:", error);
//         return res.status(500).json({
//             success: false,
//             message: "Internal server error.",
//         });
//     }
// };


// const uploadExcelForTestDetails = async (req, res, next) => {
//     try {
//         if (!req.file) {
//             return next(new AppError("No file uploaded", 400));
//         }

//         const filePath = req.file.path;
//         const workbook = xlsx.readFile(filePath);
//         const sheetName = workbook.SheetNames[0];
//         const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });

//         const cleanedData = sheetData.slice(1)
//             .map(row => row.map(cell => cell?.toString().trim()))
//             .filter(row => row.length > 0);

//         const addedTestDetails = [];


//         const updatedValues = {
//             paramterInclude: "On Type",
//             sampleCollection: "Required",
//             reportConsuling: "Available",
//             reportTime: "24-hr to 4 days",
//             fasting: "Consult your doctor",
//             recommedFor: "Male, Female",
//             age: "All Ages",
//         };

//         const testRequirement1 = '<p class="ql-align-justify">Pathology tests are essential diagnostic tools that analyze blood, urine, tissues, and other body fluids to detect diseases, monitor health conditions, and assess overall well-being. These tests help in identifying infections, organ function abnormalities, nutritional deficiencies, and chronic diseases like diabetes and thyroid disorders.</p>';

//         const testDetails1 = '<ul> <li class="ql-align-justify">Patients should inform their doctor about any ongoing medications, allergies, or pre-existing conditions before the test.</li><li class="ql-align-justify">Fasting may be required for specific tests like blood sugar, cholesterol, or lipid profile. Follow your doctor’s instructions carefully.</li><li class="ql-align-justify">Stay well-hydrated, especially for urine and blood tests, to ensure smooth sample collection.</li><li class="ql-align-justify">Avoid alcohol and heavy meals for at least 8-12 hours before the test, if advised by your doctor.</li><li class="ql-align-justify">For hormone and metabolic tests, sample collection timing may be important; check with your healthcare provider.</li><li class="ql-align-justify">Pregnant women should consult their doctor before undergoing any pathology tests that involve radiation or special preparations.</li><li class="ql-align-justify">Carry previous medical reports, doctor prescriptions, and medical history records for better diagnosis.</li><li class="ql-align-justify">Reach the diagnostic center at least 15-30 minutes before your scheduled appointment.</li><li class="ql-align-justify">Please carry identification proof such as an Aadhar card, PAN card, etc.</li></ul>';

//         const testDetails2 = '<ul> <li class="ql-align-justify">मरीज को अपनी चल रही दवाओं, एलर्जी या पूर्व-मौजूदा स्थितियों के बारे में डॉक्टर को पहले सूचित करना चाहिए।</li><li class="ql-align-justify">कुछ परीक्षणों, जैसे कि रक्त शर्करा, कोलेस्ट्रॉल या लिपिड प्रोफाइल के लिए उपवास आवश्यक हो सकता है। अपने डॉक्टर के निर्देशों का ध्यानपूर्वक पालन करें।</li><li class="ql-align-justify">मूत्र और रक्त परीक्षण के लिए अच्छी तरह से हाइड्रेटेड रहें ताकि नमूना आसानी से एकत्र किया जा सके।</li><li class="ql-align-justify">यदि आपके डॉक्टर ने सलाह दी हो, तो परीक्षण से कम से कम 8-12 घंटे पहले शराब और भारी भोजन से बचें।</li><li class="ql-align-justify">हार्मोन और चयापचय परीक्षणों के लिए नमूना एकत्र करने का समय महत्वपूर्ण हो सकता है; अपने स्वास्थ्य सेवा प्रदाता से जाँच करें।</li><li class="ql-align-justify">गर्भवती महिलाएँ किसी भी पैथोलॉजी परीक्षण से पहले अपने डॉक्टर से परामर्श करें, खासकर यदि उसमें विकिरण या विशेष तैयारी की आवश्यकता हो।</li><li class="ql-align-justify">बेहतर निदान के लिए पिछली चिकित्सा रिपोर्ट, डॉक्टर के पर्चे और चिकित्सा इतिहास रिकॉर्ड साथ लाएँ।</li><li class="ql-align-justify">अपनी निर्धारित नियुक्ति से कम से कम 15-30 मिनट पहले केंद्र में पहुँचें।</li><li class="ql-align-justify">कृपया आधार कार्ड, पैन कार्ड आदि जैसे पहचान प्रमाण साथ रखें।</li></ul>';



//         for (const row of cleanedData) {
//             const department = row[0];  // Department
//             const subDepartment = row[1]; // Sub_Department
//             const serviceType = row[2]; // Service Type
//             // const serviceName = row[3]; ❌ IGNORING `Service_Name`
//             const rate= row[3] ; // StandardOpCategory


//             if (!department || !subDepartment || !serviceType) {
//                 console.log("Skipping row due to missing data:", row);
//                 continue;
//             }

//             const parsedBaseRate = parseFloat(rate);
//                         if (isNaN(parsedBaseRate)) {
//                             console.log("Skipping row due to invalid Base Rate:", row);
//                             continue;
//                         }

//             const slugifiedServiceType = slugify(serviceType, { lower: true, strict: true });

//             // Store all data in PathologyDetail
//             let testDetail = await PathologyDetail.findOne({ testDetailName: serviceType });

//             if(subDepartment===''){

//             if (!testDetail) {
//                 testDetail = new PathologyDetail({
//                     departement: department,
//                     Sub_Department: subDepartment,
//                     testDetailName: serviceType,
//                     category: serviceType,
//                     testPrice: parsedBaseRate,
//                     testDetails1: testDetails1,
//                     testDetails2: testDetails2,
//                     testRequirement1: testRequirement1,
//                     testRequirement2: "",
//                     testDeliver1: "",
//                     testDeliver2: "",
//                     testDiscount: 0,
//                     sampleCollection: updatedValues.sampleCollection,
//                     reportConsuling: updatedValues.reportConsuling,
//                     reportTime: updatedValues.reportTime,
//                     fasting: updatedValues.fasting,
//                     recommedFor: updatedValues.recommedFor,
//                     age: updatedValues.age,
//                     paramterInclude: updatedValues.paramterInclude,
//                     slug: slugifiedServiceType,
//                 });

//                 await testDetail.save()
//                 // addedTestDetails.push(testDetail);
//             }
//             }
//         }

//         res.status(200).json({
//             success: true,
//             message: "Test details uploaded successfully from Excel.",
//             data: addedTestDetails,
//         });
//     } catch (error) {
//         console.log(error);
//         return next(new AppError(error.message, 500));
//     }
// };



const uploadTestDetailsInstru = async (req, res, next) => {
    try {
        const { testId } = req.params; // Extract testId from the request parameters

        // Placeholder values for DEXA Scan
        const testDetails1 = `
      <ul>
  <li class="ql-align-justify">The PET-CT Scan is performed to detect and evaluate various conditions such as cancer, neurological disorders, and cardiovascular diseases.</li>
  <li class="ql-align-justify">It helps in assessing the functioning of organs and tissues.</li>
  <li class="ql-align-justify">Patient should fast for 4-6 hours before the scan for accurate results.</li>
  <li class="ql-align-justify">Drinking plain water is allowed, but no other liquids should be consumed.</li>
  <li class="ql-align-justify">Avoid eating or drinking anything that contains sugar, as it may interfere with the results of the scan.</li>
  <li class="ql-align-justify">If you are diabetic, consult your doctor about whether you need to stop your insulin or diabetic medications before the scan.</li>
  <li class="ql-align-justify">Avoid physical exercise or strenuous activities on the day of the scan, as they may alter the results.</li>
  <li class="ql-align-justify">You will receive an injection of a small amount of radioactive material, which helps to create clear images during the scan.</li>
  <li class="ql-align-justify">Please inform the technician if you are pregnant or breastfeeding, as the scan involves radiation.</li>
  <li class="ql-align-justify">Wear loose clothing without any metal parts (e.g., buttons, zippers), as metal can interfere with the scan.</li>
  <li class="ql-align-justify">The scan will take approximately 30-60 minutes, depending on the area being examined.</li>
</ul>
      <p class="ql-align-justify"><br></p>
    `;

        const testDetails2 = `
    <ul>
  <li class="ql-align-justify">इस स्कैन से पहले 4-6 घंटे उपवास करना आवश्यक है ताकि सही परिणाम प्राप्त हो सकें।</li>
  <li class="ql-align-justify">सादा पानी पीना अनुमत है, लेकिन अन्य किसी तरल पदार्थ का सेवन न करें।</li>
  <li class="ql-align-justify">चीनी युक्त खाद्य पदार्थों और पेय पदार्थों से बचें, क्योंकि इससे स्कैन के परिणामों में विघटन हो सकता है।</li>
  <li class="ql-align-justify">यदि आप मधुमेह से ग्रस्त हैं, तो कृपया अपने डॉक्टर से परामर्श करें कि क्या आपको स्कैन से पहले अपनी इंसुलिन या मधुमेह दवाओं को बंद करना होगा।</li>
  <li class="ql-align-justify">स्कैन के दिन किसी प्रकार की शारीरिक मेहनत या शारीरिक गतिविधियों से बचें, क्योंकि यह परिणामों को प्रभावित कर सकता है।</li>
  <li class="ql-align-justify">आपको रेडियोधर्मी पदार्थ का इंजेक्शन दिया जाएगा, जो सुरक्षित होता है और स्कैन के दौरान स्पष्ट चित्र बनाने में मदद करता है।</li>
  <li class="ql-align-justify">कृपया टेकनीशियन को सूचित करें यदि आप गर्भवती हैं या स्तनपान करवा रही हैं, क्योंकि स्कैन में रेडिएशन शामिल होता है।</li>
  <li class="ql-align-justify">ढीले कपड़े पहनें, जिसमें कोई धातु के हिस्से (जैसे बटन या जिपर) न हों, क्योंकि धातु स्कैन में हस्तक्षेप कर सकती है।</li>
  <li class="ql-align-justify">स्कैन में लगभग 30-60 मिनट का समय लगेगा, जो कि जांचे जाने वाले क्षेत्र पर निर्भर करता है।</li>
</ul>
      <p class="ql-align-justify"><br></p>
    `;

        const testRequirement1 = `
      <p class="ql-align-justify"The PET-CT Scan is performed to detect and evaluate various conditions such as cancer, neurological disorders, and cardiovascular diseases. It helps in assessing the functioning of organs and tissues.</p>
      <p class="ql-align-justify"><br></p>
      <h3 class="ql-align-justify"><strong>Test Information</strong></h3>
    
<ul>
  <li class="ql-align-justify">Fasting: 4-6 hours prior to the scan</li>
  <li class="ql-align-justify">Duration of the scan: 30-60 minutes</li>
  <li class="ql-align-justify">Radioactive Injection: To create detailed images during the scan</li>
  <li class="ql-align-justify">Post-scan: You may resume your normal activities after the scan, but drink plenty of fluids to help eliminate the radioactive material from your body.</li>
</ul>

    `;
        // Validate if testId exists in the database
        const validTest = await TestModel.findById(testId);
        if (!validTest) {
            return next(new AppError("Invalid Test ID. Test not found.", 404));
        }

        // Fetch all TestDetails linked to the testId
        const testDetails = await TestDetailModel.find({ testId });

        if (testDetails.length === 0) {
            return next(new AppError("No Test Details found for the provided Test ID.", 404));
        }

        // Iterate through each TestDetail and update the fields
        const updatedTestDetails = [];
        for (let detail of testDetails) {
            // Update each TestDetail with the predefined values for DEXA Scan
            detail.testDetails1 = testDetails1;
            detail.testDetails2 = testDetails2;
            detail.testRequirement1 = testRequirement1;

            // Save the updated TestDetail
            await detail.save();
            updatedTestDetails.push(detail);
        }

        // Return a response with the updated TestDetails
        res.status(200).json({
            success: true,
            message: "Test details updated successfully for the provided Test ID.",
            data: updatedTestDetails,
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};


const updateSpecificTestFields = async (req, res, next) => {
    try {
        const { testId } = req.params;
        // Validate if testId exists in the database
        const validTest = await TestModel.findById(testId);
        if (!validTest) {
            return next(new AppError("Invalid Test ID. Test not found.", 404));
        }

        // Fetch all TestDetails linked to the testId
        const testDetails = await TestDetailModel.find({ testId });

        if (testDetails.length === 0) {
            return next(new AppError("No Test Details found for the provided Test ID.", 404));
        }

        // Define the updated values
        const updatedValues = {
            paramterInclude: "15",
            sampleCollection: "Not Required",
            reportConsuling: "Available",
            reportTime: "4hrs",
            fasting: "May be Required",
            recommedFor: "Pregnant Women, Blood Flow Analysis",
            age: "All Ages",
        };


        // Iterate through each TestDetail and update only the specified fields
        const updatedTestDetails = [];
        for (let detail of testDetails) {
            Object.assign(detail, updatedValues);
            await detail.save();
            updatedTestDetails.push(detail);
        }

        // Return a response with the updated TestDetails
        res.status(200).json({
            success: true,
            message: "Specified test fields updated successfully for the provided Test ID.",
            data: updatedTestDetails,
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};

const updateSlugDetails = async (req, res,next) => {
    try {
        const { oldSlug,id } = req.body;
        console.log(req.body);
        

        const validService=await ServiceDetailModel.findById(id)
        
        if(!validService){
             return next(new AppError("Service is not Valid"))
        }


        

       const details = await TestDetailModel.find({category:oldSlug})

        
    //    const details=await TestDetailModel.find({slug:oldSlug})

    //    console.log(details);
       


       

        const updatedTests = await TestDetailModel.updateMany(
            { category: oldSlug },  // Find all test details with the old slug
            { 
                $set: { 
                    category: validService.slug, 
                    departement: validService.serviceDetailName, 
                } 
            }
        );

    
        

        res.status(200).json({ 
            message: "Test details updated successfully", 
            modifiedCount: updatedTests.modifiedCount ,
            data:updatedTests
        });

    } catch (error) {

        console.log(error);
        
        res.status(500).json({ error: "Something went wrong", details: error.message });
    }
};





export {
    addTest,
    getTest,
    getSingleTest,
    getSingleTestDetail,
    updateTest,
    deleteTest,
    addTestDetails,
    getTestDetail,
    updateTestDetails,
    deleteTestDetail,
    getTestSpecificDetail,
    uploadExcelForTestDetails,
    uploadTestDetailsInstru,
    updateSpecificTestFields,
    deleteTestSpecificDetail,
    getServiceTestDetail,
    updateSlugDetails
}