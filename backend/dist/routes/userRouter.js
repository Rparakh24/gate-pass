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
const config_1 = require("../config");
const uAuth_1 = __importDefault(require("../middleware/uAuth"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const crypto_1 = __importDefault(require("crypto"));
const date_fns_1 = require("date-fns");
const generateToken = (length = 5) => {
    return crypto_1.default.randomBytes(length).toString('hex'); // returns a hexadecimal token
};
const prisma = new client_1.PrismaClient();
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
    const userId = req.userId;
    const token = generateToken();
    const user = yield prisma.user.update({
        where: {
            id: userId
        },
        data: {
            parentAuthToken: token,
            parentAuthExpireAt: (0, date_fns_1.addHours)(new Date(), 3)
        }
    });
    try {
        const transporter = nodemailer_1.default.createTransport({
            service: "gmail",
            auth: {
                user: "parakhronit1212@gmail.com",
                pass: "yfox szgj fhlr lcce",
            },
        });
        function send() {
            return __awaiter(this, void 0, void 0, function* () {
                const info = yield transporter.sendMail({
                    from: '"<parakhronit1212@gmail.com>',
                    to: user === null || user === void 0 ? void 0 : user.parentEmail,
                    subject: "Authorise",
                    text: "Please authenticate your ward",
                    html: `<b>Click this link: <a href="http://localhost:3000/api/user/auth?token=${token}">Authenticate</a></b>`,
                });
            });
        }
        send().catch(console.error);
        return res.status(200).json({ msg: "Successfull" });
    }
    catch (e) {
        return res.status(401).json({ msg: "An error occured" });
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
