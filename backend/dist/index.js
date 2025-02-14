"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const router = express_1.default.Router();
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
const adminRouter_1 = __importDefault(require("./routes/adminRouter"));
const userRouter_1 = __importDefault(require("./routes/userRouter"));
const guardRouter_1 = __importDefault(require("./routes/guardRouter"));
app.use("/api/admin", adminRouter_1.default);
app.use("/api/user", userRouter_1.default);
app.use("/api/guard", guardRouter_1.default);
app.listen("3000", () => {
    console.log("The server is running on 3000");
});
