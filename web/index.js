const channelsURI = 'http://localhost:3000/api/user/123/channel/1';
const promptTextArea = document.getElementById("prompt-textarea");
const promptTextSend = document.getElementById("send-button");
const chatDiv = document.getElementById("area");
const elementsWithTooltips = document.querySelectorAll('.canal[data-tooltip]');

let userId = localStorage.getItem('session_userId');

// Función para enviar una solicitud y guardar en localStorage
const sendRequestAndStoreInLocalStorage = async (id, localStorageKey) => {
    try {
        const baseURL = 'http://localhost:3000/api/user/';
        const response = await fetch(new URL(id, baseURL));
        const data = await response.json();
        console.log(data)
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
    const userData = JSON.parse(localStorage.getItem('userData'));

    if(!userData) {
        // Si no están en localStorage, enviar una solicitud y guardarlos
        sendRequestAndStoreInLocalStorage(userId, 'userData');
    }

    // Verificar si los datos del bot ya están en localStorage
    const botData = JSON.parse(localStorage.getItem('botData'));
    if (!botData) {
        const botId = 1; // Cambia esto si es necesario
        sendRequestAndStoreInLocalStorage(botId, 'botData');
    } 
} else {
    console.error("userId es undefined o null. Asegúrate de tener un valor válido en el almacenamiento local.");
}

// Función para obtener datos del usuario o el bot
function getDataforUser(type) {
    if (type === 'bot') {
        const botDataString = localStorage.getItem('botData');
        if (botDataString) {
            return JSON.parse(botDataString);
        } else {
            console.error("No se encontraron datos del bot en el almacenamiento local.");
        }
    } else if (type === 'user') {
        const userDataString = localStorage.getItem('userData');
        if (userDataString) {
            return JSON.parse(userDataString);
        } else {
            console.error("No se encontraron datos del usuario en el almacenamiento local.");
        }
    } else {
        console.error("Tipo de usuario no válido. Use 'bot' o 'user'.");
    }
}

// Ejemplo de cómo usar la función para obtener datos del usuario o el bot
const userData = getDataforUser('user');
const botData = getDataforUser('bot');

console.log(userData);
console.log(botData);

elementsWithTooltips.forEach(element => {
  const tooltipText = element.getAttribute('data-tooltip');
  element.addEventListener('mouseenter', () => {
    const tooltip = document.createElement('div');
    tooltip.className = 'custom-tooltip';
    tooltip.textContent = tooltipText;
    element.appendChild(tooltip);
  });
  element.addEventListener('mouseleave', () => {
    const tooltip = element.querySelector('.custom-tooltip');
    if (tooltip) {
      element.removeChild(tooltip);
    }
  });
});


const findMessages = async () => {
    try {
        const response = await fetch(channelsURI);
        if (!response.ok) {
            throw new Error(`Error al recuperar los mensajes. Código de estado: ${response.status}`);
        }
        const data = await response.json();
        const mensajesChannel = data.messages;
        mensajesChannel.sort((a, b) => a.mensajes - b.mensajes);
        const primerMensaje = mensajesChannel[0].mensajes;

        mensajesChannel.forEach((message) => {
            setTimeout(() => {
                responseMessage(message, userData.id);
            }, message.mensajes - primerMensaje); // Retardo basado en la diferencia con el primer mensaje
        });
    } catch (error) {
        console.error('Error:', error);
    }
};
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

function responseMessage(data) {
    const area = document.getElementById("area");

            let responseDiv = document.createElement("div");
            responseDiv.setAttribute("class", "message");
            responseDiv.innerHTML = `<img src=${botData.imgUrl} alt="Foto de perfil">
                    <div class="message-content ">
                    <h2>${botData.name}</h2>
                    <p>${data.msg}</p>
                    </div>`;

            area.append(responseDiv);
}

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
  let input = promptTextArea.value;
  if (input !== "") {
    requestMessage(input);

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
});

promptTextArea.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault(); // Evita que se haga un salto de línea en el textarea
  
      // Realiza el evento cuando se presiona "Enter"
      let input = promptTextArea.value;
      if (!input == "") {
        requestMessage(input);
  
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
            responseMessage(res.response, botData); // Pasa botData como argumento
          })
          .catch((err) => console.error(err));
  
        promptTextArea.value = "";
      }
    }
  });

findMessages();