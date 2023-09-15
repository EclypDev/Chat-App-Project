function execute(data) {
    let response = {
        config: {
            "command": "!ping",
            "aliases": "",
            "description": "Comando para verificar si el bot está en línea.",
            "usage": "!ping",
            "permissions": ["USER"],
            "cooldown": 5,
            "execute": "ping.js",
        },
        data: {
            message: data[1]
        },
        embed: null,
        message: data[1],
        timestamp: null,
        mentions: null,
        attachments: null,
        embeds: null,
        reactions: null,
        isEmbed: null,

    }
    if(data[1]) {
        response.data.message = "Tu ping es: TAL"
    } else {
        response.data.message = "Debe ingresar un dato para evaluar"
    }
    return(response)
}
export  default execute