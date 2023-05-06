import * as models from "../models/models"
import * as utils from "../utils/utils"
import { ErrorEnum, getError, Success } from '../factory/factory';
import { Utils } from "sequelize";
/**
 * Funzione generatrice del gioco, parametri:
 * @email1 giocatore 1
 * @email2 giocatore 2
 * @dimensione dimensione della damiera
 */

export async function createGame(player1:string, player2:string, dimensione:number, res: any): Promise<any>{

    const todayDate = new Date().toISOString().slice(0, 10);
    var pieces1=new models.Damiera(dimensione).pezziBianchi.length;
    var pieces2=pieces1;
    
    try {
        //crea l'oggetto damiera e la inizializza, correggere errore di istanziazione oggetto
        let campo: string = new models.Damiera.damieraToJSON(dimensione);
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
        console.log("CREAZIONE PARTITA RIUSCITA!!")
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
    } catch(error){
        controllerErrors(ErrorEnum.ErrServer, error, res);
    }
    
}


export function updateToken(email: string, cost: number, res: any): void {
    getToken(email, res).then((token) => { 
        token = token - cost;
        console.log("INIZIO PARTE SOSPETTA");
        //token = Math.round((token + Number.EPSILON) * 100) / 100;//DA CAPIRE COSA FA QUI
        console.log("PARTE SOSPETTA PASSATA");
        models.Users.update({ token: token }, { where: { email: email } });
        console.log("Remaining token: " + (token));
     }).catch((error) => {
            console.log("ERRORE NELL'AGGIORNAMENTO TOKEN!!!")
            controllerErrors(ErrorEnum.ErrServer, error, res);
        })
}


export async function getToken(email: string, res: any): Promise<number> {
    let result: any;
    try {
        result = await models.Users.findByPk(email, { raw: true });
    } catch (error) {
        controllerErrors(ErrorEnum.ErrServer, error, res);
    };
    return result.token;
}

function controllerErrors(enum_error: ErrorEnum, err: any, res: any, msgParameter?: string): void {
    const new_err = getError(enum_error).getMsg();
    console.log(err);
    res.status(new_err.status).json({ error: new_err.status, message: new_err.msg });
}

export async function checkUser(email: string, res: any): Promise<boolean> {
    let result: any;
    try {
        console.log("CONTROLLO GIOCATORE IN CORSO");
        result = await models.Users.findByPk(email, { raw: true });
    } catch (error) {
        console.log("CONTROLLO GIOCATORE FALLITO!!");
        controllerErrors(ErrorEnum.ErrServer, error, res);
    }
    return result;
}

/**
 * Returns user role
 * @param email -> user email
 * @param res -> response
 * @returns -> user role (admin/user)
 */
export async function getRole(email: string, res: any): Promise<string> {
    let result: any;
    try {
        result = await models.Users.findByPk(email, { raw: true });
    } catch (error) {
        controllerErrors(ErrorEnum.ErrServer, error, res);
    }
    return result.role;
}

/**
 * Check if a user has an ongoing game
 * @param email -> user email
 * @param player -> user email
 * @returns 
 */
export async function checkGameInProgress(email: string, player: string): Promise<boolean> {
    let result: any;
    let inprogress: boolean = true;//da vedere se si ferma a causa del boolean
    result = await models.Game.findOne({where: {[player]: email, in_progress: inprogress}});
    return result;
}

/**
 * Given a game id, check if the move is allowed
 * @param email -> player email
 * @param id -> game id
 * @param row -> row coordinate
 * @param col -> col coordinate
 * @returns -> true if the move is allowed, false otherwise
 */
export async function checkGameMoveById(email: string, id: string, row: number, col: number): Promise<boolean> {
    let game: any;
    let status: string = 'in progress';

    game = await models.Game.findOne({where: {id: id, game_status: status}});
    
    // if the game does not exist there's no need to check further
    if(!game) {
        return false;
    };

    // check if the move's coordinate are within the game grid
    if(row < 0 || col < 0 || row >= game.grid_dim || col >= game.grid_dim) {
        return false;
    };

    // check if the move has already been made
    if(game.player1 === email && game.grids.grid2[row][col] !== 'X' && game.grids.grid2[row][col] !== 'O') {
        return true;
    }
    else if(game.player2 === email && game.grids.grid1[row][col] !== 'X' && game.grids.grid1[row][col] !== 'O') {
        return true;
    }
    else return false;
}

/**
 * Check if a game exist in db given its id
 * @param id -> game id
 * @returns -> true if the game exist, false otherwise
 */
export async function checkGameExistById(id: string): Promise<boolean> {
    let result: any;
    result = await models.Game.findByPk(id, { raw: true });
    return result;
}

/**
 * Check if the player attempting the move can do it
 * @param id -> game id
 * @param email -> user email
 * @returns -> true if is the player turn, false otherwise
 */
export async function checkPlayerTurnById(id:string, email: string): Promise<boolean> {
    let result: any;
    result = await models.Game.findByPk(id, {raw: true});
    if (result.player_turn === email) return true;
    else return false;
}
