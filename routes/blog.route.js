import { Router } from "express";
import { addBlog, deleteBlog, editBlog, getAllBlogs } from "../controller/Blog.controller.js";
import upload from "../middleware/multer.middleware.js";

const blogRoute=Router()


blogRoute.post("/",upload.single("blogPhoto"),addBlog)
blogRoute.get("/",getAllBlogs)
blogRoute.put("/:id",upload.single("blogPhoto"),editBlog)
blogRoute.delete("/:id",deleteBlog)


export default blogRoute