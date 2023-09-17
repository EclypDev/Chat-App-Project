
const socket = io();

const promptTextArea = document.getElementById("prompt-textarea");
const promptTextSend = document.getElementById("send-button");
const chatDiv = document.getElementById("area");
const elementsWithTooltips = document.querySelectorAll(".canal[data-tooltip]");
if (localStorage.getItem("session_token")) {
let userId = localStorage.getItem("session_userId");
// Función para enviar una solicitud y guardar en localStorage


function delay(ms) {
  const start = Date.now();
  let now = start;

  while (now - start < ms) {
    now = Date.now();
  }
}
function downScrollAnimated () {
  const area = document.getElementById("area");
  const scrollHeight = area.scrollHeight;
  const animationDuration = 500; 
  const startTime = performance.now();
  const initialScrollTop = area.scrollTop;

  function animateScroll(currentTime) {
    const elapsedTime = currentTime - startTime;
    if (elapsedTime < animationDuration) {
      const newScrollTop = easeInOut(elapsedTime, initialScrollTop, scrollHeight - area.scrollTop, animationDuration);
      area.scrollTop = newScrollTop;
      requestAnimationFrame(animateScroll);
    } else {
      area.scrollTop = scrollHeight;
    }
  }

  function easeInOut(t, b, c, d) {
    t /= d / 2;
    if (t < 1) return c / 2 * t * t + b;
    t--;
    return -c / 2 * (t * (t - 2) - 1) + b;
  }

  requestAnimationFrame(animateScroll);
}
function generateNumericId(number) {
  const min = 1;
  const max = number;
  let numericId = "";

  for (let i = 0; i < 10; i++) {
    const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
    numericId += randomNumber.toString();
  }

  return parseInt(numericId);
}
const sendRequestAndStoreInLocalStorage = async (id, localStorageKey) => {
  try {
    const baseURL = "http://localhost:3000/api/user/";
    const response = await fetch(new URL(id, baseURL));
    const data = await response.json();

    if (response.ok) {
      // Guardar los datos en localStorage como JSON
      localStorage.setItem(localStorageKey, JSON.stringify(data));
    } else {
      throw new Error(`Error en la solicitud: ${response.status}`);
    }
  } catch (error) {
    throw error;
  }
};

if (userId) {
  // Verificar si los datos del usuario ya están en localStorage
  const userData = JSON.parse(localStorage.getItem("userData"));

  if (!userData) {
    // Si no están en localStorage, enviar una solicitud y guardarlos
    sendRequestAndStoreInLocalStorage(userId, "userData");
  }

  // Verificar si los datos del bot ya están en localStorage
  const botData = JSON.parse(localStorage.getItem("botData"));
  if (!botData) {
    const botId = 1; // Cambia esto si es necesario
    sendRequestAndStoreInLocalStorage(botId, "botData");
  }
} else {
  console.error(
    "userId es undefined o null. Asegúrate de tener un valor válido en el almacenamiento local."
  );
}

// Función para obtener datos del usuario o el bot
function getDataforUser(type) {
  if (type === "bot") {
    const botDataString = localStorage.getItem("botData");
    if (botDataString) {
      return JSON.parse(botDataString);
    } else {
      console.error(
        "No se encontraron datos del bot en el almacenamiento local."
      );
      //window.location.reload();
    }
  } else if (type === "user") {
    const userDataString = localStorage.getItem("userData");
    if (userDataString) {
      return JSON.parse(userDataString);
    } else {
      console.error(
        "No se encontraron datos del usuario en el almacenamiento local."
      );
      //window.location.reload();
    }
  } else {
    console.error("Tipo de usuario no válido. Use 'bot' o 'user'.");
  }
}

// Ejemplo de cómo usar la función para obtener datos del usuario o el bot
const userData = getDataforUser("user");
const botData = getDataforUser("bot");

elementsWithTooltips.forEach((element) => {
  const tooltipText = element.getAttribute("data-tooltip");
  element.addEventListener("mouseenter", () => {
    const tooltip = document.createElement("div");
    tooltip.className = "custom-tooltip";
    tooltip.textContent = tooltipText;
    element.appendChild(tooltip);
  });
  element.addEventListener("mouseleave", () => {
    const tooltip = element.querySelector(".custom-tooltip");
    if (tooltip) {
      element.removeChild(tooltip);
    }
  });
});
function requestMessage(message) {
  const hora = new Date().getHours();
  const minute = new Date().getMinutes();
  const seconds = new Date().getSeconds();
  const area = document.getElementById("area");
  let responseDiv = document.createElement("div");
  responseDiv.setAttribute("class", "message");
  responseDiv.innerHTML = `<img src="${userData.imgUrl}" alt="Foto de perfil">
            <div class="message-content">
            <h2>${userData.name}</h2>
             <p>${marked(message)}</p>
              </div>`;
  //createLine()
  area.append(responseDiv);
}
socket.on('nuevo mensaje', (mensaje) => {
  
  let data = {
    "msg": mensaje.msg,
    "authorData": {
      "id": mensaje.authorData.id,
      "name": mensaje.authorData.name,
      "imgUrl": mensaje.authorData.imgUrl
    },
    "delay": mensaje.delay
}
  responseMessage(data);
  downScrollAnimated()
});

function responseMessage(data) {
  const area = document.getElementById("area");
  let responseDiv = document.createElement("div");
  responseDiv.setAttribute("class", "message");
  responseDiv.innerHTML = `<img src=${data.authorData.imgUrl} alt="Foto de perfil">
                    <div class="message-content ">
                    <h2>${data.authorData.name}</h2>
                    <p>${data.msg}</p>
                    </div>`;
                   

  area.append(responseDiv);
}

localStorage.setItem("channel", 1); // ! Arreglar el canal selector
let thisChannel = localStorage.getItem("channel");


const findMessages = async (channelId = 1) => {
  try {
    const channelsURI = `http://localhost:3000/api/user/${userData.id}/channel/${channelId}`;
    const response = await fetch(channelsURI);

    if (!response.ok) {
      throw new Error(
        `Error al recuperar los mensajes. Código de estado: ${response.status}`
      );
    }

    const data = await response.json();

    if (!data) {
      throw new Error("Los datos del canal no son válidos o están vacíos.");
    }

    const mensajesChannel = data.messages; // ! Arreglar la organizacion por fecha de los mensajes
    //mensajesChannel.sort((a, b) => a.data - b.data); // Ordenar por fecha (propiedad "data")

    const primerMensaje = mensajesChannel[0].data;

    // Función asincrónica para obtener los datos del autor
    const getAuthorData = async (authorID) => {
      const baseURL = "http://localhost:3000/api/user/";
      const authorResponse = await fetch(new URL(authorID, baseURL));
      const authorData = await authorResponse.json();
      return authorData;
    };

    // Recorre los mensajes y llama a responseMessage con los datos del autor
    for (const message of mensajesChannel) {
      const authorID = message.authorID;
      const authorData = await getAuthorData(authorID);

      const messageData = {
        msg: message.text,
        authorData: authorData || botData, // Usar los datos del autor o del bot por defecto
        delay: message.data - primerMensaje,
      };

      setTimeout(() => {
        responseMessage(messageData);
      }, messageData.delay);
    }

    return {
      channelInfo: response, // Aquí puedes agregar los datos del canal
      messages: mensajesChannel,
    };
  } catch (error) {
    console.error("Error:", error);
    return null; // Puedes manejar el error según tus necesidades
  }
};

findMessages(thisChannel);

function createLine() {
  let hora = new Date().getHours();
  let minute = new Date().getMinutes();
  let seconds = new Date().getSeconds();
  const line = document.createElement("div");
  line.setAttribute("class", "div-line");
  line.innerHTML = `<hr>
    <p id="line">${hora}/${minute}/${seconds}</p>
    `;
  area.append(line);
}

promptTextSend.addEventListener("click", async () => {
  let input = promptTextArea.value
  if (input !== "") {
    let input = promptTextArea.value
    if (input !== "") {
      let dataMessage = {}
      socket.emit('enviar mensaje', "Prueba de mensaje");

      let dataForSave = {
        authorID: userData.id,
        channelID: thisChannel,
        text: input,
      }
  
      fetch('/api/channel/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataForSave),
      })
        .then(response => response.json())
        .then(data => {
        })
        .catch(error => {
          console.error('Error:', error);
        });
  
      let prompt = {
        message: input,
      };
      let URI = "http://localhost:3000/api/gpt/";
      async function postData(url = "", data = {}) {
        const response = await fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });
        return response.json();
      }
      postData(URI, prompt)
        .then((res) => {
          responseMessage(res, botData.id);
        })
        .catch((err) => console.error(err));
      promptTextArea.value = "";
    }
  }
});

promptTextArea.addEventListener("keydown", async (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault(); // Evita que se haga un salto de línea en el textarea

    // Realiza el evento cuando se presiona "Enter"
    let input = promptTextArea.value
    if (input !== "") {
      try {
        const userData = await getUserDataFromLocalStorage()
        socket.emit('enviar mensaje', {
          "msg": input,
          "id": userData.id,
          "name": userData.name,
          "avatar": userData.imgUrl
        });

        let dataForSave = {
          authorID: userData.id,
          channelID: thisChannel,
          text: input,
        }
        fetch('/api/channel/', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(dataForSave),
        })
          .then(response => response.json())
          .then(data => {
          })
          .catch(error => {
            console.error('Error:', error);
          });
    
        let prompt = {
          message: input,
        };
        let URI = "http://localhost:3000/api/gpt/";
        async function postData(url = "", data = {}) {
          const response = await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
          });
          return response.json();
        }
        postData(URI, prompt)
          .then((res) => {
            responseMessage(res, botData.id);
          })
          .catch((err) => console.error(err));
        promptTextArea.value = "";
      } catch (err){
        console.error('Error al obtener datos del usuario:', error);
      }

    }
  }
});
async function getUserDataFromLocalStorage() {
  return new Promise((resolve, reject) => {
    const userData = localStorage.getItem('userData');
    if (userData) {
      // Parsea los datos JSON almacenados en localStorage
      try {
        const parsedUserData = JSON.parse(userData);
        resolve(parsedUserData);
      } catch (error) {
        reject(error);
      }
    } else {
      reject(new Error('No se encontraron datos de usuario en localStorage'));
    }
  });
}

window.addEventListener("unload", (event) => {
  

  async function checkAndUpdateDataInLocalStorage(userId, localStorageKey) {
    try {
      const baseURL = "http://localhost:3000/api/user/";
      const response = await fetch(new URL(userId, baseURL));
      const data = await response.json();

      if (response.ok) {
        const storedData = JSON.parse(localStorage.getItem(localStorageKey));

        // Compara los datos recién obtenidos con los datos almacenados
        if (!isEqual(data, storedData)) {
          // Los datos son diferentes, elimina los datos almacenados y actualiza con los nuevos datos
          localStorage.removeItem(localStorageKey);
          localStorage.setItem(localStorageKey, JSON.stringify(data));
        }
      } else {
        throw new Error(`Error en la solicitud: ${response.status}`);
      }
    } catch (error) {
      throw error;
    }
  }

  // Utilidad para comparar dos objetos JSON
  function isEqual(obj1, obj2) {
    const str1 = JSON.stringify(obj1);
    const str2 = JSON.stringify(obj2);
    return str1 === str2;
  }
  checkAndUpdateDataInLocalStorage(userData, "userData");
  checkAndUpdateDataInLocalStorage(botData.id, "botData");
});

document.querySelector('#goDown').addEventListener('click', (e) => {
  downScrollAnimated()
});
} else {
  window.location.href = "/login";
}


//Button logout

/*
localStorage.clear()
window.location.reload()
*/