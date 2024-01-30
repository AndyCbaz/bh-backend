const { validationResult } = require("express-validator");
import db_general from "../mysql/mysql_db_general";
export const validarCampos = (req: any, res: any, next: any) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json(errors);
  }
  next();
};
export const validarCorreoRepetido: any = async (
  req: any,
  res: any,
  next: any
) => {
  const { mail } = req.body;
  let payload: any;
  try {
    payload = await db_general.query(`
      select count(*) as count from clientes where correo='${mail}' and estado=1;
      `);
    if (payload[0][0]["count"] != 0) {
      return res.status(400).json({
        errors: [
          {
            msg: `El correo: ${mail} ya está registrado`,
          },
        ],
      });
    }
  } catch (error) {
    res.status(500).json({
      data: `Error en el proceso infoUserMail por parte del servidor`,
    });
  }
  next();
};
export const validarUsuarioRepetido: any = async (
  req: any,
  res: any,
  next: any
) => {
  const { alias } = req.body;

  let payload: any;
  try {
    payload = await db_general.query(`
      select count(*) as count from clientes where alias='${alias}' and estado=1;
      `);
    3;
    if (payload[0][0]["count"] != 0) {
      return res.status(400).json({
        errors: [
          {
            msg: `El nombre: ${alias} ya está registrado`,
          },
        ],
      });
    }
  } catch (error) {
    res.status(500).json({
      data: `Error en el proceso infoUserMail por parte del servidor`,
    });
  }
  next();
};
module.exports = {
  validarCampos,
  validarCorreoRepetido,
  validarUsuarioRepetido,
};
