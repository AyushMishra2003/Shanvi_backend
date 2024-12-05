import { model, Schema } from "mongoose";



const BlogSchema=new Schema(
    {
        blogName:{
            type:String
        },
        blogDetail:{
            type:String
        },
        blogPhoto: {
            public_id: {
              type: String,
              default: '',
            },
            secure_url: {
              type: String,
              default: '',
            },
          },
    },
    {
        timestamps:true
    }
)



const BlogModel=model("Blog_Model",BlogSchema)


export default BlogModel