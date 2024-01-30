import { Router } from "express";
import { check } from "express-validator";
import {
  validarCampos,
  validarCorreoRepetido,
  validarUsuarioRepetido,
} from "../middlewares/validarCampos";
import { validarJWT } from "../middlewares/validarJWT";
import {
  changePassword,
  confirmRegister,
  login,
  recoveryPassword,
  register,
  testGet,
} from "../controllers/clientes";

const router = Router();
router.get("/testGet", testGet);
router.post(
  "/login",
  [
    check("correo", "No se ingresó correo").notEmpty(),
    check("clave", "No se ingresó clave").notEmpty(),
    validarCampos,
  ],
  login
);
router.post(
  "/register",
  [
    check("nombre", "No se ingresó nombre").notEmpty(),
    check("alias", "No se ingresó alias").notEmpty(),
    check("mail", "No se ingresó mail").notEmpty(),
    check("password", "No se ingresó password").notEmpty(),
    check("repassword", "No se ingresó repassword").notEmpty(),
    validarCorreoRepetido,
    validarUsuarioRepetido,
    validarCampos,
  ],
  register
);
router.post(
  "/confirmRegister",
  [check("seed", "No se ingresó seed").notEmpty(), validarJWT, validarCampos],
  confirmRegister
);
router.post(
  "/recoveryPassword",
  [check("mail", "No se ingresó mail").notEmpty(), validarCampos],
  recoveryPassword
);
router.post(
  "/changePassword",
  [
    check("password", "No se ingresó password").notEmpty(),
    check("repassword", "No se ingresó repassword").notEmpty(),
    validarJWT,
    validarCampos,
  ],
  changePassword
);
export default router;
