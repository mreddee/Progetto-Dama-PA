import * as jwt from 'jsonwebtoken';
import {ErrorEnum, getError} from '../factory/factory';
import * as Controller from '../controls/controller';
import moment from 'moment';


/**
* Controlla se la richiesta ha una testa (header)
* @param req richiesta client
* @param res risposta server
* @param next passaggio al prossimo middleware
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
* Controlla la presenza del token JWT nell'intestazione della richiesta
* @param req richiesta client
* @param res richiesta server
* @param next prossimo middleware
*/
export function checkToken(req: any, res: any, next: any): void {
  const bearerHeader = req.headers.authorization;
  if (typeof bearerHeader !== 'undefined') {
    const bearerToken = bearerHeader.split(' ')[1]; 
    req.token = bearerToken;
    console.log("checkToken")
    next();
  } 
  else {
    next(console.log(ErrorEnum.MissingToken));
  }
}

/**
* Controlla la corretteza della chiave JWT
* @param req richiesta client
* @param res risposta server
* @param next prossimo middleware
*/
export function verifyAndAuthenticate(req: any, res: any, next: any): void {
  let decoded = jwt.verify(req.token, process.env.SECRET_KEY!); 
  if (decoded !== null)
    console.log("VERIFY AND AUTH OK");
    req.bearer = decoded;
  next();
}


/**
* Controlla se la richiesta provenga da un admin o meno
* @param req richiesta client
* @param res risposta server
* @param next prossimo middleware
*/
export function checkAdmin(req: any, res: any, next: any): void {
  Controller.checkUser(req.bearer.email, res).then((user) => {
    console.log("CONTROLLO ESISTENZA UTENTE!");
    if (typeof user!=="undefined") {
      console.log("CONTROLLO ESISTENZA UTENTE RIUSCITA!");
      Controller.getRole(req.bearer.email, res).then((role: string) => {
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
* Controlla se l'utente a cui admin vuole ricaricare i tolen esista
* @param req richiesta client
* @param res risposta server
* @param next prossimo middleware
*/
export function checkUserExistRefill(req: any, res: any, next: any): void {
  Controller.checkUser(req.body.email, res).then((email) => {
    if (typeof email!=="undefined") {
      console.log("CONTROLLO ESISTENZA UTENTE DA RICARICARE RIUSCITO!");
      next();
    }
    else {
      console.log("UTENTE DA RICARICARE INESISTENTE!!");
      next(ErrorEnum.ErrUser);
    }
  })
}

/**
 * Controlla se il valore inserito per la ricarica token sia valido
 * @param req richiesta client
 * @param res risposta server
 * @param next passaggio prossimo middleware della catena
 */
export function checkTokenOk(req: any, res: any, next: any): void {
  if (req.body.token>= 0.00) {
    console.log("VALORE DI AGGIORNAMENTO TOKEN VALIDO");
    next();
  }
  else {
    console.log("ERRORE RILEVATO NELL'AGGIORNAMENTO DEI TOKEN")
    next(ErrorEnum.ErrInsufficientToken);
  }
}

  
/**
* Restituisce il log dell'errore
* @param err errore 
* @param req richiesta client
* @param res risposta server
* @param next prossimo middleware
*/
export function logErrors(err: any, req: any, res: any, next: any): void {
  const new_err = getError(err).getMsg();
  console.log("SONO IN ERRORE!")
  console.log(new_err);
  next(new_err);  
}


/**
* Restituisce al client il messaggio di errore e lo status
* @param err errore
* @param req richiesta client
* @param res richiesta server
* @param next middlware successivo
*/
export function errorHandler(err: any, req: any, res: any, next: any): void {
  console.log("GESTIONE ERRORE!");
  res.status(err.status).json({error: err.status, message: err.msg});
  console.log(res.status)
} 
/**
* Controlla se la richiesta provenga da un utente
* @param req richiesta client
* @param res risposta server
* @param prossimo middleware successivo
*/
export function checkUserExist(req: any, res: any, next: any): void {
  Controller.checkUser(req.bearer.email, res).then((email) => {
    if (typeof email !=="undefined") {
      console.log("checkUserExist");
      console.log("CONTROLLO SUPERATO!!")
      next();
    }
    else next(ErrorEnum.ErrUser);
  })
}


/**
* Controlla se l'avversario di partita esiste
* @param req richiesta client
* @param res risposta server
* @param next prossimo middleware
*/
export function checkOpponentExist(req: any, res: any, next: any): void {
  Controller.checkUser(req.body.player2, res).then((player2) => {
    if (typeof player2 !== "undefined") {
      console.log("CONTROLLO ESISTENZA AVVERSARIO");
      next();
    }
    else next(ErrorEnum.ErrUser);
  })
}

  

/**
* Gestisce le richieste a rotte impreviste
* @param req richiesta client
* @param res risposta server
* @param prossimo middleware successivo
*/
export function routeNotFound(req: any, res: any, next: any): void{
  next(ErrorEnum.ErrRouteNotFound);
}


/**
* Controlla se il giocatore ha abbastanza token per creare la partita
* @param req richiesta client
* @param res risposta server
* @param prossimo middleware successivo
*/
export async function checkRemainingToken(req: any, res: any, next: any): Promise<void> {
  await Controller.getToken(req.bearer.email, res).then((token) => {
      if (token >= 0.35) {
        console.log("HAI ABBASTANZA TOKEN PER CREARE PARTITA");
        next();
      }
      else {
        next(ErrorEnum.ErrInsufficientToken);
      }
  })
}
/**
 * Controllo se l'utente ha abbastanza token per controllare il proprio credito
 * @param req richiesta client
 * @param res risposta server
 * @param next prossimo middleware
 */
export function checkRemainingToken2(req: any, res: any, next: any): void {
  Controller.getToken(req.bearer.email, res).then((token) => {
      if (token >= 0.00) {
        console.log("VISUALIZZAZIONE TOKEN RIMANENTI");
        next();
      }
      else {
        next(ErrorEnum.ErrInsufficientToken);
      }
  })
}


/**
* Controlla se l'utente che richiede la creazione partita non stia già giocando
* @param req richiesta client
* @param res risposta server
* @param next prossimo middleware
*/
export function checkUserGame(req: any, res: any, next: any,): void {
  let player: string = "player1";
  Controller.checkGameInProgress(req.bearer.email, player).then((game) => {
  if (!game) next();
  else next(ErrorEnum.ErrorGameInProgress, res);
  })
}
/**
 * Controlla se l'avversario con il quale si vuole giocare sia impegnato
 * @param req richiesta client
 * @param res risposta server
 * @param next prossimo middleware
 */
export function checkUserGame2(req: any, res: any, next: any,): void {
  let player: string = "player2";
  Controller.checkGameInProgress(req.bearer.email, player).then((game) => {
  if (!game) next();
  else next(ErrorEnum.ErrorGameInProgress, res);
  })
}



/**
* Controlla se l'utente sta cercando di giocare con sè stesso
* @param req richiesta client
* @param res -> risposta server
* @param next -> prossimo middleware
*/
export function checkSameUser(req: any, res: any, next: any): void {
  if (req.bearer.email !== req.body.player2) {
    console.log("checkSameUser")
    next();
  }
  else next(ErrorEnum.ErrorSamePlayer, res);
}

/**
* Controllo leggitimità mossa
* @param req -> richiesta client
* @param res -> risposta server
* @param next -> prossimo middleware
*/
export function checkGameMove(req: any, res: any, next: any): void {
  Controller.checkMove(req.bearer.email, req.body.id_game, req.body.da_x, req.body.da_y,req.body.a_x, req.body.a_y).then((id) => {
    if (id) next();
    else next(ErrorEnum.ErrorMakeMove, res);
  })
}


/**
* Controllo esistenza gioco nel database
* @param req -> richiesta client
* @param res -> risposta server
* @param next -> prossimo middleware
*/
export async function checkGameExist(req: any, res: any, next: any): Promise<void> {
  await Controller.checkGameExistById(req.body.id_game).then((id) => {
    if (id) {
      console.log("IL GIOCO ESISTE!");
      next();
    }
    else {
      console.log("CONTROLLO ESISTENZA GIOCO FALLITO!")
      next(ErrorEnum.ErrorIdGame, res);
    }
  })
}
/**
* Controlla se il gioco esiste ed è ancora in corso
* @param req -> richiesta client
* @param res -> risposta server
* @param next -> prossimo middleware
*/
export function checkGameRunning(req: any, res: any, next: any): void {
  Controller.checkGameRunningById(req.body.id_game).then((id) => {
    if (id) {
      console.log("PARTITA IN CORSO TROVATA");
      next();
    }
    else {
      console.log("IL GIOCO E' GIA' TERMINATO!")
      next(ErrorEnum.ErrorIdGame, res);
    }
  })
}

/**
* Controlla se il giocatore può fare la propria mossa, controllo turno
* @param req -> richiesta client
* @param res -> risposta server
* @param next -> prossimo middleware
*/
export function checkPlayerTurn(req: any, res: any, next: any): void {
  Controller.checkPlayerTurnById(req.body.id_game, req.bearer.email).then((id) => {
    if (id) next();
    else next(ErrorEnum.ErrorPlayerTrun, res);
  })
}

/**
* Controlla la validità del formato della data di ricerca
* @param req -> richiesta client
* @param res -> risposta server
* @param next -> prossimo middleware
*/
export function checkDate(req: any, res: any, next: any): void {
  var dateFormats = ["YYYY-MM-DD", "MM-DD-YYYY", "YYYY/MM/DD", "MM/DD/YYYY"];
  let startDate: string = req.body.date_start;
  let endDate: string = req.body.date_end;

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
* Controlla la correttezza del criterio di ricerca impostato, deve essere asc o desc
* @param req -> richiesta client
* @param res -> risposta server
* @param next -> prossimo middleware
*/
export function checkSortMethod(req: any, res: any, next: any): void {
  if (req.body.sort === 'asc' || req.body.sort === 'desc') next();
  else next(ErrorEnum.ErrorSortMethod, res);
}
