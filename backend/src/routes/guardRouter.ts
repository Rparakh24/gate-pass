import express, {Request, Response} from "express";
const router = express.Router();
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { signupVal } from "../lib/validators/guardValidator";
import { signinVal } from "../lib/validators/guardValidator";
import gAuth from "../middleware/gAuth"

const prisma = new PrismaClient();
router.post("/signup",async(req:Request,res:Response):Promise<any>=>{
    const guardBody = req.body;
    const success = signupVal.safeParse(guardBody);
    if(!success.success){
        return res.status(403).json({"msg":"Wrong format"});
    }
    try{
        const guard  = await prisma.guard.create({
            data:guardBody}
        );
        const token = jwt.sign({id:guard.id},process.env.JWT_SECRET as string );
        res.status(200).json({token:token});
    
    }catch(e){
        return res.status(403).json({msg:"guard already exist"});
    }
    
})
router.post("/signin",async(req:Request,res:Response):Promise<any>=>{
    const signinBody = req.body;
    const success = signinVal.safeParse(signinBody);
    if(!success.success){
        return res.status(403).json({msg:"Invalid Input"})
    }
    try{
        const guard = await prisma.guard.findFirst({
            where:{
                email:signinBody.email,
                password:signinBody.password
            }
        })
        if(!guard){
            return res.status(401).json({msg:"guard does not exist"});
        }
        const token = jwt.sign({id:guard.id},process.env.JWT_SECRET as string);
        res.status(200).json({msg:"Signin Success",token:token});
    }catch(e){
        
    }
})

router.put("/done",gAuth,async(req:Request,res:Response):Promise<any>=>{
    const id = req.query.id;
    try{
    const user = await prisma.user.update({
        where:{
            id:Number(id)
        },
        data:{
            parentAuth:false,
            adminAuth:false
        }
        
    })
        return res.status(200).json({msg:"Done"});
    }catch(e){
        return res.status(400).json({msg:"An error occured"});
    }
})

export default router;