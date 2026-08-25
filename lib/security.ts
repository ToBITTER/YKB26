import crypto from "node:crypto";import bcrypt from "bcryptjs";
export const hashPassword=(password:string)=>bcrypt.hash(password,12);
export const verifyPassword=(password:string,hash:string)=>bcrypt.compare(password,hash);
export const hashSessionToken=(token:string)=>crypto.createHash("sha256").update(token).digest("hex");

