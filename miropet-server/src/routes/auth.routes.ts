import { Router } from "express";
import { login, register } from "../controllers/auth.controller";
import {
  validateLogin,
  validateRegister,
} from "../middleware/validation.middleware";

const router = Router();

// POST /api/auth/register
router.post("/register", validateRegister, register);

// POST /api/auth/login
router.post("/login", validateLogin, login);

export default router;
