DROP SCHEMA IF EXISTS emotion_recog;

CREATE SCHEMA emotion_recog;

USE emotion_recog;

CREATE TABLE historico (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_uuid VARCHAR(36) NOT NULL,
    id_emocao INT NOT NULL,
    dt_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP
);