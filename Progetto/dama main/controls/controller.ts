import * as models from "../models/models"
import * as utils from "../utils/utils"
/**
 * Funzione generatrice del gioco, parametri:
 * @email1 giocatore 1
 * @email2 giocatore 2
 * @dimensione dimensione della damiera
 */



export async function createGame(player1: string,
    player2: string,
    //stesso problema di movesW
    moves1: number,
    moves2: number,
    //fintanto che non c'è un vincitore movesW è NULL, verificare vada bene il tipo
    duration: number,
    pieces1: number,
    pieces2: number,
    dimensione: number,
    res: any):Promise<any>{
    let logMoves: any={
        "moves": []
    };
    var campo: string = new utils.Damiera(dimensione).damieraToJSON();
    const todayDate = new Date().toISOString().slice(0, 10);
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
            moves1: moves1,
            moves2: moves2,
            duration: duration,
            pieces1: pieces1,
            pieces2: pieces2,
            abbandono1: false,
            abbandono2: false,
            //
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
            moves1: moves1,
            moves2: moves2,
            duration: duration,
            pieces1: pieces1,
            pieces2: pieces2,
            abbandono1: false,
            abbandono2: false,
            //
            dimensione: dimensione,
            board: campo,
            log_mosse: logMoves
        }),
    
    catch(error){
        controllerErrors(ErrorEnum.ErrServer, error, res),
    }
}

}