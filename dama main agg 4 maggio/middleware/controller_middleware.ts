import * as Controller from "../controls/controller";
import { ErrorEnum } from "../responses/error";
import * as models from "../models/models";
import { Utils } from "sequelize";
import * as utils from"../utils/utils"

/**
 * Verifica che gli utenti specificati all'atto di creazione di una partita esistano effettivamente nel database, 
 * attraverso il metodo del Controller, e siano diversi tra loro.
 */
export function checkUsersExistence(req: any, res: any, next: any): void {
    models.checkIfUsersExist(req.bearer.email, res).then((email) => {
      if (email) next();
      else next(ErrorEnum.MatchingUsers);
    })
  }

export function checkUsersTokens(req: any, res: any, next: any) : void {
    Controller.checkIfUsersHaveTokens(req.body.email1, req.body.email2, res).then((check: any) => {
        if(check) {
            console.log("checkUsersTokens: SUCCESS");
            next();
        } else {
            console.log("checkUsersTokens: FAIL");
            next(ErrorEnum.InsufficientTokens);
        }
    })
}

export function checkRemainingToken(req: any, res: any, next: any): void {
    utils.getUserTokens(req.bearer.email, res).then((token) => {
        if (token >= 0.4) next();
        else next(ErrorEnum.InsufficientTokens);
    })
  }

/**
 * Verifica che l'utente specificato per il rifornimento di token esista effettivamente.
 */
export function checkUserExistence(req: any, res: any, next: any) : void {
    if(typeof req.body.email === 'string' && req.body.email !== "" && req.body.email !== null) {
        //da fare la funzione di controllo per l'esistenza del giocatore
        models.checkIfUserExists(req.body.email, res).then((check) => {//da definire il response
            if(check) {
                console.log("checkUserExistence: SUCCESS");
                next();
            } else {
                console.log("checkUserExistence: FAIL");
                next(ErrorEnum.NotExistingUser);
            }
        })
    } else {
        console.log("checkUserExistence: FAIL");
        next(ErrorEnum.InvalidEmail);
    }
}
/**
 * Verifica che gli utenti specificati all'atto di creazione di una partita non stiano già giocando in un'altra
 * partita, attraverso il metodo del Controller.
 */
export function checkUsersState(req: any, res: any, next: any) : void {
    utils.checkIfUsersArePlaying(req.body.email1, req.body.email2, res).then((check) => {
        if(check) {
            console.log("checkUsersState: SUCCESS");
            next();
        } else {
            console.log("checkUsersState: FAIL");
            next(ErrorEnum.AlreadyPlaying);
        }
    })
}