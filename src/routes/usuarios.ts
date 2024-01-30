import { Router } from "express";
import { check } from "express-validator";
import {
  validarCampos,
} from "../middlewares/validarCampos";

import { login, testGet } from "../controllers/usuarios";
const router = Router();
router.get("/testGet", testGet);
router.post(
  "/register",
  [
    check("correo", "No se ingresó correo").notEmpty(),
    check("clave", "No se ingresó clave").notEmpty(),
    validarCampos,
  ],
  login
);
router.post(
  "/login",
  [
    check("correo", "No se ingresó correo").notEmpty(),
    check("clave", "No se ingresó clave").notEmpty(),
    validarCampos,
  ],
  login
);
export default router;
