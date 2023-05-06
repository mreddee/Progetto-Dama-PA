import express from 'express';
import * as Middleware_CoR from '../middleware/Middleware_CoR';
import * as Middleware from '../middleware/middleware';
import * as Controller from '../controls/controller';
import * as utils from '../utils/utils';
//import { getGameById } from '../models/models';
import * as jwt from 'jsonwebtoken';
//Definire i middleware di controller, routing, gestione errore e controlla i modelli
const app=express();

app.use(express.json());

/**
 * Rotta di tipo POST che consente di creare una partita tramite token JWT.
 * AuthMiddleware.checkToken,
 */
// Route to begin a match with another player or AI
app.post('/create-game', Middleware_CoR.authentication, Middleware_CoR.beginMatch, Middleware_CoR.catchError, (req: any, res: any) => {
    Controller.updateToken(req.bearer.email, +process.env.MATCH_COST!, res);
    Controller.createGame(req.bearer.email, req.body.player2, req.body.dimensione, res);
});


// Managing invalid routes
app.get('*', Middleware.routeNotFound, Middleware_CoR.catchError);
app.post('*', Middleware.routeNotFound, Middleware_CoR.catchError);


app.listen(3000, () => {
    console.log('The application is running on localhost:8080!');
});