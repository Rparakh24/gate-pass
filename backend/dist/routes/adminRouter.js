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
const adminValidator_1 = require("../lib/validators/adminValidator");
const adminValidator_2 = require("../lib/validators/adminValidator");
const aAuth_1 = __importDefault(require("../middleware/aAuth"));
const prisma = new client_1.PrismaClient();
router.post("/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const adminBody = req.body;
    const success = adminValidator_1.signupVal.safeParse(adminBody);
    if (!success.success) {
        return res.status(403).json({ "msg": "Wrong format" });
    }
    try {
        const admin = yield prisma.admin.create({
            data: adminBody
        });
        const token = jsonwebtoken_1.default.sign({ id: admin.id }, process.env.JWT_SECRET);
        res.status(200).json({ token: token });
    }
    catch (e) {
        return res.status(403).json({ msg: "admin already exist" });
    }
}));
router.post("/signin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const signinBody = req.body;
    const success = adminValidator_2.signinVal.safeParse(signinBody);
    if (!success.success) {
        return res.status(403).json({ msg: "Invalid Input" });
    }
    try {
        const admin = yield prisma.admin.findFirst({
            where: {
                email: signinBody.email,
                password: signinBody.password
            }
        });
        if (!admin) {
            return res.status(401).json({ msg: "admin does not exist" });
        }
        const token = jsonwebtoken_1.default.sign({ id: admin.id }, process.env.JWT_SECRET);
        res.status(200).json({ msg: "Signin Success", token: token });
    }
    catch (e) {
    }
}));
router.get("/getAll", aAuth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const users = yield prisma.user.findMany({
        where: {
            parentAuth: true,
            adminAuth: false
        },
        select: {
            id: true,
            name: true,
            email: true
        }
    });
    if (!users) {
        return res.status(400).json({ msg: "Error occured while fetching admins" });
    }
    return res.status(200).json({ users: users });
}));
router.put("/allow", aAuth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = req.query.id;
    if (!userId) {
        return res.status(403).json({ msg: "Id Invalid or null" });
    }
    try {
        const allowedusers = yield prisma.user.update({
            where: {
                id: Number(userId)
            },
            data: {
                adminAuth: true
            }
        });
        return res.status(200).json({ msg: "Successfull" });
    }
    catch (e) {
        return res.status(400).json({ msg: "An error occured" });
    }
}));
exports.default = router;
