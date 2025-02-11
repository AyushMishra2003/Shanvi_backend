import AppError from "../utils/error.utlis.js"
import cloudinary from "cloudinary";
import fs from "fs/promises";
import slugify from "slugify";
import xlsx from "xlsx";
import TestModel from "../models/Test.model.js";
import { TestDetailModel } from "../models/TestDetail.model.js";





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
        const decodedServiceName = decodeURIComponent(serviceName);

        // Fetch the test data
        const test = await TestModel.findOne({ refServiceName: decodedServiceName })
            .populate('testDetail', '_id testDetailName') // Fetch only _id and testDetailName
            .lean();

        if (!test) {
            return next(new AppError("Test Not Found", 400));
        }

        const { page = 1, limit = 50 } = req.query; // Default limit set to 50
        const testId = test._id;

        // Count the total number of test details for the given testId
        const total = await TestDetailModel.countDocuments({ testId });

        // Fetch the test details with pagination
        const testDetails = await TestDetailModel.find({ testId })
            .skip((page - 1) * limit) // Skip records based on the current page
            .limit(parseInt(limit)); // Limit the number of records

        // Send response with both test and test details
        res.status(200).json({
            success: true,
            message: "Test details fetched successfully",
            // testData: test, // Test Data
            data: testDetails, // Paginated Test Details
            total, // Total number of records
            page: parseInt(page), // Current page
            totalPages: Math.ceil(total / limit), // Total number of pages
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
};

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

        const { testId } = req.params

        const { testDetailName, category, testPrice, testDetails1, testDetails2, testDiscount, testRequirement2, testRequirement1, testDeliver1, testDeliver2, refService } = req.body




        // if(!testDetailName || !category || !testPrice || !testDetails1 || !testDetails2 || !testDiscount || !testRequirement1 || !testRequirement2 || !testDeliver1 || !testDeliver2){
        //     return next(new AppError("All Field are Required",400))
        // }

        const validTest = await TestModel.findById(testId)

        if (!validTest) {
            return next(new AppError("Test is not Found", 404))
        }

        const addTestDetail = new TestDetailModel({
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
            refService
        })





        await validTest.testDetail.push(addTestDetail._id);
        await validTest.save();



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

// const getTestDetail=async(req,res,next)=>{
//     try{

//         const {testId}=req.params


//         const validTest=await TestModel.findById(testId)

//         if(!validTest){
//             return next(new AppError("Test Not Found",400))
//         }

//         const testDetail=await TestDetailModel.find({testId})

//         if(!testDetail){
//             return next(new AppError("Test Details not Found,Something went Wrong",400))
//         }

//         res.status(200).json({
//             success:true,
//             message:"ALL Test Detail are:-",
//             data:testDetail
//         })

//     }catch(error){
//         return next(new AppError(error.message,500))
//     }
// }

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


        testDetail.testDetailName = updateData?.testDetailName
        testDetail.testPrice = updateData?.testPrice
        testDetail.testDetails1 = updateData?.testDetails1
        testDetail.testDetails2 = updateData?.testDetails2
        testDetail.testRequirement1 = updateData?.testRequirement1

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


const getTestSpecificDetail = async (req, res, next) => {
    try {
        const { slug } = req.params

        const testDetail = await TestDetailModel.findOne({ slug })

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


const uploadExcelForTestDetails = async (req, res, next) => {
    try {
        const { testId } = req.params;

        if (!req.file) {
            return next(new AppError("No file uploaded", 400));
        }

        const validTest = await TestModel.findById(testId);
        if (!validTest) {
            return next(new AppError("Invalid Test ID. Test not found.", 404));
        }

        const filePath = req.file.path;
        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });

        const cleanedData = sheetData.slice(1).map(row => row.map(cell => cell?.toString().trim())).filter(row => row.length > 0);



        const addedTestDetails = [];


        
        // const updatedValues = {
        //     paramterInclude: "Depends on test",
        //     sampleCollection: "Available",
        //     reportConsuling: "Available",
        //     reportTime: "Same Day to 48 Hours",
        //     fasting: "Consult your doctor",
        //     recommedFor: "Male,Female",
        //     age: "All Age Groups",
        // };
        
        const updatedValues = {
            paramterInclude: "On Type",
            sampleCollection: "Required",
            reportConsuling: "Available",
            reportTime: "Same Day to 48 Hours",
            fasting: "Consult your doctor",
            recommedFor: "Male,Female",
            age: "Male,Female",
        };
        
        const testRequirement1 = '<p class="ql-align-justify">Interventional Radiology (IR) involves minimally invasive, image-guided procedures to diagnose and treat various conditions, including vascular diseases, tumors, and organ dysfunctions. Common IR procedures include angioplasty, embolization, biopsy, radiofrequency ablation, and drainage catheter placement. These procedures provide targeted treatment with minimal recovery time and reduced risks compared to traditional surgeries.</p>';
        
        const testDetails1 = '<ul> <li class="ql-align-justify">Patients should inform their doctor about any ongoing medications, allergies, or pre-existing conditions before the procedure.</li><li class="ql-align-justify">Fasting for at least 6-8 hours before the procedure is usually required. Follow specific instructions provided by your doctor.</li><li class="ql-align-justify">Blood tests or imaging may be required before the procedure to assess eligibility.</li><li class="ql-align-justify">If you are on blood thinners or have a bleeding disorder, inform the healthcare provider in advance.</li><li class="ql-align-justify">Pregnant or breastfeeding women should consult their doctor before undergoing any interventional radiology procedure.</li><li class="ql-align-justify">Avoid consuming alcohol or smoking for at least 24 hours before the procedure.</li><li class="ql-align-justify">You may need to stay under observation for a few hours after the procedure, so arrange for a companion if required.</li><li class="ql-align-justify">Carry previous medical reports, imaging results (CT, MRI, Ultrasound), doctor prescriptions, and medical history records.</li><li class="ql-align-justify">Reach the center at least 30 minutes before your scheduled appointment.</li><li class="ql-align-justify">Please carry identification proof such as an Aadhar card, PAN card, etc.</li></ul>';
        
        const testDetails2 = '<ul> <li class="ql-align-justify">मरीज को अपनी चल रही दवाओं, एलर्जी या पूर्व-मौजूदा स्थितियों के बारे में डॉक्टर को पहले सूचित करना चाहिए।</li><li class="ql-align-justify">प्रक्रिया से कम से कम 6-8 घंटे पहले उपवास आवश्यक हो सकता है। अपने डॉक्टर द्वारा दिए गए विशिष्ट निर्देशों का पालन करें।</li><li class="ql-align-justify">प्रक्रिया के लिए पात्रता का आकलन करने के लिए रक्त परीक्षण या इमेजिंग आवश्यक हो सकती है।</li><li class="ql-align-justify">यदि आप रक्त पतला करने वाली दवाएँ ले रहे हैं या रक्तस्राव संबंधी विकार है, तो पहले से ही अपने स्वास्थ्य सेवा प्रदाता को सूचित करें।</li><li class="ql-align-justify">गर्भवती या स्तनपान कराने वाली महिलाएँ पहले से ही अपने डॉक्टर से परामर्श करें।</li><li class="ql-align-justify">प्रक्रिया से कम से कम 24 घंटे पहले शराब या धूम्रपान से बचें।</li><li class="ql-align-justify">प्रक्रिया के बाद कुछ घंटों के लिए निगरानी में रहना पड़ सकता है, इसलिए यदि आवश्यक हो तो किसी साथी को साथ लाने की व्यवस्था करें।</li><li class="ql-align-justify">पिछली चिकित्सा रिपोर्ट, इमेजिंग परिणाम (CT, MRI, अल्ट्रासाउंड), डॉक्टर का पर्चा और चिकित्सा इतिहास रिकॉर्ड साथ लाएँ।</li><li class="ql-align-justify">अपनी निर्धारित नियुक्ति से कम से कम 30 मिनट पहले केंद्र में पहुँचें।</li><li class="ql-align-justify">कृपया आधार कार्ड, पैन कार्ड आदि जैसे पहचान प्रमाण साथ रखें।</li></ul>';
        
        
        
        





        for (const row of cleanedData) {
            const department = row[0];
            const subDepartment = row[1];
            console.log(subDepartment);
            
            const testName = row[2];
            const baseRate = row[3];

    

            if (!testName || !baseRate) {
                console.log("Skipping row due to missing data:", row);
                continue;
            }

            const parsedBaseRate = parseFloat(baseRate);
            if (isNaN(parsedBaseRate)) {
                console.log("Skipping row due to invalid Base Rate:", row);
                continue;
            }

            const slugifiedTestName = slugify(testName, { lower: true, strict: true });

            // **Check if testDetail already exists**
            let testDetail = await TestDetailModel.findOne({ testDetailName: testName });


            // console.log(testDetail);





            // if (testDetail) {
            //     console.log("🔍 Existing Test Detail Found:");

            //     // Updating existing test details
            //     testDetail.departement = department;
            //     testDetail.Sub_Department = subDepartment;
            //     testDetail.testPrice = parsedBaseRate;

            //     // **Check if these fields are updating correctly**

            //     testDetail.testDetails1 = testDetails1;
            //     testDetail.testDetails2 = testDetails2;
            //     testDetail.testRequirement1 = testRequirement1;
            //     testDetail.testRequirement2 = "";
            //     testDetail.testDeliver1 = "";
            //     testDetail.testDeliver2 = "";
            //     testDetail.testDiscount = 0;
            //     testDetail.sampleCollection = updatedValues.sampleCollection;
            //     testDetail.reportConsuling = updatedValues.reportConsuling;
            //     testDetail.reportTime = updatedValues.reportTime;
            //     testDetail.fasting = updatedValues.fasting;
            //     testDetail.recommedFor = updatedValues.recommedFor;
            //     testDetail.age = updatedValues.age;
            //     testDetail.paramterInclude = updatedValues.paramterInclude;
            //     testDetail.slug = slugifiedTestName;

            //     console.log(testDetail);
            //     validTest.testDetail.push(testDetail._id);
            //     // addedTestDetails.push(testDetail);

            //     await testDetail.save();
            // // }
            //  else {
            // **If not exists, create new one**
            // if(subDepartment==='Gamma'){
            testDetail = new TestDetailModel({
                departement: department,
                Sub_Department: subDepartment,
                testDetailName: testName,
                category: validTest.testName,
                testPrice: parsedBaseRate,
                testDetails1: testDetails1,
                testDetails2: testDetails2,
                testRequirement1: testRequirement1,
                testRequirement2: "",
                testDeliver1: "",
                testDeliver2: "",
                testDiscount: 0,
                sampleCollection: updatedValues.sampleCollection,
                reportConsuling: updatedValues.reportConsuling,
                reportTime: updatedValues.reportTime,
                fasting: updatedValues.fasting,
                recommedFor: updatedValues.recommedFor,
                age: updatedValues.age,
                paramterInclude: updatedValues.paramterInclude,
                testId,
                slug: slugifiedTestName,
            })
            await testDetail.save();
            validTest.testDetail.push(testDetail._id);
            addedTestDetails.push(testDetail);
          

        
        }
        // }   
        await validTest.save();

        res.status(200).json({
            success: true,
            message: "Test details uploaded successfully from Excel (Overwritten if existing).",
            data: addedTestDetails,
        });
    } catch (error) {
        return next(new AppError(error.message, 500));
    }
};

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
    updateSpecificTestFields
}