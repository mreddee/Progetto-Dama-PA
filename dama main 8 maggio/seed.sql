CREATE DATABASE IF NOT EXISTS damadb;


USE damadb;


DROP TABLE IF EXISTS game;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS moves;


CREATE TABLE users (
    email VARCHAR(100) PRIMARY KEY,
    username VARCHAR(100),
    isadmin BOOLEAN,
    isplaying BOOLEAN,
    token DOUBLE PRECISION(25,3)
);


CREATE TABLE game (
    id_game INT PRIMARY KEY AUTO_INCREMENT,
    player1 VARCHAR(100),
    player2 VARCHAR(100),
    in_progress BOOLEAN,
    date_start DATE,
    date_end DATE,
    player_turn VARCHAR(100),
    moves1 INT,
    moves2 INT,
    winner VARCHAR(100),
    pieces1 INT,
    pieces2 INT,
    abbandono1 BOOLEAN,
    abbandono2 BOOLEAN,
    dimensione INT,
    board JSON,
    FOREIGN KEY (player1) REFERENCES users(email),
    FOREIGN KEY (player2) REFERENCES users(email)
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
    ha_mangiato BOOLEAN,
    FOREIGN KEY (id_game) REFERENCES game(id_game),
    FOREIGN KEY (player) REFERENCES users(email)
);


INSERT INTO users (email, username, isadmin, isplaying, token) VALUES
    ('admin@gmail.com','admin',TRUE,FALSE,100.000),
    ('player1@gmail.com','player1',FALSE,FALSE,10.000),
    ('player2@gmail.com','player2',FALSE,FALSE,10.000);
    ('player3@gmail.com','player3',FALSE,FALSE,10.000);

INSERT INTO game (id_game, player1, player2, in_progress, date_start, date_end, player_turn, moves1, moves2, winner, pieces1, pieces2, abbandono1, abbandono2, dimensione, board) VALUES
    (1, 'admin@gmail.com', 'player1@gmail.com', FALSE, '2023-05-06', '2023-05-07', 'admin@gmail.com', 6, 5, 'admin', 1, 0, FALSE, FALSE, 3, '{"board":[["/","/","/","/"],["/","/","/","/"],["/","/","/","/"],["/","/","N","/"]]}'),
    (2, 'player1@gmail.com', 'player2@gmail.com', FALSE, '2023-05-02', '2023-05-05', 'player1@gmail.com', 5, 4, 'player1', 1, 0, FALSE, FALSE, 3, '{"board":[["/","/","B","/"],["/","/","/","/"],["/","/","/","/"],["/","/","/","/"]]}');


INSERT INTO moves (id_game, id, player, id_pezzo, da_x, da_y, a_x, a_y, ha_mangiato) VALUES
    (1, 1, 'admin@gmail.com', '2N', 1, 1, 1, 2, FALSE),
    (2, 2, 'player1@gmail.com', '1B', 2, 1, 4, 3, TRUE);


INSERT INTO leaderboard(email, moves_mean, wins, losses, matches, dwins, dlosses) VALUES
    ( 'admin@gmail.com', 12, 8, 2, 50, 5, 0),
    ( 'player1@gmail.com', 15, 12, 4, 32, 2, 2);