DROP SCHEMA IF EXISTS emotion_recog;

CREATE SCHEMA emotion_recog;

USE emotion_recog;

CREATE TABLE tb_emocao (
    id INT PRIMARY KEY auto_increment,
    nome VARCHAR(45) NOT NULL,
    hex_color CHAR(7) NOT NULL
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
    ('sad', '#0000FF'),       -- Blue for sadness
    ('happy', '#FFFF00'),     -- Yellow for happiness
    ('angry', '#FF0000'),     -- Red for anger
    ('surprise', '#FFA500'),  -- Orange for surprise
    ('fear', '#800080'),      -- Purple for fear
    ('disgust', '#008000'),   -- Green for disgust
    ('neutral', '#808080');   -- Gray for neutrality
