USE dama;

DROP TABLE IF EXISTS game;
DROP TABLE IF EXISTS user;
-- Tabella utente: email chiave primaria, isadmin valore booleano per indicare il suo ruolo e isplaying boolean per controllare se sta già giocando o no
-- token indica i token che ha nel suo account 
CREATE TABLE public.users (
    email VARCHAR(100) PRIMARY KEY,
    username VARCHAR(100) PRIMARY KEY,
    isadmin BOOLEAN NOT NULL,
    isplaying BOOLEAN NOT NULL,
    token DOUBLE(25,3) NOT NULL
);
--Inserisco per game il suo id, i giocatori, boolean per vedere se è finita o meno, date inizio e fine per calcolare durata (WIP)
--conto delle mosse dei singoli giocatori e totali, conto anche delle pedine rimanenti ai due giocatori
--QUANDO pieces di un giocatore arriva a zero, allora vince l'altro
--aggiunto un attributo che salva le mosse del vincitore (serve per la media nella leaderboard)
--aggiunto due booleani di abbandono: abb1 se p1 abbandona abb2 per p2
CREATE TABLE public.game (
    id_game INT PRIMARY KEY AUTO_INCREMENT,
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
    duration DOUBLE(25,2),
    pieces1 INT NOT NULL,
    pieces2 INT NOT NULL,
    abbandono1 BOOLEAN,
    abbandono2 BOOLEAN,
    dimensione INT NOT NULL,
    board JSON,
    log_mosse JSON,
    CONSTRAINT pieces1_check  CHECK (pieces1>=0 AND pieces1<=12),
    CONSTRAINT pieces2_check  CHECK (pieces2>=0 AND pieces2<=12),
    CONSTRAINT playerturn_check  CHECK (playerturn==player1 OR playerturn==player2),
    FOREIGN KEY (player1) REFERENCES user(email),
    FOREIGN KEY (player2) REFERENCES user(email)
);
--Tabella della registrazione delle mosse, individuata per game e id mossa incrementale
-- registriamo il numero del pezzo e la sua fazione (bianchi o neri) con dama se il pezzo è una dama o meno,
-- la sua posizione iniziale e finale e se ha mangiato un pezzo avversario

CREATE TABLE public.move (
    id_game INT NOT NULL,
    id INT PRIMARY KEY,
    id_player VARCHAR(100) NOT NULL,
    id_pezzo VARCHAR(3) NOT NULL,
    iswhite BOOLEAN NOT NULL,
    dama BOOLEAN NOT NULL,
    xpos_in INT NOT NULL,
    ypos_in INT NOT NULL,
    xpos_fin INT NOT NULL,
    ypos_fin INT NOT NULL,
    ha_mangiato BOOLEAN NOT NULL,
    FOREIGN KEY (id_game) REFERENCES game(id_game),
    FOREIGN KEY (id_player) REFERENCES user(username),
    FOREIGN KEY (id_pezzo) REFERENCES pezzi(id_pedone)
)
--A inizio game popolare sempre la tabella dei pezzi con le posizioni iniziali fisse, WIP lista mosse possibili
--se nessun pezzo di una fazione può muoversi, allora vince l'altra fazione
CREATE TABLE public.pezzi (
    id_game INT NOT NULL,
    id_pezzo VARCHAR(3) PRIMARY KEY,
    is_white BOOLEAN NOT NULL,
    dama BOOLEAN NOT NULL,
    x_pos INT,
    y_pos INT,
    lista_coppie_posizioni_possibili JSON,
    has_Eaten BOOLEAN,
    been_Eaten BOOLEAN NOT NULL,
    FOREIGN KEY (id_game) REFERENCES game(idgame)
)
--NUmero medio mosse per vincere, numero partite perse, numero partite giocate, numero partite vinte per abbandono e numero partite perse per abbandono
--ordinamento crescente e decrescente
CREATE TABLE public.leaderboard(
    username VARCHAR(100) PRIMARY KEY ,
    moves_mean FLOAT NOT NULL,
    wins INT NOT NULL,
    losses INT NOT NULL,
    matches INT NOT NULL,
    dwins INT NOT NULL,
    dlosses INT NOT NULL,
    FOREIGN KEY (username) REFERENCES user(username)
    FOREIGN KEY (username) REFERENCES game(winner)
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