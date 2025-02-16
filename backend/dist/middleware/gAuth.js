"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
function gAuth(req, res, next) {
    try {
        const auth = req.headers.authorization || "";
        const x = auth.split(" ");
        const token = x[1];
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        if (!decoded) {
            res.status(403).json({ e: "eror" });
            return;
        }
        req.guardId = decoded.id;
        console.log(req.guardId);
        next();
    }
    catch (e) {
        res.status(403).json({ e: e });
        return;
    }
}
exports.default = gAuth;
