import BlogModel from "../models/Blog.model.js"
import AppError from "../utils/error.utlis.js"
import cloudinary from "cloudinary";
import fs from "fs/promises";

const addBlog=async(req,res,next)=>{
    try{
      const {blogName, blogDetail}=req.body


      console.log(req.body);
      
  
      if(!blogName || !blogDetail){
          return next(new AppError("All field are Required",400))
      }
  
      const addBlog=new BlogModel({
          blogName,
          blogDetail,
          blogPhoto:{
              public_id:"",
              secure_url:""
          },
      })
  
      if(!addBlog){
          return next(new AppError("Blog not Added Succesfully",400))
      }
  
      if (req.file) {
          const result = await cloudinary.v2.uploader.upload(req.file.path, {
            folder: "lms",
          });
  
          console.log(result);
          
          if (result) {
            (addBlog.blogPhoto.public_id = result.public_id),
              (addBlog.blogPhoto.secure_url = result.secure_url);
          }
          fs.rm(`uploads/${req.file.filename}`);
      }
  
      await addBlog.save()
  
      res.status(200).json({
          success:true,
          message:"Adding Blog Detail",
          data:addBlog
      })
  
    }catch(error){
      return next(new AppError(error.message,500))
    }
  }

  const editBlog = async (req, res, next) => {
    try {
      const { id } = req.params;
      const { blogName, blogDetail } = req.body;

      
  
      if (!blogName && !blogDetail && !req.file) {
        return next(new AppError("No fields provided for update", 400));
      }
  
      const blog = await BlogModel.findById(id);
  
      if (!blog) {
        return next(new AppError("Blog not found", 404));
      }
  
      if (blogName) blog.blogName = blogName;
      if (blogDetail) blog.blogDetail = blogDetail;
  
      if (req.file) {
        const result = await cloudinary.v2.uploader.upload(req.file.path, {
          folder: "lms",
        });
  
        if (result) {
          // Delete the old blog photo from Cloudinary
          if (blog.blogPhoto.public_id) {
            await cloudinary.v2.uploader.destroy(blog.blogPhoto.public_id);
          }
  
          blog.blogPhoto.public_id = result.public_id;
          blog.blogPhoto.secure_url = result.secure_url;
        }
        fs.rm(`uploads/${req.file.filename}`);
      }
  
      await blog.save();
      
      console.log(blog);
      
  
      res.status(200).json({
        success: true,
        message: "Blog details updated successfully",
        data: blog,
      });
    } catch (error) {
      return next(new AppError(error.message, 500));
    }
  };

  
  const deleteBlog = async (req, res, next) => {
    try {
      const { id } = req.params;
  
      const blog = await BlogModel.findById(id);
  
      if (!blog) {
        return next(new AppError("Blog not found", 404));
      }
  
      // Remove blog photo from Cloudinary
      if (blog.blogPhoto.public_id) {
        await cloudinary.v2.uploader.destroy(blog.blogPhoto.public_id);
      }
  
      await BlogModel.findByIdAndDelete(id);
  
      res.status(200).json({
        success: true,
        message: "Blog deleted successfully",
      });
    } catch (error) {
      return next(new AppError(error.message, 500));
    }
  };

  

  const getAllBlogs = async (req, res, next) => {
    try {
      const blogs = await BlogModel.find();
  
      res.status(200).json({
        success: true,
        message: "Blogs fetched successfully",
        data: blogs,
      });
    } catch (error) {
      return next(new AppError(error.message, 500));
    }
  };
  


  export {
    addBlog,
    getAllBlogs,
    editBlog,
    deleteBlog
  }