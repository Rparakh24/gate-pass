import { hostname } from "os";
import z from "zod";

export const signupVal = z.object({
    name: z.string(),
    email:z.string().email(),
    parentEmail : z.string().email(),
    password : z.string(),
    rollno : z.string(),
    hostelName : z.string(),
})

export const signinVal = z.object({
    email:z.string(),
    password : z.string()
})

// model User{
//     id Int @id @default(autoincrement())
//     name String
//     email String @unique
//     parentEmail String
//     password String
//     rollno String
//     hostelName String
//     parentAuth Boolean @default(false)
//     adminAuth Boolean  @default(false)
//   }