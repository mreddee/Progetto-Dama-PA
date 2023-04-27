USE dama;

DROP TABLE IF EXISTS game;
DROP TABLE IF EXISTS user;
-- Tabella utente: email chiave primaria, isadmin valore booleano per indicare il suo ruolo e isplaying boolean per controllare se sta già giocando o no
-- token indica i token che ha nel suo account 
CREATE TABLE user (
    email VARCHAR(30) PRIMARY KEY,
    username VARCHAR(30) UNIQUE NOT NULL,
    isadmin BOOLEAN NOT NULL,
    isplaying BOOLEAN NOT NULL,
    token DOUBLE(25,2) NOT NULL,
);
--Inserisco per game il suo id, i giocatori, boolean per vedere se è finita o meno, date inizio e fine per calcolare durata (WIP)
--conto delle mosse dei singoli giocatori e totali, conto anche delle pedine rimanenti ai due giocatori
--QUANDO pieces di un giocatore arriva a zero, allora vince l'altro
CREATE TABLE game (
    id_game INT PRIMARY KEY AUTO_INCREMENT,
    player1 VARCHAR(30) NOT NULL,
    player2 VARCHAR(30) NOT NULL,
    inprogress BOOLEAN NOT NULL,
    date_start DATE NOT NULL,
    end_date DATE,
    playerturn VARCHAR(30) NOT NULL,
    moves1 INT NOT NULL,
    moves2 INT NOT NULL,
    movescount INT NOT NULL,
    winner VARCHAR(30),
    duration FLOAT,
    pieces1 INT NOT NULL,
    pieces2 INT NOT NULL,
    CONSTRAINT pieces1_check  CHECK ( pieces1>=0 AND pieces1<=12),
    CONSTRAINT pieces2_check  CHECK ( pieces2>=0 AND pieces2<=12),
    CONSTRAINT playerturn_check  CHECK ( playerturn==player1 OR playerturn==player2),
    FOREIGN KEY (player1) REFERENCES user(email),
    FOREIGN KEY (player2) REFERENCES user(email)
);
--Tabella della registrazione delle mosse, individuata per game e id mossa incrementale
-- registriamo il numero del pezzo e la sua fazione (bianchi o neri) con dama se il pezzo è una dama o meno,
-- la sua posizione iniziale e finale e se ha mangiato un pezzo avversario

CREATE TABLE move (
    id_game INT NOT NULL,
    id INT PRIMARY KEY AUTO_INCREMENT,
    id_player VARCHAR(30) NOT NULL,
    id_pezzo VARCHAR(3) NOT NULL,
    pezzo INT NOT NULL,
    iswhite BOOLEAN NOT NULL,
    dama BOOLEAN NOT NULL,
    xposin INT NOT NULL,
    yposin INT NOT NULL,
    xposfin INT NOT NULL,
    yposfin INT NOT NULL,
    hamangiato BOOLEAN NOT NULL,
    FOREIGN KEY (id_game) REFERENCES game(id_game),
    FOREIGN KEY (id_player) REFERENCES user(username),
    FOREIGN KEY (id_pezzo) REFERENCES pezzi(id_pedone)
)
--A inizio game popolare sempre la tabella dei pezzi con le posizioni iniziali fisse, WIP lista mosse possibili
--se nessun pezzo di una fazione può muoversi, allora vince l'altra fazione
CREATE TABLE pezzi (
    id_game INT NOT NULL,
    id_pedone VARCHAR(3) PRIMARY KEY,
    iswhite BOOLEAN NOT NULL,
    dama BOOLEAN NOT NULL,
    xpos INT,
    ypos INT,
    lista_coppie_posizioni_possibili 
    hasEaten BOOLEAN NOT NULL,
    beenEaten BOOLEAN NOT NULL,
    FOREIGN KEY (id_game) REFERENCES game(idgame)
)
--NUmero medio mosse per vincere, numero partite perse, numero partite giocate, numero partite vinte per abbandono e numero partite perse per abbandono
--ordinamento crescente e decrescente
CREATE TABLE leaderboard(
    username VARCHAR(30) PRIMARY KEY ,
    movesmean INT NOT NULL,
    losses INT NOT NULL,
    matches INT NOT NULL,
    dWin INT NOT NULL,
    dlosses INT NOT NULL
    FOREIGN KEY (username) REFERENCES user(username)
)
--Inseriti un admin e almeno due coppie di giocatori, i giocatori 5 e 6 serviranno per testare le richieste che andranno male
INSERT INTO user (email, username, isadmin, isplaying, token) VALUES
    ('admin@gmail.com','Admin',TRUE,FALSE,100)
    ('player1@gmail.com','P1',FALSE,FALSE,10)
    ('player2@gmail.com','P2',FALSE,FALSE,10)
    ('player3@gmail.com','P3',FALSE,FALSE,10)
    ('player4@gmail.com','P4',FALSE,FALSE,10)
    ('player5@gmail.com','P5',FALSE,FALSE,0)
    ('player6@gmail.com','P6',FALSE,FALSE,10)
