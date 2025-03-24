import { Router } from "express";
import { isLoginAdmin, loginAdmin, logoutAdmin, registerAdmin } from "../controller/admin.controller.js";


const adminRouter=Router()


adminRouter.post("/",registerAdmin)
adminRouter.post("/login",loginAdmin)
adminRouter.post("/logout",logoutAdmin)
adminRouter.post("/isLogin",isLoginAdmin)


export default adminRouter