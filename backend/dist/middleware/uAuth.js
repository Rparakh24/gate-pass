"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("../config");
function uAuth(req, res, next) {
    try {
        const auth = req.headers.authorization || "";
        const x = auth.split(" ");
        const token = x[1];
        const decoded = jsonwebtoken_1.default.verify(token, config_1.JWT_SECRET);
        if (!decoded) {
            res.status(403).json({ e: "eror" });
            return;
        }
        req.userId = decoded.id;
        console.log(req.userId);
        next();
    }
    catch (e) {
        res.status(403).json({ e: e });
        return;
    }
}
exports.default = uAuth;
