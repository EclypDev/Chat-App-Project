import Express from "express";
import Path from "path";
import BodyParser from "body-parser";
import route from "./routes.js";
import Morgan from "morgan";
import { fileURLToPath } from "url";
import { createServer } from 'http';
import { Server } from 'socket.io';
import setupSockets from './sockets.js';

// Utils
const __filename = fileURLToPath(import.meta.url);
const __dirname = Path.dirname(__filename);

// create APP
const APP = Express();
const server = createServer(APP);
const socketio = new Server(server);

//WEBSOCKETS
setupSockets(socketio);


// Paths
const staticFilePath = Path.join(__dirname, "../web");

// Settings
const PORT = process.env.PORT || 3000;

// Middlewares
//APP.use(Morgan("dev"));
APP.use(BodyParser.json());
APP.use(route);
APP.use(Express.static(staticFilePath));
APP.use(Express.urlencoded({ extended: true }))

// Starting Server
server.listen(PORT, () => {
    console.log(`Server running in port ${PORT}`);
});