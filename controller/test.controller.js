import AppError from "../utils/error.utlis.js"
import cloudinary from "cloudinary";
import fs from "fs/promises";
import TestModel from "../models/Test.model.js";
import TestDetailModel from "../models/TestDetail.model.js";
import { log } from "console";




const addTest=async(req,res,next)=>{
    try{

        const {testName,refServiceName}=req.body

        if(!testName){
            return next(new AppError("All Field are Required",400))
        }
        
        const addTest=new TestModel({
            testName,
            testPhoto:{
                public_id:"",
                secure_url:""
            },
            refServiceName
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
        const { testName ,refServiceName} = req.body; // Extract new test name from request body

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

        if(refServiceName){
            test.refServiceName=refServiceName
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

        const {testDetailName,category,testPrice,testDetails1,testDetails2,testDiscount,testRequirement2, testRequirement1,testDeliver1,testDeliver2,refService}=req.body


    

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
            refService
        })
        
           
  
        

        await validTest.testDetail.push(addTestDetail._id);
        await validTest.save();  
        
   
        
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


        testDetail.testDetailName=updateData?.testDetailName
        testDetail.testPrice=updateData?.testPrice
        testDetail.testDetails1=updateData?.testDetails1
        testDetail.testDetails2=updateData?.testDetails2
        testDetail.testRequirement1=updateData?.testRequirement1

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


const uploadExcelForTestDetails = async (req, res, next) => {
    try {
      const { testId } = req.params; // Extract testId from request parameters
  
      // Check if file is uploaded
      if (!req.file) {
        return next(new AppError("No file uploaded", 400));
      }
  
      // Validate if testId exists in the database
      const validTest = await TestModel.findById(testId);
      if (!validTest) {
        return next(new AppError("Invalid Test ID. Test not found.", 404));
      }
  
      // Parse the uploaded Excel file
      const filePath = req.file.path;
      const workbook = xlsx.readFile(filePath);
      const sheetName = workbook.SheetNames[0]; // Use the first sheet
      const sheetData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 });
  
      // Log the raw data fetched from the Excel file
      console.log("Raw Excel Data:", sheetData);
  
      // Skip the first row if it contains column names
      const cleanedData = sheetData.slice(1); // Remove the header row
  
      const addedTestDetails = [];

      const testDetails1='<ul><li class=\"ql-align-justify\">Patient should be fasting for 4-6 hours before the appointment.</li><li class=\"ql-align-justify\">Drinking plain water is allowed and encouraged. There is no need to hold urine.</li><li class=\"ql-align-justify\">Diabetic patients should NOT take anti-diabetic medicines, including insulin, on the appointment day. If fasting blood sugar is more than 200 mg/dL, kindly consult your physician and get it controlled, and it should be below 200 mg/dL on the day of the scan without taking any anti-diabetic medicine or insulin.</li class=\"ql-align-justify\">Please carry all previous medical records, i.e. doctors referral, reports of previous PET-CT, CT scan, MRI, biopsy etc. and the treatment records. Previously, if PET-CT is done, kindly carry CD to compare any changes since the last study.</class=><li class=\"ql-align-justify\">Avoid caffeine, alcohol, or drugs that may affect cerebral glucose metabolism.</li><li class=\"ql-align-justify\">Always try to reach 15 minutes before appointment time as the radiopharmaceutical (tracer) used for 18F-FDG PET-CT has a short half-life, and any delay may cause tracer decay, and you may be rescheduled for another day.</li><li class=\"ql-align-justify\">Please carry identification proof such as an Aadhar card, pan card etc.</li></ul><p class=\"ql-align-justify\"><br></p>'


      const testDetails2='<ul> <li class=\"ql-align-justify\">इस जाँच के लिए 4-6 घंटे के उपवास की आवश्यकता होती है।</li>\n    <li class=\"ql-align-justify\">सादा पानी पीने की अनुमति है और प्रोत्साहित किया जाता है। पेशाब रोकने की जरूरत नहीं है।</li>\n    <li class=\"ql-align-justify\">मधुमेह रोगियों को जाँच के दिन इंसुलिन सहित मधुमेह विरोधी दवाएं नहीं लेनी चाहिए। यदि आपका फास्टिंग ब्लड शुगर 200 mg/dL से अधिक है, तो कृपया अपने चिकित्सक से परामर्श करें और इसे नियंत्रित करें। स्कैन के दिन बिना कोई मधुमेह विरोधी दवा या इंसुलिन लिए, यह 200 मिलीग्राम/डीएल से कम होना चाहिए, ।</li>\n    <li class=\"ql-align-justify\">कृपया सभी पिछले मेडिकल रिकॉर्ड यानी डॉक्टर का रेफरल, पिछले पीईटी-सीटी, सीटी स्कैन, एमआरआई, यूएसजी, बायोप्सी आदि की रिपोर्ट और उपचार रिकॉर्ड साथ रखें। यदि पहले पीईटी-सीटी किया गया है, तो उसकी सीडी जरूर साथ ले आये अन्यथा पिछले अध्ययन से तुलनात्मक रिपोर्ट नहीं दी जाएगी।</li>\n    <li class=\"ql-align-justify\">कृपया हाल ही में सीरम क्रिएटिनिन रक्त परीक्षण रिपोर्ट साथ रखें। यदि पहले नहीं किया गया है, तो अतिरिक्त लागू शुल्क के साथ, यह केंद्र में किया जा सकता है। परिणाम आने के लिए आपको अतिरिक्त प्रतीक्षा करने की आवश्यकता नहीं है क्योंकि दोनों परीक्षण समानांतर रूप से चलते हैं।</li>\n    <li class=\"ql-align-justify\">यदि रोगी को कंट्रास्ट मीडिया से एलर्जी है, तो कृपया स्टाफ को सूचित करें।</li>\n    <li class=\"ql-align-justify\">रेडियोफार्मास्युटिकल्स का इंजेक्शन लगाने से पहले महिला रोगियों को अपनी गर्भावस्था या स्तनपान की स्थिति के बारे में सूचित करना चाहिए।</li>\n    <li class=\"ql-align-justify\">कैफीन, शराब या नशीली दवाओं से बचें जो मस्तिष्क ग्लूकोज चयापचय को प्रभावित कर सकती हैं।</li>\n    <li class=\"ql-align-justify\">हमेशा अपॉइंटमेंट समय से 15 मिनट पहले पहुंचने का प्रयास करें क्योंकि 18F-FDG PET-CT के लिए उपयोग किए जाने वाले रेडियोफार्मास्युटिकल (ट्रेसर) का हाफ-लाइफ छोटा होता है और किसी भी देरी से ट्रेसर का क्षय होकर समाप्त हो सकता है और आपको अगले उपलब्ध स्लॉट पर पुनर्निर्धारित किया जा सकता है।</li>\n    <li class=\"ql-align-justify\">कृपया आधार कार्ड, पैन कार्ड आदि जैसे पहचान प्रमाण साथ रखें।</li>\n</ul>\n,'



      const testRequirement1='"<p class=\"ql-align-justify\">18F-FDG Brain PET-CT is performed in many conditions such as Memory loss, difficulty in communicating or finding words, visual and spatial disabilities such as getting lost while driving, difficulty in reasoning or problem-solving, and difficulty handling complex tasks such as planning or organizing etc. This is also performed in neurologic disorder that causes the brain to shrink or death of brain cells and in the case of unintended or uncontrollable movements.</p><p class=\"ql-align-justify\"><br></p><h3 class=\"ql-align-justify\"><strong>Test information</strong></h3><ul><li class=\"ql-align-justify\">Fasting: 4-6 hours</li><li class=\"ql-align-justify\">Reporting:&nbsp;Within 2 hours*</li></ul>,'
  
      // Process each row in the cleaned data
      for (const row of cleanedData) {
        const testName = row[3];  // Test Name is in the 4th column (index 3)
        const baseRate = row[5];  // Base Rate is in the 6th column (index 5)
  
        // Skip rows with missing required fields
        if (!testName || !baseRate) {
          console.log("Skipping row due to missing data:", row);
          continue;
        }
  
        // Convert baseRate to a number
        const parsedBaseRate = parseFloat(baseRate);
  
        // Check if baseRate is a valid number
        if (isNaN(parsedBaseRate)) {
          console.log("Skipping row due to invalid Base Rate:", row);
          continue;
        }
  
        // Add new TestDetail entry
        const testDetail = new TestDetailModel({
          testDetailName: testName,
          testPrice: parsedBaseRate,
          testId, // Link to the test,
          category: validTest.testName,  // Assuming 'testName' is a field in TestModel
          testDetails1,
          testDetails2,
          testRequirement1
        });
  
        console.log("Created Test Detail:", testDetail);
  
        await testDetail.save();
  
        // Link the TestDetail with the TestModel
        validTest.testDetail.push(testDetail._id);
        addedTestDetails.push(testDetail);
      }
  
      // Save the updated TestModel
      await validTest.save();
  
      res.status(200).json({
        success: true,
        message: "Test details added successfully from Excel.",
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
    uploadTestDetailsInstru
}