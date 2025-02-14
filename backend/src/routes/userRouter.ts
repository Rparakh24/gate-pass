import express, {Request, Response} from "express";
const router = express.Router();
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { signupVal } from "../lib/validators/userValidator";
import { signinVal } from "../lib/validators/userValidator";
import {JWT_SECRET} from "../config";
const prisma = new PrismaClient();
router.post("/signup",async(req:Request,res:Response):Promise<any>=>{
    const userBody = req.body;
    const success = signupVal.safeParse(userBody);
    if(!success.success){
        return res.status(403).json({"msg":"Wrong format"});
    }
    try{
        const user  = await prisma.user.create({
            data:userBody}
        );
        const token = jwt.sign({id:user.id}, JWT_SECRET);
        res.status(200).json({token:token});
    
    }catch(e){
        return res.status(403).json({msg:"Wrong format"});
    }
    
})
router.post("/signin",async(req:Request,res:Response):Promise<any>=>{
    const signinBody = req.body;
    const success = signinVal.safeParse(signinBody);
    if(!success.success){
        return res.status(403).json({msg:"Invalid Input"})
    }
    try{
        const user = await prisma.user.findFirst({
            where:{
                email:signinBody.email,
                password:signinBody.password
            }
        })
        if(!user){
            return res.status(401).json({msg:"User does not exist"});
        }
        const token = jwt.sign({id:user.id},JWT_SECRET);
        res.status(200).json({msg:"Signin Success",token:token});
    }catch(e){
        
    }
})

export default router;

