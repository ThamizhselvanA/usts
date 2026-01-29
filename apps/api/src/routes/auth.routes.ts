import { Router } from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { register, login, refresh, me, logout } from "../controllers/auth.controller.js";

const r = Router();
r.post("/register", asyncHandler(register));
r.post("/login", asyncHandler(login));
r.post("/refresh", asyncHandler(refresh));
r.post("/logout", asyncHandler(logout));
export default r;
