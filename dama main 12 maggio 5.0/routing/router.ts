import express from 'express';
import * as Middleware_CoR from '../middleware/Middleware_CoR';
import * as Middleware from '../middleware/middleware';
import * as Controller from '../controls/controller';
const app=express();

app.use(express.json());

/**
 * Rotta di tipo POST che consente di creare una partita tramite token JWT.
 * AuthMiddleware.checkToken,
 */
// Route to begin a match OK
//trivia: sottrae i token solo al giocatore che chiede di creare partita
app.post('/create-game', Middleware_CoR.authentication, Middleware_CoR.beginMatch, Middleware_CoR.catchError, (req: any, res: any) => {
    Controller.updateToken(req.bearer.email, +process.env.MATCH_COST!, res);
    Controller.createGame(req.bearer.email, req.body.player2, req.body.dimensione, res);
});

// Route to refill a user's token OK
app.post('/refill', Middleware_CoR.authentication, Middleware_CoR.refill, Middleware_CoR.catchError, (req: any, res: any) => {
    Controller.refill(req.body.email, req.body.token, res);
    console.log("RICARICA DI "+req.body.email+" RIUSCITA!!");
});

// Utente stesso richiede il proprio credito OK
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

//controllare meccanica dama se funziona
//assunzioni: P1 neri e P2 bianchi
//a pezzo spostato anche se mangia termina il turno
//i pedoni se mangiano si spostano nel posto del pezzo che hanno mangiato
//errori nell'aggiornamento della leaderboard
//il calcolo della durata dà degli errori ---------------------------------
app.post('/make-move', Middleware_CoR.authentication, Middleware_CoR.makeMove, Middleware_CoR.catchError,async (req: any, res: any) => {
    Controller.updateToken(req.bearer.email, +process.env.MOVE_COST!, res);
    await Controller.createMove(req.bearer.email, req.body.id_game, req.body.da_x, req.body.da_y, req.body.a_x, req.body.a_y, res);
});

//verifica lo stato di una partita specifica per id 
//OK!
app.get('/show-game', Middleware_CoR.authentication, Middleware_CoR.catchError, (req: any, res: any) => {
    Controller.showGame(req.body.id_game, res);
});

//determina l'abbandono di un giocatore
//OK
//se leaderboard è assente il programma crasha, per ora ho inizializzato a valori 0 la classifica dei giocatori
//prevedere la sua creazione se leaderboard è inesistente
app.post('/concede', Middleware_CoR.authentication, Middleware_CoR.gameState, Middleware_CoR.catchError, (req: any, res: any) => {
    Controller.concede(req.bearer.email, req.body.id_game, res);
});
// Route that returns the game log containing all the moves made by players
//OK crea correttamente tutti i file e il contenuto è leggibile,  vedi se riesci a rendere più gradevole da leggere ABBELLIMENTO
app.get('/game-log', Middleware_CoR.authentication, Middleware_CoR.gameLog, Middleware_CoR.catchError, (req: any, res: any) => {
    Controller.getLog(req.body.id_game, req.body.path, req.body.format, res);
});

//modificato games in games-per-date
//creata rotta che restituisce lista giochi fatti entro un certo set di date ordinato per data inizio in modo crescente o decrescente OK
//implementata, generare richiesta postman e verificare correttezza
app.get('/games-per-date', Middleware_CoR.authentication, Middleware_CoR.userStats,Middleware_CoR.gameLog2,Middleware_CoR.leaderboard, Middleware_CoR.catchError,async (req: any, res: any) => {
   await Controller.getGamesPerDate(req.body.email, req.body.date_start, req.body.date_end,req.body.sort,req.body.path,req.body.format, res);});

//modificato games in games-per-moves
//creata rotta che restituisce lista giochi fatti da un giocatore ordinato per numero di mosse totali in modo crescente o decrescente OK
app.get('/games-per-moves', Middleware_CoR.authentication, Middleware_CoR.gameLog2,Middleware_CoR.leaderboard, Middleware_CoR.catchError,async (req: any, res: any) => {
    await Controller.getGamesPerMoves(req.body.email,req.body.sort,req.body.path,req.body.format, res);});
// Managing invalid routes
app.get('*', Middleware.routeNotFound, Middleware_CoR.catchError);
app.post('*', Middleware.routeNotFound, Middleware_CoR.catchError);

app.listen(3000, () => {
    console.log('The application is running on localhost:3000!');
});
