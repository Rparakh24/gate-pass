"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const router = express_1.default.Router();
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const userValidator_1 = require("../lib/validators/userValidator");
const userValidator_2 = require("../lib/validators/userValidator");
const userValidator_3 = require("../lib/validators/userValidator");
const config_1 = require("../config");
const uAuth_1 = __importDefault(require("../middleware/uAuth"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const crypto_1 = __importDefault(require("crypto"));
const date_fns_1 = require("date-fns");
const transporter = nodemailer_1.default.createTransport({
    service: "gmail",
    auth: {
        user: process.env.email,
        pass: process.env.password,
    },
});
const generateToken = (length = 5) => {
    return crypto_1.default.randomBytes(length).toString('hex'); // returns a hexadecimal token
};
const prisma = new client_1.PrismaClient();
router.get("/me", uAuth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.userId;
    const user = yield prisma.user.findFirst({
        where: {
            id: userId
        },
        select: {
            id: true,
            name: true,
            parentAuth: true,
            adminAuth: true,
            parentAuthToken: true,
            rollno: true
        }
    });
    return res.json({ id: user === null || user === void 0 ? void 0 : user.id, name: user === null || user === void 0 ? void 0 : user.name, rollno: user === null || user === void 0 ? void 0 : user.rollno, parentAuth: user === null || user === void 0 ? void 0 : user.parentAuth, adminAuth: user === null || user === void 0 ? void 0 : user.adminAuth, parentAuthToken: user === null || user === void 0 ? void 0 : user.parentAuthToken });
}));
router.post("/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userBody = req.body;
    const success = userValidator_1.signupVal.safeParse(userBody);
    if (!success.success) {
        return res.status(403).json({ "msg": "Wrong format" });
    }
    try {
        const user = yield prisma.user.create({
            data: userBody
        });
        const token = jsonwebtoken_1.default.sign({ id: user.id }, config_1.JWT_SECRET);
        res.status(200).json({ token: token });
    }
    catch (e) {
        return res.status(403).json({ msg: "User already exist" });
    }
}));
router.post("/signin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const signinBody = req.body;
    const success = userValidator_2.signinVal.safeParse(signinBody);
    if (!success.success) {
        return res.status(403).json({ msg: "Invalid Input" });
    }
    try {
        const user = yield prisma.user.findFirst({
            where: {
                email: signinBody.email,
                password: signinBody.password
            }
        });
        if (!user) {
            return res.status(401).json({ msg: "User does not exist" });
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id }, config_1.JWT_SECRET);
        res.status(200).json({ msg: "Signin Success", token: token });
    }
    catch (e) {
    }
}));
router.post("/send", uAuth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const body = req.body;
    console.log(body);
    const check = userValidator_3.userMail.safeParse(body);
    console.log(check);
    if (!check.success) {
        return res.status(400).json({ error: "Invalid input" });
    }
    const parentEmail = yield prisma.user.update({
        where: {
            id: req.userId,
        },
        data: {
            parentAuthToken: crypto_1.default.randomBytes(3).toString("hex"),
            parentAuthExpireAt: (0, date_fns_1.addHours)(new Date(), 3),
        },
        select: {
            parentAuthToken: true,
            parentEmail: true,
        },
    });
    const link = `http://localhost:5173/auth?token=${parentEmail === null || parentEmail === void 0 ? void 0 : parentEmail.parentAuthToken}`;
    try {
        yield transporter.sendMail({
            from: process.env.EMAIL,
            to: parentEmail === null || parentEmail === void 0 ? void 0 : parentEmail.parentEmail,
            subject: "Authentication Request",
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 10px; padding: 20px; background-color: #f9f9f9;">
          <h2 style="text-align: center; color: #333;">Leave Authentication Request</h2>
          <p style="font-size: 16px; color: #555;">Your ward has requested leave authentication. Here are the details:</p>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd;"><strong>From Date:</strong></td>
              <td style="padding: 10px; border: 1px solid #ddd;">${body.from}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd;"><strong>To Date:</strong></td>
              <td style="padding: 10px; border: 1px solid #ddd;">${body.to}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd;"><strong>Place to Go:</strong></td>
              <td style="padding: 10px; border: 1px solid #ddd;">${body.place}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd;"><strong>Reason:</strong></td>
              <td style="padding: 10px; border: 1px solid #ddd;">${body.reason}</td>
            </tr>
          </table>
          <div style="text-align: center; margin-top: 20px;">
            <a href="${link}" style="background-color: #007bff; color: white; padding: 12px 24px; border-radius: 5px; text-decoration: none; font-size: 16px;">
              Authenticate Now
            </a>
          </div>
          <p style="font-size: 14px; color: #888; text-align: center; margin-top: 20px;">If you did not request this, please ignore this email.</p>
        </div>
      `,
        });
        return res.json({ message: "Mail sent" });
    }
    catch (e) {
        return res.status(400).json({ error: e, message: "Mail not sent" });
    }
}));
router.put("/auth", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const token = req.query.token;
    console.log(token);
    try {
        const user = yield prisma.user.findFirst({
            where: {
                parentAuthToken: token
            }
        });
        if (!user || !user.parentAuthExpireAt || user.parentAuthExpireAt < new Date()) {
            return res.status(400).json({ msg: "Invalid" });
        }
        const updatedUser = yield prisma.user.update({
            where: {
                id: user.id
            },
            data: {
                parentAuthToken: null,
                parentAuthExpireAt: null,
                parentAuth: true
            }
        });
        return res.status(200).json({ msg: "Successfull" });
    }
    catch (e) {
        return res.status(400).json({ msg: "An error occured" });
    }
}));
exports.default = router;
