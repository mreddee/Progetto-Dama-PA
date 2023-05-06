CREATE DATABASE IF NOT EXISTS damadb;

USE damadb;

DROP TABLE IF EXISTS game;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    email VARCHAR(100) PRIMARY KEY,
    username VARCHAR(100),
    isadmin BOOLEAN,
    isplaying BOOLEAN,
    token DOUBLE PRECISION(25,3)
);

CREATE TABLE game (
    id_game INT PRIMARY KEY,
    player1 VARCHAR(100),
    player2 VARCHAR(100),
    in_progress BOOLEAN,
    date_start DATE,
    date_end DATE,
    player_turn VARCHAR(100),
    moves1 INT,
    moves2 INT,
    movescount INT,
    movesw INT,
    winner VARCHAR(100),
    duration DOUBLE PRECISION(25,2),
    pieces1 INT,
    pieces2 INT,
    abbandono1 BOOLEAN,
    abbandono2 BOOLEAN,
    dimensione INT,
    board JSON,
    log_mosse JSON,
    FOREIGN KEY (player1) REFERENCES users(email),
    FOREIGN KEY (player2) REFERENCES users(email)
);

CREATE TABLE pezzi (
    id_game INT,
    id_pezzo VARCHAR(3) PRIMARY KEY,
    is_white BOOLEAN,
    dama BOOLEAN,
    x_pos INT,
    y_pos INT,
    lista_coppie_posizioni_possibili JSON,
    has_Eaten BOOLEAN,
    been_Eaten BOOLEAN,
    FOREIGN KEY (id_game) REFERENCES game(id_game)
);

CREATE TABLE leaderboard(
    username VARCHAR(100) PRIMARY KEY ,
    moves_mean FLOAT,
    wins INT,
    losses INT,
    matches INT,
    dwins INT,
    dlosses INT,
    FOREIGN KEY (username) REFERENCES users(email)
);


CREATE TABLE move (
    id_game INT,
    id INT PRIMARY KEY,
    player VARCHAR(100),
    id_pezzo VARCHAR(3),
    iswhite BOOLEAN,
    dama BOOLEAN,
    xpos_in INT,
    ypos_in INT,
    xpos_fin INT,
    ypos_fin INT,
    ha_mangiato BOOLEAN,
    FOREIGN KEY (id_game) REFERENCES game(id_game),
    FOREIGN KEY (player) REFERENCES users(email),
    FOREIGN KEY (id_pezzo) REFERENCES pezzi(id_pezzo)
);

INSERT INTO users (email, username, isadmin, isplaying, token) VALUES
    ('admin@gmail.com','admin',1,0,100.000),
    ('player1@gmail.com','player1',0,0,10.000),
    ('player2@gmail.com','player2',0,0,10.000);
 