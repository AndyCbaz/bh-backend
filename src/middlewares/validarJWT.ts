import { Request, Response } from "express";
import { crdentl } from "../helpers/dbData";
const jwt = require("jsonwebtoken");
export const validarJWT = (req: Request | any, res: Response, next: any) => {
  const { token } = req.body;
  if (!token) {
    return res.status(401).json({
      errors: [{ msg: `petición no autorizada` }],
    });
  }
  try {
    const { id, idperfil, user } = jwt.verify(token, crdentl);
    req.body.idusuario = id;
    req.body.idperfil = idperfil;
    req.body.user = user;
  } catch (error) {
    return res.status(401).json({
      errors: [{ msg: `credencial no autorizada` }],
    });
  }
  next();
};
