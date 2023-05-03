import { ErrorEnum } from "../responses/error";
import * as jwt from 'jsonwebtoken';

export function checkEmails(req: any, res: any, next: any): void {
        if(
            (typeof req.body.email1 === 'string' && (req.body.email1 !== null) && (req.body.email1 !== ""))
            && (typeof req.body.email2 === 'string' && (req.body.email2 !== null) && (req.body.email2 !== ""))
        ) {
            console.log("checkEmails: SUCCESS");
            next();
        } else {
            console.log("checkEmails: FAIL");
            next(ErrorEnum.InvalidNumberOfEmails);
    } 
}

/**
 * Verifica che la richiesta di creazione di una partita contenga una dimensione della griglia ammissibile (da 3 a 8).
 */
 export function checkGridSize(req: any, res: any, next: any): void {
    if([4, 6, 8].includes(req.body.grid_size)) {
        console.log("checkGameFieldSize: SUCCESS");
        next();
    } else {
        console.log("checkGameFieldSize: FAIL");
        next(ErrorEnum.InvalidGridSize);
    }
}
/**
 * Verifica che la richiesta di ricarica dei token di un utente contenga il parametro corrispondente ai token di 
 * tipo numerico.
 */
export function checkTokens(req:any, res: any, next: any): void {
    if(typeof req.body.tokens === 'number' && req.body.tokens>0 && req.body.tokens<=100) {
        console.log("checkTokens: SUCCESS");
        next();
    } else {
        console.log("checkTokens: FAIL");
        next(ErrorEnum.InvalidTokens);
    }
}
/*
 * Verifica che la richiesta di consultazione della classifica dei giocatori contenga il parametro by correttamente. 
 */
export function checkBy(req:any, res: any, next: any): void {
    if(req.query.by === 'date_start' || req.query.by === 'movescount') {
        console.log("checkBy: SUCCESS");
        next();
    } else {
        console.log("checkBy: FAIL");
        next(ErrorEnum.InvalidBy);
    }
}
/**
 * Verifica che la richiesta di consultazione della classifica dei giocatori contenga il parametro order correttamente. 
 */
export function checkOrder(req:any, res: any, next: any): void {
    if(req.query.order === 'asc' || req.query.order === 'desc') {
        console.log("checkOrder: SUCCESS");
        next();
    } else {
        console.log("checkOrder: FAIL");
        next(ErrorEnum.InvalidOrder);
    }
}