import cors from "cors";
import db_general from "../mysql/mysql_db_general";
import express, { Application } from "express";
import http from "http";
import path = require("path");
import rutaclientes from "../routes/clientes";
import rutausuarios from "../routes/usuarios";

const socketio = require("socket.io");
const Sockets = require("./socket");

export var wsService: any;

export default class Server {
  private serverExpress: Application;
  private serverport: string;
  private serverWS: Application;
  private serverportWS: string;
  public appServer: http.Server | undefined;
  public serverInit: any;
  public io: any;
  private apiPaths = {
    mailer: "/api/mailer",
    usuarios: "/api/usuarios",
    clientes: "/api/clientes",
  };
  constructor() {
    this.serverExpress = express();
    this.serverport = process.env.PORT || "6800";
    this.serverWS = express();
    this.serverportWS = process.env.WSPORT || "4008";
    try {
      this.appServer = http.createServer(this.serverExpress);
      console.log("Iniciando el servidor");
    } catch (e) {
      console.log("Error al iniciar servidor");
    }
    this.dbConnection();
    this.middlewares();
    this.routes();
  }
  async dbConnection() {
    try {
      await db_general.authenticate();
      console.log("DataBase general online");
    } catch (error) {
      console.log("error connection DataBase general");
      throw new Error();
    }
  }
  middlewares() {
    this.serverExpress.use(cors());
    const publicPath = path.resolve(__dirname, "../public/");
    this.serverExpress.use(express.static(publicPath));
    const publicPathWS = path.resolve(__dirname, "../publicSocket");
    this.serverWS.use(express.static(publicPathWS));
    this.serverInit = http.createServer(this.serverWS);
    this.io = socketio(this.serverInit, {
    });
  }

  configurarSockets() {
    wsService = this.io;
    new Sockets(this.io);
  }

  routes() {
    this.serverExpress.use(this.apiPaths.usuarios, rutausuarios);
    this.serverExpress.use(this.apiPaths.clientes, rutaclientes);
  }

  listen() {
    this.serverExpress.listen(this.serverport, () => {
      console.log(`Server corriendo en el puerto ${this.serverport}`);
    });

    this.configurarSockets();

    this.serverInit.listen(this.serverportWS, () => {
      console.log(`Server websocket corriendo en puerto ${this.serverportWS}`);
    });
  }
}
