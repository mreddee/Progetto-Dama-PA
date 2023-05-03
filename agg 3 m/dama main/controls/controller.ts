import * as models from "../models/models"
import * as utils from "../utils/utils"
import { Success } from '../responses/success';
import { ErrorEnum, ErrorFactory } from "../responses/error";
/**
 * Funzione generatrice del gioco, parametri:
 * @email1 giocatore 1
 * @email2 giocatore 2
 * @dimensione dimensione della damiera
 */



export async function createGame(player1: string,
    player2: string,
    dimensione: number,
    res: any):Promise<any>{
    let logMoves: any={
        "moves": []
    };
    var campo: string = new utils.Damiera(dimensione).damieraToJSON();
    const todayDate = new Date().toISOString().slice(0, 10);
    var pieces1=new utils.Damiera(dimensione).pezziBianchi.length
    var pieces2=pieces1
    //da definire il body
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
            board: campo,
            log_mosse: logMoves
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
            //
            dimensione: dimensione,
            board: campo,
            log_mosse: logMoves
        });
    }
    catch(error){
        generateControllerErrors(ErrorEnum.InternalServer, error, res);
    }
}

function generateControllerErrors(error_enum: ErrorEnum, err: Error, res: any) {
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

