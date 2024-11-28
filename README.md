# Emotional Recognition - Backend

Backend para o projeto [ai-emotional-recog](https://github.com/eduardosaraujo1/2md2-pam-ai-emotional-recog), para integração ao banco de dados e ao [emotion-api](https://github.com/eduardosaraujo1/2md2-pam-emotion-api)

# Arquitetura

### Banco de Dados

```
[tb_historico]
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_uuid VARCHAR(36) NOT NULL,
    id_emocao INT NOT NULL,
    dt_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP
```

### Express endpoint

```
[GET /history]
-> Request:
{
    "token": "15c66754d1384844126400ca6256c1ed34cbcb43cdabd575764a7dffa0b0200f"
}
-> Response:
[
    {
        "timestamp": "yyyy-mm-dd HH:mm:ss",
        "emotion": {
            "id": 1
            "name": "sad",
            "color": "blue"
        }
    },
    {
        "timestamp": "yy-mm-dd HH:mm:ss",
        "emotion": {
            "id": 2
            "name": "happy",
            "color": "yellow"
        }
    }
]

// Query param ?token=15c66754d1384844126400ca6256c1ed34cbcb43cdabd575764a7dffa0b0200f
[WebSocket /]
-> Request:
{
    "image": "base64",
}
-> Response:
{
    "image": "base64",
    "emotions": [
        {
            "emotion": { "id": 2, "name": "sad", "color": "blue" },
            "confidence": 0.9,
            "scores": {
                "sad": 0.9,
                "happy": 0,
                "angry": 0.1,
                "surprise": 0,
                "fear": 0,
                "disgust": 0,
                "neutral": 0
            }
        }
    ]
}
-> Request:
{
    "register": 1,
}
-> Response: none // register on history table silently using ?token as a way to find the user

[EMOTIONS]
1 - Sad
2 - Happy
3 - Angry
4 - Surprise
5 - Fear
6 - Disgust
7 - Neutral
```

# Roadmap

-   [x] Conectar projeto Express.js ao MySQL
-   [x] Criar rotas REST
-   [x] Criar WebSocket
-   [x] Emocao should be a .json file not a mysql table
-   [x] Containerizar app em Docker e enviar para Railway
-   [ ] Railway: API flask está sendo acessada pela URL pública por conta da conectividade IPV6-only da Railway.
