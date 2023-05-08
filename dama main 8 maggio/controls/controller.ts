import * as models from "../models/models"
import * as utils from "../utils/utils"
import { ErrorEnum, getError, Success } from '../factory/factory';
import { Op, Utils, where } from "sequelize";
import { query } from "express";
import path from 'path';
/**
 * Funzione generatrice del gioco, parametri:
 * @email1 giocatore 1
 * @email2 giocatore 2
 * @dimensione dimensione della damiera
 */

export async function createGame(player1:string, player2:string, dimensione:number, res: any): Promise<any>{
    let campo: models.Damiera;
    campo=new models.Damiera.damiera(dimensione);
    let field: string=JSON.stringify(campo);//ottengo il json dell'oggetto da inserire nel database
    //esempio di inizializzazione di una cella del campo da gioco
    campo.damiera[1][1]={
        r:1,
        c:1,
        occupied: true,
        occupiedby: "1N",
        faction: "N",
        dama: false
    }
    campo=JSON.parse(field);//mi riottengo il campo da poter manipolare nel codice


    type stringArray3 = {
        board: [any[],any[],any[],any[]]
    };

    type stringArray5 = {
        board: [any[],any[],any[],any[],any[],any[]]
    };

    type stringArray7 = {
        board: [any[],any[],any[],any[],any[],any[],any[],any[]]
    };

    var board: any;
    if (dimensione==3) {board = {board: [[],[],[],[]]}};
    if (dimensione==5) {board = { board: [[],[],[],[],[],[]]}};
    if (dimensione==7) {board = { board: [[],[],[],[],[],[],[],[]]}};

    var pieces: number = utils.piecesnumber(dimensione);

    const todayDate = new Date().toISOString().slice(0, 10);
    
    
    try {
        await models.Game.create({
            player1: player1,
            player2: player2,
            in_progress: true,
            date_start: todayDate,
            date_end: null,
            player_turn: player1,
            moves1: 0,
            moves2: 0,
            winner: null,
            pieces1: pieces,
            pieces2: pieces,
            abbandono1: false,
            abbandono2: false,
            dimensione: dimensione,
            board: campo
            //board: field
        });
        //aggiorna lo stato dei giocatori della partita appena creata in occupati
        await models.Users.update({ isplaying: true }, { where: [{ email: player1 },{ email: player2 }] });

        console.log("CREAZIONE PARTITA RIUSCITA!!")
        res.status(200).json({
            status: 200,
            player1: player1,
            player2: player2,
            dimensione: dimensione
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

export function showToken(email: string, res: any): void {
    console.log(models.Users.findByPk(email, { raw: true }));
    models.Users.findByPk(email, { raw: true }).then((item: any) => {
        res.send("Remaining token: " + item.token);
    }).catch((error) => {
        controllerErrors(ErrorEnum.ErrServer, error, res);
    })
}

export async function showTokenAdmin( tokenlimit:number, res: any): Promise<void> {

    let userList : any;
    try {
        userList = await utils.showUserLimitToken(tokenlimit);
    } catch (error) {
        controllerErrors(ErrorEnum.ErrServer, error, res);
        
    }
    //console.log(userList);
    res.status(200).json({
        status: 200,
        userList
    });
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
        console.log("RISULTATO QUERY:"+result[1]);
    } catch (error) {
        console.log("CONTROLLO RUOLO FALLITO!");
        controllerErrors(ErrorEnum.ErrServer, error, res);
        
    }
    console.log(result.email);
    return result.email;
}
/**
 * Refill user's token
 * @param email -> user email
 * @param token -> token amount to refill
 * @param res -> response
 */
export function refill(email: string, token: number, res: any): void {
    models.Users.update({ token: token }, { where: { email: email } })
        .then(() => {
            const new_res = new Success().getMsg();
            res.status(new_res.status).json({ status: new_res.status, message: new_res.msg });
        })
        .catch((error) => {
            controllerErrors(ErrorEnum.ErrServer, error, res);
        })
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
//CHECK GAME MOVE BY ID NON LA USIAMO! DA LEVARE DOPO E SISTEMARE L'ERRORE CHE SI CREERA' NEL MIDDLEWARE ALLA SUA 
//RIMOZIONE
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

/**
 * Send the leaderboard as a response sorted in the desired order
 * @param sort -> sorting method (ASC or DESC)
 * @param res -> server response
 */
export async function showLeaderboard(sort: string, res: any): Promise<any> {
    let leaderboard: any;

    leaderboard = await utils.getLeaderboard(sort);

    // leaderboard empty
    if (leaderboard.length === 0) {
        res.send('There is no player in leaderboard yet!');
    }
    else {
        leaderboard = {
            leaderboard: leaderboard
        };
        res.send(leaderboard);
    }
}

export async function createMove(email: string, id_game: number, id_pezzo: string, da_x: number, da_y: number, a_x: number, a_y:number, dimensione: number, res: any): Promise<void> {

    let ha_mangiato: any = false;
//if principale che controlla se va fuori campo
    if (a_x<dimensione && a_y<dimensione && ((id_pezzo.includes('N') && a_x > da_x) || (id_pezzo.includes('B') && a_x < da_x))) {
//se non va fuori campo:
    //numerazione da alto a basso e da sx a dx. i pezzi neri in alto e quelli bassi secendono
        if(id_pezzo.includes('N') && a_x == da_x+2  && (a_y==da_y+2 || a_y == da_y-2)) {
            ha_mangiato=true;
        };

        if(id_pezzo.includes('B') && a_x == da_x-2  && (a_y==da_y-2 || a_y == da_y+2)) {
            ha_mangiato=true;
        };

        try {
            await models.Mossa.create({
                id_game: id_game,
                player: email,
                id_pezzo: id_pezzo,
                da_x: da_x,
                da_y: da_y,
                a_x: a_x,
                a_y: a_y,
                ha_mangiato: ha_mangiato
            });
    
            res.status(200).json({
                id_game: id_game,
                player: email,
                id_pezzo: id_pezzo,
                da_x: da_x,
                da_y: da_y,
                a_x: a_x,
                a_y: a_y,
                ha_mangiato: ha_mangiato
            });

            updateGame(email, id_pezzo, id_game, ha_mangiato, res);

        } catch(error){
            controllerErrors(ErrorEnum.ErrServer, error, res);
        }
    } 
//se va fuori campo:
    else ErrorEnum.ErrorMakeMove;
};

//assunzione che player 1 ha sempre pezzi neri e player 2 bianchi. Pieces1 è il numero di pezzi neri e pieces2 di quelli bianchi. anche se ha mangiato termina il turno.
export async function updateGame (email: string, id_pezzo:string, id_game: number, ha_mangiato:boolean, res: any): Promise<void> {

    const todayDate = new Date().toISOString().slice(0, 10);

    let game: any;

    let data_fine : any;

    let winner  : any;

    let in_progress : boolean = true;

    let player1 : string = 'null';

    let player2 : string = 'null';

    //definire se colui che muove (email) è player1 o player2
    game = await models.Game.findByPk(id_game, { raw: true });

    let moves1: number = game.moves1;

    let moves2: number = game.moves2;

    if (email == game.player1) {
        player1 = email;
        moves1 = moves1+1;
    } else {
        player2 = email;
        moves2 = moves2+1;
    };

    //definire il valore dei pieces 1 e 2
    let pieces1 = game.pieces1;

    let pieces2 = game.pieces2;

    if (ha_mangiato && id_pezzo.includes('N')) {
        pieces2=pieces2-1;
    };

    if (ha_mangiato && id_pezzo.includes('B')) {
        pieces1=pieces1-1;
    };

    if (pieces2 == 0) {
        winner = player1;
        in_progress = false;
        data_fine = todayDate;
    }

    if (pieces1 == 0) {
        winner = player2;
        in_progress = false;
        data_fine = todayDate;
    }

    //aggiorno il game dopo la mossa
    models.Game.update({date_end: data_fine, player_turn: email, pieces1:pieces1, pieces2:pieces2, moves1:moves1,  winner:winner, in_progress:in_progress}, { where: { id_game: id_game } })
        .then(() => {
            const new_res = new Success().getMsg();
            res.status(new_res.status).json({ status: new_res.status, message: new_res.msg });
        })
        .catch((error) => {
            controllerErrors(ErrorEnum.ErrServer, error, res);
        })
}

export async function showGame(id_game: number, res: any): Promise<any> {
    let game: any;
    let gameState: any;

    game = await models.Game.findByPk(id_game, { raw: true });

    gameState = {
        id_game: game.id_game,
        player1: game.player1,
        player2: game.player2,
        in_progress: game.in_progress,
        date_start: game.date_start,
        date_end: game.date_end,
        player_turn: game.player_turn,
        moves1: game.moves1,
        moves2: game.moves2,
        winner: game.winner,
        pieces1: game.pieces1,
        pieces2: game.pieces2,
        abbandono1: game.abbandono1,
        abbandono2: game.abbandono2,
        dimensione: game.dimensione,
        board: game.board
    };
    res.send(gameState);
}

export async function concede(email: string, id_game:number, res: any): Promise<void> {
    let game: any;
    let leaderboardlost: any;
    let leaderboardwins: any;

    game = models.sequelize.query("SELECT * FROM game  WHERE player1==" + email + "OR player2==" + email +" AND id_game =="+id_game,
    {
        raw: true
    });


    if(game[0].player1 == email) { //player1 è lo sconfitto
        leaderboardlost = models.sequelize.query("SELECT * FROM leaderboard WHERE email==" + game[0].player1,
        {
            raw: true
        });

        leaderboardwins = models.sequelize.query("SELECT * FROM leaderboard WHERE email !=" + game[0].player2,
        {
            raw: true
        });

        models.Game.update({abbandono1: true,  winner:game[0].player2, in_progress:false}, { where: { id_game: id_game } }); 
        models.Leaderboard.update({dlosses: leaderboardlost[0].dlosses+1}, { where: { email: email } });
        models.Leaderboard.update({dwins: leaderboardwins[0].dwins+1}, { where: { email: email } })
        .then(() => {
            const new_res = new Success().getMsg();
            res.status(new_res.status).json({ status: new_res.status, message: new_res.msg });
        })
        .catch((error) => {
            controllerErrors(ErrorEnum.ErrServer, error, res);
        })

    } else { //se lo sconfitto è il player2
        leaderboardlost = models.sequelize.query("SELECT * FROM leaderboard WHERE email==" + game[0].player2,
        {
            raw: true
        });

        leaderboardwins = models.sequelize.query("SELECT * FROM leaderboard WHERE email !=" + game[0].player1,
        {
            raw: true
        });

        models.Game.update({abbandono2: true,  winner:game[0].player1, in_progress:false}, { where: { id_game: id_game } }); 
        models.Leaderboard.update({dlosses: leaderboardlost[0].dlosses+1}, { where: { email: email } });
        models.Leaderboard.update({dwins: leaderboardwins[0].dwins+1}, { where: { email: email } })
        .then(() => {
            const new_res = new Success().getMsg();
            res.status(new_res.status).json({ status: new_res.status, message: new_res.msg });
        })
        .catch((error) => {
            controllerErrors(ErrorEnum.ErrServer, error, res);
        })

    }

}
export async function getLog(id: number, exportPath: string, format: string, res: any): Promise<any> {
    let game: any;
    let logMoves: any;
    let filename: string;
    let msg: string = "File not exported"
    logMoves=await models.sequelize.query("SELECT * FROM moves WHERE id_game=="+id);

    if (path) {
        if (format === 'json' || format === 'JSON') {
            filename = 'Game-' + id + '_log.json';
            exportPath = path.join(exportPath, filename)
            utils.exportAsJSON(logMoves, exportPath);
            msg = "File JSON exported at :" + exportPath;
        }
        else if (format === 'csv' || format === 'CSV') {
            filename = 'Game-' + id + '_log.csv';
            exportPath = path.join(exportPath, filename)
            utils.exportAsCSV(logMoves, exportPath);
            msg = "File CSV exported at :" + exportPath;
        }
        else if (format==='pdf'|| format ==='PDF'){
            filename= 'Game-' + id + '_log.pdf';
            exportPath = path.join(exportPath, filename);
            utils.exportAsPDF(logMoves, exportPath);
            msg = "File PDF exported at :" + exportPath;
        }
    }
    logMoves = {
        status: 200,
        msg: msg,
        id: game.id,
        log_moves: logMoves
    };
    res.send(logMoves);
}
//Restituisce ad un giocatore richiedente tutte le partite in corso o finite di uno specifico giocatore richiesto
export async function getGames(email: string,date_start: Date, date_end:Date, res: any){
    let games: any;
    let gamesList: any;
    games=await models.sequelize.query("SELECT * FROM game WHERE date_start>="+date_start+" AND date_start<="+date_end+" AND (player1=="+email+" OR player2=="+email+")");
    gamesList={
            status: 200,
            games: gamesList
        };
        res.send(gamesList);
    }
