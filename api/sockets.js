import {
  generateNumericId,
  getOpenAIResponse,
  obtenerFechaActualEnFormato,
} from "./utils.js";

export default function setupSockets(io) {
  io.on("connection", (socket) => {
    socket.on("enviar mensaje", (mensaje) => {
      // Emitir el mensaje a todos los clientes conectados
      io.sockets.emit("nuevo mensaje", {
        msg: mensaje.msg,
        authorData: {
          id: mensaje.id,
          name: mensaje.name,
          imgUrl: mensaje.avatar,
        },
        delay: obtenerFechaActualEnFormato(),
      });

      console.log('[Message]', mensaje.name+"#"+mensaje.id, ':', mensaje.msg);
    });
  });
}