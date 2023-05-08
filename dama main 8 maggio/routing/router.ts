import express from 'express';
import * as Middleware_CoR from '../middleware/Middleware_CoR';
import * as Middleware from '../middleware/middleware';
import * as Controller from '../controls/controller';
import * as utils from '../utils/utils';
//import { getGameById } from '../models/models';
import * as jwt from 'jsonwebtoken';
import { Utils } from 'sequelize';
//Definire i middleware di controller, routing, gestione errore e controlla i modelli
const app=express();

app.use(express.json());

/**
 * Rotta di tipo POST che consente di creare una partita tramite token JWT.
 * AuthMiddleware.checkToken,
 */
// Route to begin a match OK
app.post('/create-game', Middleware_CoR.authentication, Middleware_CoR.beginMatch, Middleware_CoR.catchError, (req: any, res: any) => {
    Controller.updateToken(req.bearer.email, +process.env.MATCH_COST!, res);
    Controller.createGame(req.bearer.email, req.body.player2, req.body.dimensione, res);
});

// Route to refill a user's token OK
//i valori non li aggiorna davvero! da controllare
app.post('/refill', Middleware_CoR.authentication, Middleware_CoR.refill, Middleware_CoR.catchError, (req: any, res: any) => {
    Controller.refill(req.body.email, req.body.token, res);
    console.log("RICARICA DI "+req.body.email+" RIUSCITA!!");
});

// Utente stesso richiede il proprio credito (agg postman)
app.get('/show-token', Middleware_CoR.authentication, Middleware_CoR.checkToken, Middleware_CoR.catchError, (req: any, res: any) => {
    Controller.showToken(req.bearer.email, res);
});

// Restituisce tutti gli utenti con credito minore a valore specificato
//per qualche motivo restituisce 2 volte il risultato
app.get('/show-token-admin', Middleware_CoR.authentication, Middleware_CoR.refill, Middleware_CoR.catchError, (req: any, res: any) => {
    Controller.showTokenAdmin(req.body.token, res);
});

// Route to show leaderboard sorted by asc or desc
//OK
app.get('/leaderboard', Middleware_CoR.leaderboard, Middleware_CoR.catchError, (req: any, res: any) => {
    Controller.showLeaderboard(req.body.sort, res);
});

//verifica se la mossa è ammissibile
//verifica id_game e aggiorna campo (?)
//non abbiamo implementato il 'se può mangiare'
//assunzioni: si cambia a prescindere turno, player1 ha i neri e player2 i bianchi, --le dame si muovono come i pedoni, i pedoni si trasformano in dame--
app.post('/make-move', Middleware_CoR.authentication, Middleware_CoR.makeMove, Middleware_CoR.catchError, (req: any, res: any) => {
    Controller.updateToken(req.bearer.email, +process.env.MOVE_COST!, res);
    Controller.createMove(req.bearer.email, req.body.id_game, req.body.id_pezzo, req.body.da_x, req.body.da_y, req.body.a_x, req.body.a_y, req.body.dimensione, res);
});

//verifica lo stato di una partita specifica per id (aggiorna postman)
app.get('/show-game', Middleware_CoR.authentication, Middleware_CoR.catchError, (req: any, res: any) => {
    Controller.showGame(req.body.id_game, res);
});

//determina l'abbandono di un giocatore
//controlla funzioni postman fatto
app.post('/concede', Middleware_CoR.authentication, Middleware_CoR.gameState, Middleware_CoR.catchError, (req: any, res: any) => {
    Controller.concede(req.bearer.email, req.body.id_game, res);
});
// Route that returns the game log containing all the moves made by players
//testare
app.get('/game-log', Middleware_CoR.authentication, Middleware_CoR.gameLog, Middleware_CoR.catchError, (req: any, res: any) => {
    Controller.getLog(req.body.id_game, req.body.path, req.body.format, res);
});
//creata rotta che restituisce lista giochi fatti entro un certo set di date da un certo utente
//testare postman
app.get('/games', Middleware_CoR.authentication, Middleware_CoR.userStats, Middleware_CoR.catchError,(req: any, res: any) => {
    Controller.getGames(req.body.email, req.body.date_start, req.body.date_end, res);});

// Managing invalid routes
app.get('*', Middleware.routeNotFound, Middleware_CoR.catchError);
app.post('*', Middleware.routeNotFound, Middleware_CoR.catchError);

app.listen(3000, () => {
    console.log('The application is running on localhost:3000!');
});
