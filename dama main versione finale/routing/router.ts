import express from 'express';
import * as Middleware_CoR from '../middleware/Middleware_CoR';
import * as Middleware from '../middleware/middleware';
import * as Controller from '../controls/controller';
const app=express();

app.use(express.json());

/**
 * Rotta di tipo POST che consente di creare una partita tramite token JWT.
 */
app.post('/create-game', Middleware_CoR.authentication, Middleware_CoR.beginMatch, Middleware_CoR.catchError, (req: any, res: any) => {
    Controller.updateToken(req.bearer.email, +process.env.MATCH_COST!, res);
    Controller.createGame(req.bearer.email, req.body.player2, req.body.dimensione, res);
});

// Rotta per ricaricare i token ad un giocatore
app.post('/refill', Middleware_CoR.authentication, Middleware_CoR.refill, Middleware_CoR.catchError, (req: any, res: any) => {
    Controller.refill(req.body.email, req.body.token, res);
    console.log("RICARICA DI "+req.body.email+" RIUSCITA!!");
});

// Utente stesso richiede il proprio credito
app.get('/show-token', Middleware_CoR.authentication, Middleware_CoR.checkToken, Middleware_CoR.catchError, (req: any, res: any) => {
    Controller.showToken(req.bearer.email, res);
});

// Restituisce tutti gli utenti con credito minore a valore specificato
app.get('/show-token-admin', Middleware_CoR.authentication, Middleware_CoR.refill, Middleware_CoR.catchError, (req: any, res: any) => {
    Controller.showTokenAdmin(req.body.token, res);
});

// rotta per ottenere la classifica in ordine crescente o decrescente
app.get('/leaderboard', Middleware_CoR.leaderboard, Middleware_CoR.catchError, (req: any, res: any) => {
    Controller.showLeaderboard(req.body.sort, res);
});

//Rotta per effettuare mossa durante la partita
app.post('/make-move', Middleware_CoR.authentication, Middleware_CoR.makeMove, Middleware_CoR.catchError,async (req: any, res: any) => {
    Controller.updateToken(req.bearer.email, +process.env.MOVE_COST!, res);
    await Controller.createMove(req.bearer.email, req.body.id_game, req.body.da_x, req.body.da_y, req.body.a_x, req.body.a_y, res);
});

//verifica lo stato di una partita specifica per id 
app.get('/show-game', Middleware_CoR.authentication, Middleware_CoR.catchError, (req: any, res: any) => {
    Controller.showGame(req.body.id_game, res);
});

//determina l'abbandono di un giocatore
app.post('/concede', Middleware_CoR.authentication, Middleware_CoR.gameState, Middleware_CoR.catchError,async (req: any, res: any) => {
    await Controller.concede(req.bearer.email, req.body.id_game, res);
});
// Rotta che restituisce lo storico mosse di una partita salvandone i risultati su files
app.get('/game-log', Middleware_CoR.authentication, Middleware_CoR.gameLog, Middleware_CoR.catchError, (req: any, res: any) => {
    Controller.getLog(req.body.id_game, req.body.path, req.body.format, res);
});


//crea rotta che restituisce lista giochi fatti entro un certo set di date ordinato per data inizio in modo crescente o decrescente
//salva su files i risultati della ricerca
app.get('/games-per-date', Middleware_CoR.authentication, Middleware_CoR.userStats,Middleware_CoR.gameLog2,Middleware_CoR.leaderboard, Middleware_CoR.catchError,async (req: any, res: any) => {
   await Controller.getGamesPerDate(req.body.email, req.body.date_start, req.body.date_end,req.body.sort,req.body.path,req.body.format, res);});


//crea rotta che restituisce lista giochi fatti da un giocatore ordinato per numero di mosse totali in modo crescente o decrescente
//salva i risultati su files
app.get('/games-per-moves', Middleware_CoR.authentication, Middleware_CoR.gameLog2,Middleware_CoR.leaderboard, Middleware_CoR.catchError,async (req: any, res: any) => {
    await Controller.getGamesPerMoves(req.body.email,req.body.sort,req.body.path,req.body.format, res);});
    
//Gestione rotte invalide
app.get('*', Middleware.routeNotFound, Middleware_CoR.catchError);

app.post('*', Middleware.routeNotFound, Middleware_CoR.catchError);

app.listen(3000, () => {
    console.log('The application is running on localhost:3000!');
});
