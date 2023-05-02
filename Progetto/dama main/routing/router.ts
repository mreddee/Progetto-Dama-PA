import * as express from 'express';
import * as AuthMiddleware from '../middleware/auth_middleware';
import * as RouteMiddleware from '../middleware/route_middleware';
import * as ControllerMiddleware from '../middleware/controller_middleware';
import * as ErrorHandlerMiddleware from '../middleware/error_handling_middleware';
import * as Controller from '../controls/controller';
import * as utils from '../utils/utils';
//import { getGameById } from '../models/models';
import * as jwt from 'jsonwebtoken';
//Definire i middleware di controller, routing, gestione errore e controlla i modelli
const app=express();

app.use(express.json());

/**
 * Rotta di tipo POST che consente di creare una partita tramite token JWT.
 */
app.post('/create_game',
    AuthMiddleware.checkAuthHeader,
    AuthMiddleware.checkToken,
    AuthMiddleware.verifySecretKey,
    AuthMiddleware.authenticateUser,
    (req: any, res: any, next: any) => {
        //Aggiorno il body
        let decoded = JSON.parse(JSON.stringify(jwt.decode(req.token)));
        //definire nei controlli il corpo del request
        req.body.player1 = decoded.richiedente;
        next();
    },
    RouteMiddleware.checkEmails,
    RouteMiddleware.checkGridSize,
    ControllerMiddleware.checkUsersExistence,//da fare
    ControllerMiddleware.checkUsersTokens,
    ControllerMiddleware.checkUsersState,
    ErrorHandlerMiddleware.errorHandler,
    (req: any, res: any) => {
        //da fare
        Controller.createGame(player1, player2, moves1, moves2, duration, pieces1, pieces2, dimensione, res).then(() => {
            console.log("Partita creata!");
        })
    }
);

app.post('/refill_tokens',
    AuthMiddleware.checkAuthHeader,
    AuthMiddleware.checkToken,
    AuthMiddleware.verifySecretKey,
    AuthMiddleware.authenticateAdmin,
    ControllerMiddleware.checkUserExistence,//da fare
    RouteMiddleware.checkTokens,
    ErrorHandlerMiddleware.errorHandler,
    (req: any, res: any) => {
        Controller.refillTokens(req, res).then(() => {
            console.log("Ricarica dei token effettuata con successo");
        })
    }
);

app.get('/leaderboard', 
    RouteMiddleware.checkOrder,
    RouteMiddleware.checkBy,
    ErrorHandlerMiddleware.errorHandler,
    (req: any, res: any) => {
        utils.returnLeaderboard(req.query, res).then(() => {//definire response
        console.log("Classifica dei giocatori restituita.");
        })
    }
);




/** 
 * Gestione delle rotte non previste
 */ 
app.get('*',
(req: any, res: any) => {
    res.status(404).json({"status": 404, "error": "Not Found - This route doesn't exist"});
});

app.post('*',
(req: any, res: any) => {
    res.status(404).json({"status": 404, "error": "Not Found - This route doesn't exist"});
});

app.listen(8080);