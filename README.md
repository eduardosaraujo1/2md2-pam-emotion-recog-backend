# Emotional Recognition - Backend

Backend para o projeto [ai-emotional-recog](https://github.com/eduardosaraujo1/2md2-pam-ai-emotional-recog), para integração ao banco de dados e ao [emotion-api](https://github.com/eduardosaraujo1/2md2-pam-emotion-api)

# Arquitetura

### Banco de Dados

```
[tb_historico]
ID INT primary key auto_increment
timestamp DATETIME not null
fk_emocao INT not null
fk_user_id CHAR(32) not null -- MD5(UUID())
foreign key (fk_emocao) references tb_emocao (id)
foreign key (fk_user_id) references tb_usuario (user_id)

[tb_emocao]
id int primary key auto_increment
nome VARCHAR(45)
hex_color char(6)

[tb_usuario]
user_id CHAR(32) PRIMARY KEY -- MD5(UUID)
timestamp_cadastro DATETIME NOT NULL
```

### Express endpoint

```
[GET /new_user]
-> Request:
-> Response:
{
    "user_id": "d43626734ab5e9abca9c225a5e498313"
}

[GET /history]
-> Request:
{
    "user_id": "d43626734ab5e9abca9c225a5e498313"
}
-> Response:
[
    {
        "timestamp": "yyyy-mm-dd HH:mm:ss",
        "emotion": {
            "name": "sad",
            "color": "blue"
        }
    },
    {
        "timestamp": "yy-mm-dd HH:mm:ss",
        "emotion": {
            "name": "happy",
            "color": "yellow"
        }
    }
]

[POST /history]
-> Request:
{
    "user_id": "d43626734ab5e9abca9c225a5e498313",
    "emotion": "sad"
}

(WebSocket)
[GET /frame-emotion]
-> Request:
{
    "image": "base64",
    "user_id": "char(32)"
}
-> Response:
{
    "emotion": "sad",
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

[EMOTIONS]
sad,
happy,
angry,
surprise,
fear,
disgust,
neutral
```

# Roadmap

-   [ ] Conectar projeto Express.js ao MySQL
-   [ ] Criar rotas REST
-   [ ] Criar WebSocket
