DROP SCHEMA IF EXISTS emotion_recog;

CREATE SCHEMA emotion_recog;

USE emotion_recog;

CREATE TABLE tb_emocao (
    id INT PRIMARY KEY auto_increment,
    nome VARCHAR(45) NOT NULL,
    hex_color CHAR(6) NOT NULL
);

CREATE TABLE tb_historico (
    id INT PRIMARY KEY auto_increment,
    user_token VARCHAR(36) NOT NULL, -- UUID()
    dt_cadastro DATETIME DEFAULT CURRENT_TIMESTAMP,
    fk_id_emocao INT NOT NULL,
    FOREIGN KEY (fk_id_emocao) REFERENCES tb_emocao (id)
);

-- Dados para emoções
INSERT INTO tb_emocao (nome, hex_color) VALUES
    ('Sad', '0000FF'),       -- Blue for sadness
    ('Happy', 'FFFF00'),     -- Yellow for happiness
    ('Angry', 'FF0000'),     -- Red for anger
    ('Surprise', 'FFA500'),  -- Orange for surprise
    ('Fear', '800080'),      -- Purple for fear
    ('Disgust', '008000'),   -- Green for disgust
    ('Neutral', '808080');   -- Gray for neutrality
