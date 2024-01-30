import { crdentl, expiredTk } from "../helpers/dbData";
import { Request, Response } from "express";
import db_general from "../mysql/mysql_db_general";
var jwt = require("jsonwebtoken");
const createPassword = (e: String) => {
  var md5 = require("md5");
  let answer = md5(e);
  answer = answer.substring(2, answer.length - 1);
  answer = "".concat(
    "A",
    answer.substring(3, 6),
    "Z",
    answer.substring(7, answer.length - 1)
  );
  return answer;
};
export const login = async (req: Request, res: Response) => {
  const { correo, clave } = req.body;
  let dataLogin: any;
  let tokenAcess: any;
  var newcode = createPassword(clave);
  try {
    dataLogin = await db_general.query(
      `SELECT nombre, alias, correo, idperfil, password FROM usuarios where correo='${correo}';`
    );
    if (dataLogin[0].length === 0) {
      return res.status(400).json({
        errors: [
          {
            msg: `Credenciales no válidas`,
          },
        ],
      });
    }
    if (newcode != dataLogin[0][0]["password"]) {
      return res.status(400).json({
        errors: [
          {
            msg: `Credenciales no válidas`,
          },
        ],
      });
    }
    tokenAcess = await jwt.sign(
      { id: dataLogin[0][0]["idusuario"], user: dataLogin[0][0]["alias"] },
      crdentl,
      {
        expiresIn: expiredTk,
      }
    );
  } catch (error) {
    res.status(500).json({
      data: `Error en el proceso login usuario por parte del servidor`,
    });
  }
  res.status(200).json({
    data: {
      msg: {
        tokenAcess,
        idusuario: dataLogin[0][0]["idusuario"],
        nombre: dataLogin[0][0]["nombre"],
        alias: dataLogin[0][0]["usuario"],
        correo: dataLogin[0][0]["correo"],
        idperfil: dataLogin[0][0]["idperfil"],
      },
    },
  });
};
export const testGet = async (req: Request, res: Response) => {
  res.status(200).json({
    data: {
      msg: {
        pyload: "all is fine",
      },
    },
  });
};
