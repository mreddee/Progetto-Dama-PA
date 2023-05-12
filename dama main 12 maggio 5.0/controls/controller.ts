import * as models from "../models/models"
import * as utils from "../utils/utils"
import { ErrorEnum, getError, Success } from '../factory/factory';
import { Op, Utils, where } from "sequelize";
import { query } from "express";
import path from 'path';
import moment from 'moment';
import { Database } from "../connection/connection";
/**
 * Funzione generatrice del gioco, parametri:
 * @email1 giocatore 1
 * @email2 giocatore 2
 * @dimensione dimensione della damiera
 */

export async function createGame(player1:string, player2:string, dimensione:number, res: any): Promise<any>{
    let campo: models.Damiera;
    campo=new models.Damiera(dimensione);
    let pieces: number = utils.piecesnumber(dimensione);
    //toISOstring
    const momentinizio=moment();
    const todayDate = momentinizio.toDate();
    //const formattedDate = currentDate.toISOString().slice(0, 19).replace('T', ' ');


    try {
        //aggiorna lo stato dei giocatori della partita appena creata in occupati
        await models.Users.update({ isplaying: 1 }, { where: { email: player1 } });
        await models.Users.update({ isplaying: 1 }, { where: { email: player2 } });
        await models.Game.create({//aggiungere i campi moves win e durata
            player1: player1,
            player2: player2,
            in_progress: 1,
            date_start: todayDate,
            date_end: null,
            player_turn: player1,
            duration: 0,
            moves1: 0,
            moves2: 0,
            movesw: 0,
            winner: null,
            pieces1: pieces,
            pieces2: pieces,
            abbandono1: 0,
            abbandono2: 0,
            dimensione: dimensione,
            board: campo
        });


        console.log("CREAZIONE PARTITA RIUSCITA!!");
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
    models.Users.findByPk(email, { raw: true }).then(() => {
        const new_res = new Success().getMsg();
        res.status(new_res.status).json({ status: new_res.status, message: new_res.msg });
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
 * @param player1 -> player1 email
 * @param player2 -> player2 email
 * @returns 
 */
export async function checkGameInProgress(email: string, player: string): Promise<boolean> {
    let result: any;
    let status: boolean = true;
    result = await models.Game.findOne({where: {[player]: email, in_progress: status}});
    return result;
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
//controlla se un gioco esiste ed è in corso
export async function checkGameRunningById(id: number): Promise<boolean> {
    let result: any;
    let status: number = 1;
    result = await models.Game.findOne({where: {id_game: id, in_progress: status}});
    return result;
}

/**
 * Check if the player attempting the move can do it
 * @param id -> game id
 * @param email -> user email
 * @returns -> true if is the player turn, false otherwise
 */
//ASSUNZIONI: il pedone che vuole mangiare rimane nella posizione del pedone che ha mangiato
//IL GIOCATORE 1 HA SEMPRE NERO
export async function checkMove(email: string, id_game:number, da_x:number,da_y:number,a_x:number,a_y:number ): Promise<boolean>{
    let status: boolean=false;
    let game: any;
    let campo: models.Damiera;
    game= await models.Game.findByPk(id_game,{raw: true});
    campo=game.board;
    let dimensione: number=campo.dim
    if(a_x<0 || a_y<0 || da_x<0 || da_y<0 ||a_x>dimensione || a_y>dimensione || da_y>dimensione || da_x>dimensione){
        console.log("VALORI POSIZIONALI IMMESSI INVALIDI!");
        return status;
    }
    let fazioneda: string=campo.damiera[da_x][da_y].faction;//FAZIONE PROPRIO PEDONE
    let fazionea: string=campo.damiera[a_x][a_y].faction;//FAZIONE PROPRIO PEDONE
    let isdama: number=campo.damiera[da_x][da_y].dama;//1 è dama, 0 non è dama
    console.log("DA_X"+da_x);
    console.log("DA_y"+da_y);
    console.log("A_X"+a_x);
    console.log("A_y"+a_y);
    
    try{//se cerca di osservare valori oltre quelli stabiliti dall'oggetto va chiaramente in crash, con il catch lo faccio ritornare tra gli errori previsti
    if (campo.damiera[da_x][da_y].occupied==0){//se non c'è nessun pezzo in quella casella
        console.log("NON C'E'NESSUN PEZZO IN QUESTA CASELLA!!");
        return status;
    } }catch(error){
        return status;
    }
   
    if ((game.player1==email && fazioneda=="B")||(game.player2==email && fazioneda=="N")){
        console.log("STAI CERCANDO DI MUOVERE UN PEZZO DELLA SQUADRA AVVERSARIA!");
        return status;
    }
    if (a_x>dimensione || a_y>dimensione){
        console.log("STAI CERCANDO DI MUOVERTI OLTRE IL CAMPO DI GIOCO!!");
        return status;
    }
    //se ax-dax è =1 oppure è =-1 E se ay-day =1 o= -1 allora va bene ()
    //criteri incompleti: se la differenza è 1 devo anche assicurarmi che le a siano maggiori delle da
    //ragionamento opposto per le da: a minori delle da
    //condizione terribile se si riesce ad esprimere in modo più semplice farlo
//math.abs() >funzione per i valori assoluti
    /*if (((((a_x-da_x)!=1) && a_x>da_x) || (((a_x-da_x)!=-1) && a_x<da_x))&&((((a_y-da_y)!=1) && a_y>da_y) || ((a_y-da_y)!=-1)&& a_y<da_y)){
        console.log("NON TI STAI MUOVENDO IN DIAGONALE PER SPAZI DI 1!!");
        return status;
    }
    */
    if(Math.abs(a_x-da_x)!=1 || Math.abs(a_y-da_y)!=1){
        console.log("PASSO TROPPO LUNGO NON CONSENTITO!");
        return status;
    }
    if (fazioneda=="N" && isdama==0 && ((a_x-da_x)!=1)){//dama nera non riesce a muoversi indietro
        console.log("MOSSA NON AMMESSA PER PEDONE NERO!");
        return status;
    }
    if (fazioneda=="B" && isdama==0 && ((a_x-da_x)!=-1)){//dama bianca sembra riuscire a muoversi indietro
        console.log("MOSSA NON AMMESSA PER PEDONE BIANCO!");
        return status;
    }
    if (fazionea==fazioneda){
        console.log("STAI CERCANDO DI MANGIARE UN TUO COMPAGNO!!");
        return status;
    }
    status=true;
    return status;

}
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
    if (leaderboard.length === 0) {//Non è una risposta in JSON
        res.send('There is no player in leaderboard yet!');
    }
    else {
        leaderboard = {
            leaderboard: leaderboard
        };
        res.send(leaderboard);
    }
}
//tutti i controlli sulla legittimità della mossa già fatti
//crea la mossa: aggiorna tabella games e crea record tabella moves FATTO
//se uno dei due non ha più pezzi, il gioco finisce: aggiornare tabella users e leaderboard
export async function createMove(email: string, id_game: number, da_x: number, da_y: number, a_x: number, a_y:number, res: any): Promise<void> {
    let ha_mangiato:boolean=false;
    let game: any;
    let campo: models.Damiera;
    let winner: string="null";
    game= await models.Game.findByPk(id_game,{raw: true});
    let finish: Date=new Date();//potrebbe creare problemi
    let gamegoing: number=game.in_progress;
    campo=game.board;
    let fazioneda: string=campo.damiera[da_x][da_y].faction;//FAZIONE PROPRIO PEDONE
    let fazionea: string=campo.damiera[a_x][a_y].faction;//FAZIONE pedone avversario
    let pezzo1: number=game.pieces1;//pezzi neri
    let pezzo2: number=game.pieces2;//pezzi bianchi
    let mosse1: number=game.moves1;//contatore mosse da inizio partita di P1
    let mosse2: number=game.moves2;//contatore mosse da inizio partita di P2
    let giocatore1: string=game.player1;
    let giocatore2: string=game.player2;
    let giocatore: string=game.player_turn;//giocatore di turno
    //STABILIAMO INNANZITUTTO SE LA CASELLA E' OCCUPATA DA QUALCUNO
    if(fazionea!=""){
        if (fazionea!=fazioneda){//un giocatore si appresta a mangiare un pezzo avversario
            console.log("MANGIAMO!!!");
            if (email==giocatore1){//nero mangia bianco
                pezzo2=pezzo2-1;
                mosse1=mosse1+1;
                console.log("NERO MANGIA BIANCO!!");
                giocatore=giocatore2;//mi salvo per il futuro chi è il giocatore del prissimo turno
                                    //se qui mangia giocatore 1 allora il prossimo turno è di giocatore 2
            }else if(email==giocatore2){//bianco mangia nero
                pezzo1=pezzo1-1;
                mosse2=mosse2+1;
                console.log("BIANCO MANGIA NERO!!");
                giocatore=giocatore1;
            }
        ha_mangiato=true;
        }
    }else{//mi sposto in una casella vuota
        if (email==giocatore1){//turno giocatore1
            mosse1=mosse1+1;
            console.log("NERO SI SPOSTA IN CASELLA VUOTA!!");
            giocatore=giocatore2;//mi salvo per il futuro chi è il giocatore del prissimo turno
                                //se qui mangia giocatore 1 allora il prossimo turno è di giocatore 2
        }else if(email==giocatore2){//mossa giocatore 2
            mosse2=mosse2+1;
            console.log("BIANCO SI SPOSTA IN CASELLA VUOTA!!");
            giocatore=giocatore1;
        }
    }
    let movesw: number=0;
    let duration: any;
    //stabiliamo l'eventuale vincitore
    if (pezzo2==0){
        winner=giocatore1;
        gamegoing=0;
        finish=new Date();
        movesw=mosse1;
        duration=utils.calcoladurata(game.date_start);
    }
    if (pezzo1==0){
        winner=giocatore2;
        gamegoing=0;
        finish=new Date();
        movesw=mosse2;
        duration=utils.calcoladurata(game.date_start);
    }
    let trasforma :number=0;//segnala la trasformazione in dama
    if ((fazioneda=="B" && a_x==0)||(fazioneda=="N"&& a_x==campo.dim-1)){//se sono in condizione di trasformazione lo fa
        trasforma=1;
        campo.damiera[a_x][a_y]=campo.damiera[da_x][da_y];
        campo.damiera[a_x][a_y].dama=trasforma;
    } 
    else{//se non entra in condizione di trasformazione si limita a passare i vecchi valori di casella a quella nuova
        campo.damiera[a_x][a_y]=campo.damiera[da_x][da_y];
    }
    campo.damiera[da_x][da_y]={
        r: da_x,
        c: da_y,
        occupied: 0,
        occupiedby: "",
        faction: "",
        dama: 0
    }
    try{
        await models.Mossa.create({//inserisco nuovo record di mossa nella tabella mossa
            id_game: id_game,
            player: giocatore,
            id_pezzo: campo.damiera[a_x][a_y].occupiedby,
            da_x: da_x,
            da_y: da_y,
            a_x: a_x,
            a_y: a_y,
            ha_mangiato: ha_mangiato
        });
        await models.Game.update({//se la partita finisce è da calcolare anche la durata della partita
            in_progress: gamegoing,
            date_end: finish,
            player_turn: giocatore,
            moves1: mosse1,
            moves2: mosse2,
            movesw: movesw,
            winner: winner,
            duration: duration,
            pieces1: pezzo1,
            pieces2: pezzo2,
            board: campo
        }, { where: { id_game: id_game } });
        if(winner!="null"){//abbiamo un vincitore!
            console.log("ABBIAMO UN VINCITORE!! IL VINCITORE E':"+winner);
            await models.Users.update({isplaying: 0}, { where: { email: giocatore1 } });//non aggiorna la tabella utenti
            await models.Users.update({isplaying: 0}, { where: { email: giocatore2 } });
            await utils.updateLeaderboardWin(winner);
            if (winner==giocatore1) {await utils.updateLeaderboardLose(giocatore2);}
            else {await utils.updateLeaderboardLose(giocatore1);}
        }
        res.status(200).json({
            id_game: id_game,
            player: email,
            id_pezzo: campo.damiera[a_x][a_y].occupiedby,
            da_x: da_x,
            da_y: da_y,
            a_x: a_x,
            a_y: a_y,
            dama: campo.damiera [a_x][a_y].dama,
            winner: winner,
            ha_mangiato: ha_mangiato
        }); 
        } catch(error){
            controllerErrors(ErrorEnum.ErrServer, error, res);
        }
};



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
        movesw: game.movesw,
        duration: game.duration,
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

export async function concede(player: string, id_game:number, res: any): Promise<void> {
    let game: any;
    let leaderboard1: any;
    let leaderboard2: any;
    let datafine: Date=new Date();
    console.log(datafine);
    game=await models.Game.findByPk(id_game);//cerco il gioco in questione
    let datainizio: Date=game.date_start;
    leaderboard1 =await models.Leaderboard.findByPk(game.player1);
    //let email1:string=leaderboard1.email;
    leaderboard2 =await models.Leaderboard.findByPk(game.player2);
    let durata: string=utils.calcoladurata(datainizio);
    if(game.player1 == player) {
        console.log("CHI SI ARRENDE E' PLAYER 1"); //player1 è lo sconfitto
        await models.Game.update({abbandono1: 1,  winner:game.player2, in_progress:0,movesw: game.moves2,duration:durata,date_end:datafine}, { where: { id_game: id_game } }); 
        await models.Leaderboard.update({dlosses: leaderboard1.dlosses+1, matches:leaderboard1.matches+1}, { where: { email: leaderboard1.email } });
        await models.Leaderboard.update({dwins: leaderboard2.dwins+1, matches:leaderboard2.matches+1 }, { where: { email: leaderboard2.email } })

    } else { //se lo sconfitto è il player2
        console.log("CHI SI ARRENDE E' PLAYER 2");
        await models.Game.update({abbandono2: 1,  winner:game.player1, in_progress:0,moves:game.moves1,duration:durata,date_end:datafine}, { where: { id_game: id_game } });
        await models.Leaderboard.update({dlosses: leaderboard2.dlosses+1, matches: leaderboard2.matches+1}, { where: { email: leaderboard2.email } });
        await models.Leaderboard.update({dwins:leaderboard1.dwins+1, matches: leaderboard1.matches+1}, { where: { email: leaderboard1.email } })
    }
    await models.Users.update({isplaying: 0}, { where: { email: game.player1 } });
    await models.Users.update({isplaying: 0}, { where: { email: game.player2 } })
    .then(() => {
        const new_res = new Success().getMsg();
        res.status(new_res.status).json({ status: new_res.status, message: new_res.msg });
    }).catch((error) => {
        controllerErrors(ErrorEnum.ErrServer, error, res);
    })

}
export async function getLog(id_gioco: number, exportPath: string, format: string, res: any): Promise<any> {
    let logMoves: any;
    let filename: string;
    let msg: string = "File not exported";
    console.log('CONOTROLLO!!!');
    logMoves = await models.Mossa.findAll({where:{id_game:id_gioco}});
    //logMoves=await models.sequelize.query("SELECT * FROM moves WHERE id_game="+id);
    let string = id_gioco.toString();

    if (path) {
        console.log('CONOTROLLO2!!!');
        if (format === 'json' || format === 'JSON') {
            console.log('Json');
            filename = 'Game-' + string + '_log.json';
            console.log(filename);
            exportPath = path.join(exportPath, filename);
            console.log(exportPath);
            await utils.exportAsJSON(logMoves, exportPath);
            console.log('exportPath fatto');
            msg = "File JSON exported at :" + exportPath;
        }
        else if (format === 'csv' || format === 'CSV') {
            filename = 'Game-' + string + '_log.csv';
            exportPath = path.join(exportPath, filename)
            await utils.exportAsCSV(logMoves, exportPath);
            msg = "File CSV exported at :" + exportPath;
        }
        else if (format==='pdf'|| format ==='PDF'){
            filename= 'Game-' + string + '_log.pdf';
            exportPath = path.join(exportPath, filename);
            await utils.exportAsPDF(logMoves, exportPath);
            msg = "File PDF exported at :" + exportPath;
        }
    }
    logMoves = {
        status: 200,
        msg: msg,
        id: id_gioco,
        log_moves: logMoves
    };
    res.send(logMoves);
}
//Restituisce ad un giocatore richiedente tutte le partite in corso o finite di uno specifico giocatore richiesto
export async function getGamesPerDate(email: string,date_start: Date, date_end:Date,sort:string,exportPath: string,format: string, res: any){
    let gamesList: any;
    let filename: string;
    let msg: string = "File not exported";
    const games = await models.Game.findAll({
        where: {
            date_start: {
                [Op.between]: [date_start, date_end],
            },
        [Op.or]: [
            { player1: email },
            { player2: email },
            ],
        },
        order: [['date_start', sort]],
        });
        if (path) {
            console.log('CONOTROLLO2!!!');
            if (format === 'json' || format === 'JSON') {
                console.log('Json');
                filename = 'Player-' + email + '_log.json';
                console.log(filename);
                exportPath = path.join(exportPath, filename);
                console.log(exportPath);
                await utils.exportAsJSON(games, exportPath);
                console.log('exportPath fatto');
                msg = "File JSON exported at :" + exportPath;
            }
            else if (format === 'csv' || format === 'CSV') {
                filename = 'Palyer-' + email + '_log.csv';
                exportPath = path.join(exportPath, filename)
                await utils.exportAsCSV(games, exportPath);
                msg = "File CSV exported at :" + exportPath;
            }
            else if (format==='pdf'|| format ==='PDF'){
                filename= 'Player-' + email + '_log.pdf';
                exportPath = path.join(exportPath, filename);
                await utils.exportAsPDF(games, exportPath);
                msg = "File PDF exported at :" + exportPath;
            }
        }
    
    gamesList={
            status: 200,
            msg: msg,
            games: games
        };
        res.send(gamesList);
    }
export async function getGamesPerMoves(email: string,sort:string,exportPath: string,format:string, res: any){
        let gamesList: any;
        let filename: string;
        let msg: string = "File not exported";
        const games = await models.Game.findAll({
            where: {
                
            [Op.or]: [
                { player1: email },
                { player2: email },
                ],
            },
            order: [[Database.connection().literal('moves1 + moves2'), sort]],
            });
            if (path) {
                console.log('CONOTROLLO2!!!');
                if (format === 'json' || format === 'JSON') {
                    console.log('Json');
                    filename = 'Player-' + email + '_log.json';
                    console.log(filename);
                    exportPath = path.join(exportPath, filename);
                    console.log(exportPath);
                    await utils.exportAsJSON(games, exportPath);
                    console.log('exportPath fatto');
                    msg = "File JSON exported at :" + exportPath;
                }
                else if (format === 'csv' || format === 'CSV') {
                    filename = 'Palyer-' + email + '_log.csv';
                    exportPath = path.join(exportPath, filename)
                    await utils.exportAsCSV(games, exportPath);
                    msg = "File CSV exported at :" + exportPath;
                }
                else if (format==='pdf'|| format ==='PDF'){
                    filename= 'Player-' + email + '_log.pdf';
                    exportPath = path.join(exportPath, filename);
                    await utils.exportAsPDF(games, exportPath);
                    msg = "File PDF exported at :" + exportPath;
                }
            }
        
        gamesList={
                status: 200,
                msg: msg,
                games: games
            };
            res.send(gamesList);
        }