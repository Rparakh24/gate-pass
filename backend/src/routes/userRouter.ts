import express, {Request, Response} from "express";
const router = express.Router();
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { signupVal } from "../lib/validators/userValidator";
import { signinVal } from "../lib/validators/userValidator";
import {JWT_SECRET} from "../config";
import uAuth from "../middleware/uAuth"
import { any } from "zod";
import nodemailer from "nodemailer";
import crypto from "crypto";
import {addHours} from "date-fns";
const generateToken = (length = 5): string => {
    return crypto.randomBytes(length).toString('hex'); // returns a hexadecimal token
  };
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
        return res.status(403).json({msg:"User already exist"});
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
router.post("/send",uAuth,async(req:Request,res:Response):Promise<any>=>{
    const userId = req.userId;
    const token = generateToken();
    const user = await prisma.user.update({
        where:{
            id:userId
        },
        data:{
            parentAuthToken:token,
            parentAuthExpireAt:addHours(new Date(),3)
        }
    })
    try{
    const transporter = nodemailer.createTransport({
    service:"gmail", 
    auth: {
        user: "parakhronit1212@gmail.com",
        pass: "yfox szgj fhlr lcce",
    },
    });
    async function send() {
    const info = await transporter.sendMail({
        from: '"<parakhronit1212@gmail.com>', 
        to: user?.parentEmail, 
        subject: "Authorise", 
        text: "Please authenticate your ward", 
        html: `<b>Click this link: <a href="http://localhost:3000/api/user/auth?token=${token}">Authenticate</a></b>`,
    });
    }
    send().catch(console.error);
    return res.status(200).json({msg:"Successfull"});}
    catch(e){
        return res.status(401).json({msg:"An error occured"});
    }
})

router.put("/auth",async(req:Request,res:Response):Promise<any>=>{
    const token : string = (req.query as { token: string }).token;
    console.log(token);
    try{
    const user = await prisma.user.findFirst({
        where:{
            parentAuthToken:token
        }
    })

    if(!user || !user.parentAuthExpireAt || user.parentAuthExpireAt < new Date()){
        return res.status(400).json({msg:"Invalid"});
    }
    const updatedUser = await prisma.user.update({
        where:{
            id:user.id
        },
        data:{
            parentAuthToken:null,
            parentAuthExpireAt:null,
            parentAuth:true
        }
    })
    return res.status(200).json({msg:"Successfull"});
    }
    catch(e){
        return res.status(400).json({msg:"An error occured"})
    }
})

export default router;

