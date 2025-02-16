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
const guardValidator_1 = require("../lib/validators/guardValidator");
const guardValidator_2 = require("../lib/validators/guardValidator");
const gAuth_1 = __importDefault(require("../middleware/gAuth"));
const prisma = new client_1.PrismaClient();
router.post("/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const guardBody = req.body;
    const success = guardValidator_1.signupVal.safeParse(guardBody);
    if (!success.success) {
        return res.status(403).json({ "msg": "Wrong format" });
    }
    try {
        const guard = yield prisma.guard.create({
            data: guardBody
        });
        const token = jsonwebtoken_1.default.sign({ id: guard.id }, process.env.JWT_SECRET);
        res.status(200).json({ token: token });
    }
    catch (e) {
        return res.status(403).json({ msg: "guard already exist" });
    }
}));
router.post("/signin", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const signinBody = req.body;
    const success = guardValidator_2.signinVal.safeParse(signinBody);
    if (!success.success) {
        return res.status(403).json({ msg: "Invalid Input" });
    }
    try {
        const guard = yield prisma.guard.findFirst({
            where: {
                email: signinBody.email,
                password: signinBody.password
            }
        });
        if (!guard) {
            return res.status(401).json({ msg: "guard does not exist" });
        }
        const token = jsonwebtoken_1.default.sign({ id: guard.id }, process.env.JWT_SECRET);
        res.status(200).json({ msg: "Signin Success", token: token });
    }
    catch (e) {
    }
}));
router.put("/done", gAuth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const id = req.query.id;
    try {
        const user = yield prisma.user.update({
            where: {
                id: Number(id)
            },
            data: {
                parentAuth: false,
                adminAuth: false
            }
        });
        return res.status(200).json({ msg: "Done" });
    }
    catch (e) {
        return res.status(400).json({ msg: "An error occured" });
    }
}));
exports.default = router;
