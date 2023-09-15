import { Router } from "express";
import Path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import db from 'quick.db'
import TokenGenerator from 'uuid-token-generator';
import { generateNumericId, getOpenAIResponse } from './utils.js'
import fs from 'fs'


function generateToken() {
    const tokgen = new TokenGenerator();
    let token = tokgen.generate()
    return token
}

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = Path.dirname(__filename);
const route = Router();

//paths
const pathWeb = Path.join(__dirname, "../web");
const registerFilePath = Path.join(pathWeb, "register.html");
const loginFilePath = Path.join(pathWeb, "login.html");
const indexFilePath = Path.join(pathWeb, "index.html");

//Database 
const database = db.get('database_users') || [];
console.log(database.users)
route.post('/api/session/login', (req, res) => {
    const userDataLogin = req.body;
    const { username, password } = userDataLogin;

    // Busca un usuario en la base de datos que coincida con el nombre de usuario y la contraseña
    const user = database.users.find(user => user.info.name === username && user.session.password === password);

    if (user) {
        // Si se encuentra un usuario, envía los datos de sesión como respuesta
        const { info, session } = user;
        res.send({
            status: "Sesión iniciada correctamente",
            token: session.tokenId,
            email: session.email,
            userId: info.id,
            username: info.name
        });
    } else {
        // Si no se encuentra un usuario, envía una respuesta de error
        res.status(401).json({ error: "Nombre de usuario o contraseña incorrectos" });
    }

})
route.post('/api/session/register', (req, res) => {
    const username = req.body.username;
    const email = req.body.email;
    const password = req.body.password;

    // Obtén la lista de usuarios existentes de la base de datos usando quick.db
    let database = db.get('database_users') || { users: [] };

    let validateUser = (username, demail) => {
        return new Promise((resolve, reject) => {
            let foundUser = database.users.find((user) => {
                return user.info.name === username || user.session.email === demail;
            });

            if (foundUser) {
                let foundInfo = {};

                if (foundUser.info.name === username) {
                    foundInfo.type = "username";
                } else if (foundUser.session.email === demail) {
                    foundInfo.type = "email";
                }

                resolve({ userFound: true, foundInfo });
            } else {
                resolve({ userFound: false });
            }
        });
    };

    validateUser(username, email)
        .then(({ userFound, foundInfo }) => {
            if (userFound) {
                res.status(400).json({ error: `Usuario ya registrado (${foundInfo.type})` });
            } else {
                // Genera valores únicos para userId y token
                let data = {
                    message: "Registro exitoso.",
                    userId: generateNumericId(10), // Puedes reemplazar con tu lógica real
                    token: generateToken(), // Puedes reemplazar con tu lógica real
                    email: email,
                    username: username
                }

                let newUser = {
                    "info": {
                        "id": data.userId,
                        "name": data.username,
                        "imgUrl": "https://thumbs.dreamstime.com/b/vector-de-usuario-redes-sociales-perfil-avatar-predeterminado-retrato-vectorial-del-176194876.jpg",
                        "channels": []
                    },
                    "session": {
                        "tokenId": data.token,
                        "email": data.email,
                        "password": password
                    }
                };

                // Agrega el nuevo usuario a la lista de usuarios existentes en la base de datos
                database.users.push(newUser);

                // Guarda la lista actualizada de usuarios en la base de datos usando quick.db
                db.set('database_users', database);

                // Enviar datos personalizados en caso de registro exitoso
                res.status(200).json(data);
            }
        })
        .catch((error) => {
            console.error('Error:', error);
            res.status(400).json({ error: error });
        });

});

route.get('/api/user/:id', (req, res) => {
    let users = database.users;
    let found = false;

    for (const user of users) {
        if (user.info.id == req.params.id) {
            res.json(user.info);
            found = true;
            break; // Salir del bucle una vez que se encuentre el usuario
        }
    }

    if (!found) {
        res.status(404).json({
            "error": "Esta id de usuario no existe"
        });
    }
});

route.post("/api/gpt/", async (req, res) => {
    const requestDataGPT = req.body;
    const prompt = requestDataGPT.message;
    const command = prompt.split(' ');
  
    if (command[0] === '!ask') {
      const response = await getOpenAIResponse(prompt);
      if (response) {
        res.json({
          msg: response
        });
      } else {
        res.json({
          msg: 'IA fuera de servicio.'
        });
      }
    } else {
      // Manejar mensajes normales aquí
      // Por ejemplo, podrías responder con un mensaje predeterminado
      res.json({
        msg: 'Mensaje normal recibido.'
      });
    }
  });
  
  
route.get('/api/user/:userId/channel/:channelId', (req, res) => {
    const userId = req.params.userId;
    const channelId = req.params.channelId;
    // Busca el usuario por su ID
    const user = database.users.find((user) => user.info.id == userId);
    if (!user) {
        res.status(404).json({ error: 'Usuario no encontrado' });
        return;
    }


    try {
        const hasChannel = user.info.channels.includes(channelId);
    
        if (hasChannel) {
            // Encuentra el canal correspondiente en los datos
            const channel = database.channels.find((channel) => channel.id === channelId);
    
            if (channel) {
                res.json(channel);
            } else {
                res.status(404).json({ error: 'No tienes acceso a ese canal' });
            }
        } else {
            res.json({ 
                msg: 'El usuario no tiene acceso al canal.'
             });
        }
    } catch (error) {
        res.status(404).json({ error: 'Este usuario no tiene canales' });
    }
    
});

route.get("/register", (req, res) => {
    res.sendFile(registerFilePath);
});

route.get('/login', (req, res) => {
    res.sendFile(loginFilePath)
})
route.get("/home", (req, res) => {
    res.sendFile(indexFilePath);
});

export default route;