class Sockets {
  [x: string]: any;
  constructor(io: any) {
    this.io = io;
    this.socketEvents();
  }
  socketEvents() {
    this.io.on("connection", (socket: any) => {
      socket.on("mensaje-to-server", (data: any) => {
        this.io.emit("mensaje-from-server", String(data + 1));
      });
    });
  }
}

module.exports = Sockets;
