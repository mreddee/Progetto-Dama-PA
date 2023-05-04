import * as models from "../models/models"
import * as utils from "../utils/utils"
import { Success } from '../responses/success';
import { ErrorEnum, ErrorFactory } from "../responses/error";
import { Utils } from "sequelize";
/**
 * Funzione generatrice del gioco, parametri:
 * @email1 giocatore 1
 * @email2 giocatore 2
 * @dimensione dimensione della damiera
 */



export async function createGame(player1:string, player2:string, dimensione:number, res: any): Promise<any>{

    var campo: string = new utils.Damiera(dimensione).damieraToJSON();
    const todayDate = new Date().toISOString().slice(0, 10);
    var pieces1=new utils.Damiera(dimensione).pezziBianchi.length
    var pieces2=pieces1
    
    try {
        //crea l'oggetto damiera e la inizializza, correggere errore di istanziazione oggetto
        //let campo: models.Damiera= await models.getDamiera(dim),
        await models.Game.create({
            player1: player1,
            player2: player2,
            in_progress: true,
            date_start: todayDate,
            player_turn: player1,
            pieces1: pieces1,
            pieces2: pieces2,
            abbandono1: false,
            abbandono2: false,
            dimensione: dimensione,
            board: campo
        });

        res.status(200).json({
            status: 200,
            player1: player1,
            player2: player2,
            in_progress: true,
            date_start: todayDate,
            player_turn: player1,
            pieces1: pieces1,
            pieces2: pieces2,
            abbandono1: false,
            abbandono2: false,
            dimensione: dimensione,
            board: campo
        });
    } catch(error: any){
        generateControllerErrors(ErrorEnum.InternalServer, error, res);
    }
    
}

export function generateControllerErrors(error_enum: ErrorEnum, _err: Error, res: any) {
    const errorFactory = new ErrorFactory();
    const error = errorFactory.getError(error_enum);
    res.status(error.getStatus()).json({
        status: error.getStatus(),
        error: error.getMsg()
    });
}

export function refillTokens(email: string, token: number, res: any): any {
    models.Users.update({ token: token }, { where: { email: email } })
        .then(() => {
            const new_res = new Success().getMsg();
            res.status(new_res.status).json({ status: new_res.status, message: new_res.msg });
        })
        .catch((error) => {
            generateControllerErrors(ErrorEnum.InternalServer, error, res);
        })
}

export async function checkIfUsersHaveTokens(email1: string, email2: string, res: any): Promise<boolean> {
    let tokens1: number;
    let tokens2: number;
    let check: boolean = false;

    try {
        tokens1 = await utils.getUserTokens(email1, res);
        tokens2 = await utils.getUserTokens(email2, res);
        check = (tokens1 >= 0.4) && (tokens2 >= 0.4);
        
    } catch(e: any) {
        generateControllerErrors(ErrorEnum.InternalServer, e, res);
    }

    return check;
}


export function updateToken(email: string, cost: number, res: any): any {
    getToken(email, res).then((token: any) => { 
        token = token - cost;
        token = Math.round((token + Number.EPSILON) * 100) / 100;
        models.Users.update({ token: token }, { where: { email: email } });
        console.log("Remaining token: " + (token));
     }).catch((error) => {
        generateControllerErrors(ErrorEnum.InternalServer, error, res);
     })
}


export async function getToken(email: string, res: any): Promise<void> {
    let result: any;
    try {
        result = await models.Users.findByPk(email, { raw: true });
    } catch (error:any) {
        generateControllerErrors(ErrorEnum.InternalServer, error, res);
    }

    return result.token;
}
