"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signinVal = exports.signupVal = void 0;
const zod_1 = __importDefault(require("zod"));
exports.signupVal = zod_1.default.object({
    name: zod_1.default.string(),
    email: zod_1.default.string().email(),
    password: zod_1.default.string(),
});
exports.signinVal = zod_1.default.object({
    email: zod_1.default.string(),
    password: zod_1.default.string()
});
// model Guard{
//     id Int @id @default(autoincrement())
//     name String
//     email String @unique
//     password String
//   }
