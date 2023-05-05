CREATE DATABASE IF NOT EXISTS damadb;

USE damadb;

DROP TABLE IF EXISTS game;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    email VARCHAR(100) PRIMARY KEY,
    username VARCHAR(100),
    isadmin BOOLEAN NOT NULL,
    isplaying BOOLEAN NOT NULL,
    token DOUBLE PRECISION(25,3) NOT NULL
);

CREATE TABLE game (
    id_game INT PRIMARY KEY,
    player1 VARCHAR(100) NOT NULL,
    player2 VARCHAR(100) NOT NULL,
    in_progress BOOLEAN NOT NULL,
    date_start DATE NOT NULL,
    date_end DATE,
    player_turn VARCHAR(100) NOT NULL,
    moves1 INT NOT NULL,
    moves2 INT NOT NULL,
    movescount INT,
    movesw INT,
    winner VARCHAR(100),
    duration DOUBLE PRECISION(25,2),
    pieces1 INT NOT NULL,
    pieces2 INT NOT NULL,
    abbandono1 BOOLEAN,
    abbandono2 BOOLEAN,
    dimensione INT NOT NULL,
    board JSON,
    log_mosse JSON,
    FOREIGN KEY (player1) REFERENCES users(email),
    FOREIGN KEY (player2) REFERENCES users(email)
);

CREATE TABLE pezzi (
    id_game INT NOT NULL,
    id_pezzo VARCHAR(3) PRIMARY KEY,
    is_white BOOLEAN NOT NULL,
    dama BOOLEAN NOT NULL,
    x_pos INT,
    y_pos INT,
    lista_coppie_posizioni_possibili JSON,
    has_Eaten BOOLEAN,
    been_Eaten BOOLEAN NOT NULL,
    FOREIGN KEY (id_game) REFERENCES game(id_game)
);

CREATE TABLE leaderboard(
    username VARCHAR(100) PRIMARY KEY ,
    moves_mean FLOAT NOT NULL,
    wins INT NOT NULL,
    losses INT NOT NULL,
    matches INT NOT NULL,
    dwins INT NOT NULL,
    dlosses INT NOT NULL,
    FOREIGN KEY (username) REFERENCES users(email)
);


CREATE TABLE move (
    id_game INT NOT NULL,
    id INT PRIMARY KEY,
    player VARCHAR(100) NOT NULL,
    id_pezzo VARCHAR(3) NOT NULL,
    iswhite BOOLEAN NOT NULL,
    dama BOOLEAN NOT NULL,
    xpos_in INT NOT NULL,
    ypos_in INT NOT NULL,
    xpos_fin INT NOT NULL,
    ypos_fin INT NOT NULL,
    ha_mangiato BOOLEAN NOT NULL,
    FOREIGN KEY (id_game) REFERENCES game(id_game),
    FOREIGN KEY (player) REFERENCES users(email),
    FOREIGN KEY (id_pezzo) REFERENCES pezzi(id_pezzo)
);

INSERT INTO users (email, username, isadmin, isplaying, token) VALUES
    ('admin@gmail.com','admin',1,0,100.000),
    ('player1@gmail.com','player1',0,0,10.000),
    ('player2@gmail.com','player2',0,0,10.000);
 