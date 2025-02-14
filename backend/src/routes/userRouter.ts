import express, {Request, Response} from "express";
const router = express.Router();
import jwt from "jsonwebtoken";
import z from "zod";
import { PrismaClient } from "@prisma/client";
import { signupVal } from "../lib/validators/userValidator";
import { signinVal } from "../lib/validators/userValidator";

router.post("/signup",async(req:Request,res:Response):Promise<any>=>{
    const user = req.body;
    const success = signupVal.safeParse(user);
    if(!success.success){
        return res.status(403).json({"msg":"Wrong format"});
    }
    
    
    
})


export default router;

