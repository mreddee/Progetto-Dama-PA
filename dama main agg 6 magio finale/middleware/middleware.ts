import * as jwt from 'jsonwebtoken';
import {ErrorEnum, getError} from '../factory/factory';
import * as Controller from '../controls/controller';
import moment from 'moment';
import { stringify } from 'querystring';


/**
* Check if the header is present in the request
* @param req -> client request
* @param res -> server response
* @param next -> next middleware
*/
export function checkHeader (req:any, res:any, next:any): void {
  
  const authHeader = req.headers.authorization;
  if (authHeader) {
      console.log("checkHeader")
      console.log("req:"+req.body);
      console.log("res:"+res.body);
      console.log(authHeader);
      next();
  }
  else {
      console.log(ErrorEnum.ErrTokenHeader)
      next();
  }
}


/**
* Check if the JWT is present in the request
* @param req -> client request
* @param res -> server response
* @param next -> next middleware
*/
export function checkToken(req: any, res: any, next: any): void {
  const bearerHeader = req.headers.authorization;
  if (typeof bearerHeader !== 'undefined') {
    const bearerToken = bearerHeader.split(' ')[1]; 
    req.token = bearerToken;
    console.log("checkToken")
    console.log("req:"+req);
    console.log("res:"+res);
    next();
  } 
  else {
    next(console.log(ErrorEnum.MissingToken));
  }
}

/**
* Check if the JWT secret key is correct
* @param req -> client request
* @param res -> server response
* @param next -> next middleware
*/
export function verifyAndAuthenticate(req: any, res: any, next: any): void {
  let decoded = jwt.verify(req.token, process.env.SECRET_KEY!); 
  if (decoded !== null)
    req.bearer = decoded;
    //console.log("verifyAndAutenticate")
    //console.log("req:"+req.bearerHeader);
    //console.log("res:"+res.body);
  next();
}


/**
* Check if the user making the request is an admin or not
* @param req -> client request
* @param res -> server response
* @param next -> next middleware
*/
export function checkAdmin(req: any, res: any, next: any): void {
  Controller.checkUser(req.bearer.email, res).then((user) => {
    console.log("CONTROLLO ESISTENZA UTENTE!");
    if (typeof user!=="undefined") {
      console.log("CONTROLLO ESISTENZA UTENTE RIUSCITA!");
      Controller.getRole(req.bearer.email, res).then((role: string) => {
        //if () {
        console.log("ROLE :"+role);
        if (role == 'admin@gmail.com') {
          console.log("CONTROLLO RUOLO ADMIN RIUSCITO!");
          next();
        }
        else {
          console.log("ERRORE! NON E' ADMIN!!");
          next(ErrorEnum.ErrNotAdmin);
        }
      });
    } 
    else {
      console.log("CONTROLLO RUOLO ADMIN FALLITO!");
      next(ErrorEnum.ErrCheckAdmin);
    }
  });
}


/**
* Check if the user the admin want to refill actually exist
* @param req -> client request
* @param res -> server response
* @param next -> next middleware
*/
export function checkUserExistRefill(req: any, res: any, next: any): void {
  Controller.checkUser(req.body.email, res).then((email) => {
    if (typeof email!=="undefined") {
      console.log("CONTROLLO ESISTENZA UTENTE DA RICARICARE RIUSCITO!");
      next();
    }
    else {
      console.log("RICARICA TOKEN FALLITA!!");
      next(ErrorEnum.ErrUser);
    }
  })
}
  
  
/**
* Check if the JSON payload in the request is a valid JSON
* @param req -> client request
* @param res -> server response
* @param next -> next middleware
*/
export function checkJSONPayload(req: any, res: any, next: any): void {
  try {
    req.body = JSON.parse(JSON.stringify(req.body));
    next();
  } 
  catch (error) {
    next(ErrorEnum.MalformedPayload);
  }
}


/**
* Log the error message
* @param err -> error
* @param req -> client request
* @param res -> server response
* @param next -> next middleware
*/
export function logErrors(err: any, req: any, res: any, next: any): void {
  const new_err = getError(err).getMsg();
  console.log("SONO IN ERRORE!")
  console.log(new_err);
  next(new_err);  
}


/**
* Returns the error message and status code to the client as a response 
* @param err -> error
* @param req -> client request
* @param res -> server response
* @param next -> next middleware
*/
export function errorHandler(err: any, req: any, res: any, next: any): void {
  console.log("GESTIONE ERRORE!");
  res.status(err.status).json({error: err.status, message: err.msg});
  console.log(res.status)
}

 
/**
* Check if the header content-type is a JSON
* @param req -> client request
* @param res -> server response
* @param next -> next middleware
*/
export function checkPayloadHeader(req: any, res: any, next: any): void {
  if (req.headers["content-type"] == "application/json") { 
    console.log("This is req " + req.content); next(); 
  }
  else next(ErrorEnum.ErrPayloadHeader);
}
  
  
/**
* Check if the user making the request exist or not
* @param req -> client request
* @param res -> server response
* @param next -> next middleware
*/
export function checkUserExist(req: any, res: any, next: any): void {
  Controller.checkUser(req.bearer.email, res).then((email) => {
    if (typeof email !=="undefined") {
      console.log("checkUserExist");
      console.log(req.bearer.email);
      console.log(email);
      console.log("CONTROLLO SUPERATO!!")
      next();
    }
    else next(ErrorEnum.ErrUser);
  })
}


/**
* Check if the opponent player exist
* @param req -> client request
* @param res -> server response
* @param next -> next middleware
*/
export function checkOpponentExist(req: any, res: any, next: any): void {
  Controller.checkUser(req.body.player2, res).then((player2) => {
    if (typeof player2 !== "undefined") {
      console.log("checkOpponentExist");
      next();
    }
    else next(ErrorEnum.ErrUser);
  })
}
  

/**
* Manages invalid routes
* @param req -> client request
* @param res -> server response
* @param next -> next middleware
*/
export function routeNotFound(req: any, res: any, next: any): void{
  next(ErrorEnum.ErrRouteNotFound);
}


/**
* Check if the player making the request has enough token
* @param req -> client request
* @param res -> server response
* @param next -> next middleware
*/
export function checkRemainingToken(req: any, res: any, next: any): void {
  Controller.getToken(req.bearer.email, res).then((token) => {
      if (token >= 0.35) {
        console.log("checkRemainingToken");
        next();
      }
      else {
        next(ErrorEnum.ErrInsufficientToken);
      }
  })
}


/**
* Check if the user creating a game doesn't have an ongoing match 
* @param req -> client request
* @param res -> server response
* @param next -> next middleware
*/
export function checkUserGame(req: any, res: any, next: any,): void {
  let player: string = "player1";
  console.log("checkUserGame")
  Controller.checkGameInProgress(req.bearer.email, player).then((game) => {
    if (!game) {
      console.log("checkGameInProgress");
      next();
    }

    else next(ErrorEnum.ErrorGameInProgress, res);
  })
}



/**
* Check if the user is trying to start a game against himself 
* @param req -> client request
* @param res -> server response
* @param next -> next middleware
*/
export function checkSameUser(req: any, res: any, next: any): void {
  if (req.bearer.email !== req.body.player2) {
    console.log("checkSameUser")
    next();
  }
  else next(ErrorEnum.ErrorSamePlayer, res);
}

/**
* Check if the move is allowed
* @param req -> client request
* @param res -> server response
* @param next -> next middleware
*/
export function checkGameMove(req: any, res: any, next: any): void {
  Controller.checkGameMoveById(req.bearer.email, req.body.id, req.body.move.row, req.body.move.col).then((id) => {
    if (id) next();
    else next(ErrorEnum.ErrorMakeMove, res);
  })
}


/**
* Check if the game exist on DB
* @param req -> client request
* @param res -> server response
* @param next -> next middleware
*/
export function checkGameExist(req: any, res: any, next: any): void {
  Controller.checkGameExistById(req.body.id).then((id) => {
    if (id) {
      console.log("checkGameExist");
      next();
    }
    else {
      console.log("CONTROLLO ESISTENZA GIOCO FALLITO!")
      next(ErrorEnum.ErrorIdGame, res);
    }
  })
}

/**
* Check if the player doing the turn can do it
* @param req -> client request
* @param res -> server response
* @param next -> next middleware
*/
export function checkPlayerTurn(req: any, res: any, next: any): void {
  Controller.checkPlayerTurnById(req.body.id, req.bearer.email).then((id) => {
    if (id) next();
    else next(ErrorEnum.ErrorPlayerTrun, res);
  })
}

/**
* Check if the input dates are valid ones
* @param req -> client request
* @param res -> server response
* @param next -> next middleware
*/
export function checkDate(req: any, res: any, next: any): void {
  var dateFormats = ["YYYY-MM-DD", "MM-DD-YYYY", "YYYY/MM/DD", "MM/DD/YYYY"];
  let startDate: string = req.body.start_date;
  let endDate: string = req.body.end_date;

  let isStarValid: boolean = moment(startDate, dateFormats, true).isValid();
  let isEndValid: boolean = moment(endDate, dateFormats, true).isValid();

  if (isStarValid && isEndValid && moment(endDate).isSameOrAfter(startDate)) {
    next();
  }
  else {
  next(ErrorEnum.ErrorDateFormat, res);
  }
}


/**
* Check the sorting method, must be either ASC or DESC
* @param req -> client request
* @param res -> server response
* @param next -> next middleware
*/
export function checkSortMethod(req: any, res: any, next: any): void {
  if (req.body.sort === 'asc' || req.body.sort === 'desc') next();
  else next(ErrorEnum.ErrorSortMethod, res);
}
