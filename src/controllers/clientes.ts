import { crdentl, expiredTk } from "../helpers/dbData";
import { Request, Response } from "express";
import { transporter } from "../hooks/mailer";
import db_general from "../mysql/mysql_db_general";
import mailHelpers from "../helpers/mail/mailHelpers";
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
const createCodigoReferido = (e: String) => {
  var md5 = require("md5");
  let answer = md5(e);
  answer = answer.substring(3, answer.length - 1);
  answer = "".concat(
    e.substring(0, 3),
    String(Math.floor(Math.random() * 100)),
    answer.substring(7, 11)
  );
  return answer;
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
export const login = async (req: Request, res: Response) => {
  const { correo, clave } = req.body;
  let dataLogin: any;
  let tokenAcess: any;
  var newcode = createPassword(clave);
  try {
    dataLogin = await db_general.query(
      `SELECT idcliente, cliente, alias, correo, idperfil, password, referido, idtipoSuscripcion FROM amazonFlex.clientes where correo='${correo}';`
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
            msg: `Credenciales no válidas22`,
          },
        ],
      });
    }
    tokenAcess = await jwt.sign(
      { id: dataLogin[0][0]["idcliente"], user: dataLogin[0][0]["alias"] },
      crdentl,
      {
        expiresIn: expiredTk,
      }
    );
  } catch (error) {
    res.status(500).json({
      data: `Error en el proceso login cliente por parte del servidor`,
    });
  }
  res.status(200).json({
    data: {
      msg: {
        tokenAcess,
        idcliente: dataLogin[0][0]["idcliente"],
        cliente: dataLogin[0][0]["cliente"],
        alias: dataLogin[0][0]["alias"],
        correo: dataLogin[0][0]["correo"],
        idperfil: dataLogin[0][0]["idperfil"],
      },
    },
  });
};
export const register = async (req: Request, res: Response) => {
  const { nombre, alias, mail, password, repassword, referido } = req.body;
  let textoMail = ``;
  let notificacion = 1;
  let respuesta = ``;
  let link: any = `http://159.223.142.105/auth/verify_email/`;
  let volatil = `789`;
  if (password != repassword) {
    return res.status(400).json({
      errors: [{ msg: `Las contraseñas no coinciden` }],
    });
  }
  var newcodigoReferido = createCodigoReferido(alias);
  var newcode = createPassword(password);
  try {
    let payload = await db_general.query(`
    INSERT INTO \`clientes\` (
      \`cliente\`, \`alias\`, \`estado\`,
      \`correo\`, \`idperfil\`, 
      \`password\`, \`codigoReferido\`
      ${referido != undefined ? ",`referido`" : ``}, 
      \`idtipoSuscripcion\`) VALUES (
        '${nombre}', '${alias}', '0',
        '${mail}', '4',
        '${newcode}','${newcodigoReferido}'
        ${referido != undefined ? `,'${referido}'` : ``}
        ,'0'
      );
    `);
    volatil = await jwt.sign({ id: payload[0] }, crdentl, {
      expiresIn: "5m",
    });
  } catch (error) {
    res.status(500).json({
      data: `Error en el proceso register por parte del servidor`,
    });
  }
  if (notificacion === 1) {
    respuesta = `Block Hunt - Account verification`;
    textoMail = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Verify Your Email Address</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            background-color: #f7f7f7;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border: 1px solid #e0e0e0;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          .logo {
            display: block;
            margin: 0 auto;
            max-width: 200px;
          }
          
          h1 {
            color: #F26F1D;
            font-size: 24px;
            margin: 20px 0;
            text-align: center;
          }
          
          p {
            font-size: 16px;
            margin: 20px 0;
            text-align: left;
          }
          
          .button {
            display: inline-block;
            background-color: #000000 !important;
            color: #ffffff !important;
            padding: 10px 20px;
            text-decoration: none;
            border-radius: 4px;
          }
        </style>
      </head>
      <body>
        <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0">
          <tr>
            <td align="center" bgcolor="#f7f7f7" style="padding: 20px;">
              <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="max-width: 600px;">
                <tr>
                  <td align="center" bgcolor="#ffffff" style="padding: 20px; border: 1px solid #e0e0e0; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
                    <img class="logo" src="https://res.cloudinary.com/dclbjyyfn/image/upload/v1686524976/BlockHunt/Logo/logo_fkgbib.png" alt="Company Logo">
                    <h1 style="text-align: center;">Verify Your Email Address</h1>
                    <p>Hello ${nombre},</p>
                    <p>Thanks for your interest in creating an Block Hunt account. To create your account, please verify your email address by clicking the button below.</p>
                    <a href="${link}${volatil}" target="_blank" class="button">Verify email</a>
                    <p></p>
                    <p></p>
                    <p>Thanks,</p>
                    <p>Block Hunt Team</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
      `;
  }
  await transporter.sendMail({
    from: `${mailHelpers.user}`,
    to: mail,
    subject: respuesta,
    html: textoMail,
  });
  res.status(200).json({
    data: {
      msg: `Cliente notificado para completar registro`,
    },
  });
};
export const confirmRegister = async (req: Request, res: Response) => {
  const { seed, token, idusuario } = req.body;
  let textoMail = ``;
  let notificacion = 1;
  let respuesta = ``;
  let link: any = `https://www.google.com.ec/`;
  let volatil = `789`;
  if (seed != "myBrocker!$*") {
    return res.status(400).json({
      errors: [{ msg: `Ruta no autorizada !` }],
    });
  }
  let registroPrevio: any =
    await db_general.query(`select count(*) as count from clientes where 
  correo=( select correo from clientes where idcliente=${idusuario}) and idcliente!=${idusuario} and estado=1;`);
  if (registroPrevio[0][0]["count"] != 0) {
    return res.status(400).json({
      errors: [{ msg: `EL correo ya se encuentra registrado en otra cuenta` }],
    });
  }
  try {
    await db_general.query(`
      UPDATE \`clientes\` SET \`estado\` = '1' WHERE (\`idcliente\` = '${idusuario}');
    `);
  } catch (error) {
    res.status(500).json({
      data: `Error en el proceso validar registro por parte del servidor`,
    });
  }
  res.status(200).json({
    data: {
      msg: {
        idCliente: idusuario,
        status: `Registro confirmado`,
      },
    },
  });
};
export const recoveryPassword = async (req: Request, res: Response) => {
  const { mail } = req.body;
  let textoMail = ``;
  let notificacion = 1;
  let respuesta = ``;
  let link: any = `http://159.223.142.105/auth/reset_password/`;
  let volatil = `789`;
  let id: any;
  let nombre: any;
  let existeMail: any = await db_general.query(
    `select count(*) as count from clientes where correo='${mail}' and estado=1 limit 1;`
  );
  if (existeMail[0][0]["count"] === 0) {
    return res.status(400).json({
      errors: [{ msg: `No existe un cliente con correo: ${mail}` }],
    });
  } else {
    let idPayload: any = await db_general.query(
      `select idcliente, alias from clientes where correo='${mail}' and estado=1 limit 1;`
    );
    id = idPayload[0][0]["idcliente"];
    nombre = idPayload[0][0]["alias"];
  }
  try {
    volatil = await jwt.sign({ id: id }, crdentl, {
      expiresIn: "15m",
    });
  } catch (error) {
    res.status(500).json({
      data: `Error en el proceso recuperar password por parte del servidor`,
    });
  }
  if (notificacion === 1) {
    //todo enviar correo
    respuesta = `Block Hunt - Account recovery`;
    textoMail = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Verify Your Email Address</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              background-color: #f7f7f7;
              margin: 0;
              padding: 0;
            }
            
            .container {
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff;
              border: 1px solid #e0e0e0;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            
            .logo {
              display: block;
              margin: 0 auto;
              max-width: 200px;
            }
            
            h1 {
              color: #F26F1D;
              font-size: 24px;
              margin: 20px 0;
              text-align: center;
            }
            
            p {
              font-size: 16px;
              margin: 20px 0;
              text-align: left;
            }
            
            .button {
              display: inline-block;
              background-color: #000000 !important;
              color: #ffffff !important;
              padding: 10px 20px;
              text-decoration: none;
              border-radius: 4px;
            }
          </style>
        </head>
        <body>
          <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0">
            <tr>
              <td align="center" bgcolor="#f7f7f7" style="padding: 20px;">
                <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="max-width: 600px;">
                  <tr>
                    <td align="center" bgcolor="#ffffff" style="padding: 20px; border: 1px solid #e0e0e0; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);">
                      <img class="logo" src="https://res.cloudinary.com/dclbjyyfn/image/upload/v1686524976/BlockHunt/Logo/logo_fkgbib.png" alt="Company Logo">
                      <h1 style="text-align: center;">Account Recovery</h1>
                      <p>Hello ${nombre},</p>
                      <p>To recover your password, press the Reset Password button, this link has a lifespan of 5 minutes, if you believe that this message is an error, notify us by email: pending@mail.com</p>
                      <a href="${link}${volatil}" target="_blank" class="button">Reset Password</a>
                      <p></p>
                      <p></p>
                      <p>Thanks,</p>
                      <p>Block Hunt Team</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
        `;
  }
  await transporter.sendMail({
    from: `${mailHelpers.user}`,
    to: mail,
    subject: respuesta,
    html: textoMail,
  });
  res.status(200).json({
    data: {
      msg: `Cliente notificado para recuperar contraseña`,
    },
  });
};
export const changePassword = async (req: Request, res: Response) => {
  const { token, idusuario, password, repassword } = req.body;
  if (password != repassword) {
    return res.status(400).json({
      errors: [{ msg: `Las contraseñas no coinciden` }],
    });
  }
  var newcode = createPassword(password);
  try {
    let payload = await db_general.query(`
        UPDATE \`clientes\` SET \`password\` = '${newcode}' WHERE (\`idcliente\` = '${idusuario}');
      `);
  } catch (error) {
    res.status(500).json({
      data: `Error en el proceso cambiar password por parte del servidor`,
    });
  }
  res.status(200).json({
    data: {
      msg: `Clave del cliente actualizada con éxito`,
    },
  });
};
