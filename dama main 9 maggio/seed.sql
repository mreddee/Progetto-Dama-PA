CREATE DATABASE IF NOT EXISTS damadb;


USE damadb;


DROP TABLE IF EXISTS game;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS moves;


CREATE TABLE users (
    email VARCHAR(100) PRIMARY KEY,
    username VARCHAR(100),
    isadmin INT,
    isplaying INT,
    token DOUBLE PRECISION(25,3)
);


CREATE TABLE game (
    id_game INT PRIMARY KEY AUTO_INCREMENT,
    player1 VARCHAR(100),
    player2 VARCHAR(100),
    in_progress INT,
    date_start DATE,
    date_end DATE,
    player_turn VARCHAR(100),
    moves1 INT,
    moves2 INT,
    movesw INT,
    duration VARCHAR(100),
    winner VARCHAR(100),
    pieces1 INT,
    pieces2 INT,
    abbandono1 INT,
    abbandono2 INT,
    dimensione INT,
    board JSON
);


CREATE TABLE leaderboard(
    email VARCHAR(100) PRIMARY KEY ,
    moves_mean FLOAT,
    wins INT,
    losses INT,
    matches INT,
    dwins INT,
    dlosses INT,
    FOREIGN KEY (email) REFERENCES users(email)
);


CREATE TABLE moves (
    id_game INT,
    id INT PRIMARY KEY AUTO_INCREMENT,
    player VARCHAR(100),
    id_pezzo VARCHAR(3),
    da_x INT,
    da_y INT,
    a_x INT,
    a_y INT,
    ha_mangiato INT,
    FOREIGN KEY (id_game) REFERENCES game(id_game),
    FOREIGN KEY (player) REFERENCES users(email)
);


INSERT INTO users (email, username, isadmin, isplaying, token) VALUES
    ('admin@gmail.com','admin',1,0,100.000),
    ('player1@gmail.com','player1',0,0,10.000),
    ('player2@gmail.com','player2',0,0,10.000),
    ('player3@gmail.com','player3',0,0,10.000),
    ('player4@gmail.com','player4',0,0,10.000);

INSERT INTO leaderboard(email, moves_mean, wins, losses, matches, dwins, dlosses) VALUES
    ( 'admin@gmail.com', 12, 8, 2, 50, 5, 0),
    ( 'player1@gmail.com', 15, 12, 4, 32, 2, 2);


  