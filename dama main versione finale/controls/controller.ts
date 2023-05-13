import * as models from "../models/models"
import * as utils from "../utils/utils"
import { ErrorEnum, getError, Success } from '../factory/factory';
import { Op} from "sequelize";
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
    const momentinizio=moment();
    const todayDate = momentinizio.toDate();


    try {
        
        await models.Users.update({ isplaying: 1 }, { where: { email: player1 } });
        await models.Users.update({ isplaying: 1 }, { where: { email: player2 } });
        await models.Game.create({
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
/**
 * Aggiornamento token giocatore che crea o fa mossa di gioco
 * @email individua l'email del giocatore a cui si aggiornano i token
 * @cost costo dell'azione
 */


export function updateToken(email: string, cost: number, res: any): void {
    getToken(email, res).then((token) => { 
        token = token - cost;
        models.Users.update({ token: token }, { where: { email: email } });
        console.log("Remaining token: " + (token));
     }).catch((error) => {
            console.log("ERRORE NELL'AGGIORNAMENTO TOKEN!!!")
            controllerErrors(ErrorEnum.ErrServer, error, res);
        })
}
/**
 * Restituisce i token di un giocatore
 * @email email del giocatore di cui visualizzare il gioco
 */

export async function getToken(email: string, res: any): Promise<number> {
    let result: any;
    try {
        result = await models.Users.findByPk(email, { raw: true });
    } catch (error) {
        controllerErrors(ErrorEnum.ErrServer, error, res);
    };
    return result.token;
}
/**
 * Funzione che restituisce l'errore appropriato
 * @param enum_error tipo di errore 
 * @param err errore osservato
 * @param res risposta server
 * @param msgParameter 
 */
function controllerErrors(enum_error: ErrorEnum, err: any, res: any, msgParameter?: string): void {
    const new_err = getError(enum_error).getMsg();
    console.log(err);
    res.status(new_err.status).json({ error: new_err.status, message: new_err.msg });
}
/**
 * Controlla l'esistenza dell'utente nel database, restituisce vero o false
 * @param email email utente da cercare
 * @param res risposta server
 * @returns vero o falso, a seconda se trova o meno l'utente
 */
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
 * Funzione che visualizza i token dell'utente che ne fa richiesta
 * @param email 
 * @param res 
 */
export async function showToken(email: string, res: any): Promise<void> {
    await models.Users.findByPk(email,{raw: true})
    .then((results: any) => {
        const new_res = new Success().getMsg();
        res.status(new_res.status).json({ status: new_res.status,results:results.token, message: new_res.msg });
    }).catch((error) => {
        controllerErrors(ErrorEnum.ErrServer, error, res);
    })
}

/**
 * Funzione richiamabile solo da admin che visualizza tutti i giocatori che hanno token pari o inferiore a tokenlimit
 * @param tokenlimit valore massimo di ricerca
 * @param res 
 */
export async function showTokenAdmin( tokenlimit:number, res: any): Promise<void> {

    let userList : any;
    try {
        userList = await utils.showUserLimitToken(tokenlimit);
    } catch (error) {
        controllerErrors(ErrorEnum.ErrServer, error, res);
        
    }
    res.status(200).json({
        status: 200,
        userList
    });
}

/**
 * Restituisce il ruolo dell'utente
 * @param email -> user email
 * @param res -> response
 * @returns -> user role (admin/user)
 */
export async function getRole(email: string, res: any): Promise<string> {
    let result: any;
    try {
        result = await models.Users.findByPk(email, { raw: true });
    } catch (error) {
        console.log("CONTROLLO RUOLO FALLITO!");
        controllerErrors(ErrorEnum.ErrServer, error, res);
        
    }
    return result.email;
}
/**
 * Imposta i token dell'utente ad un valore specifico
 * @param email -> user email
 * @param token -> valora token da impostare
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
 * Controlla se l'utente sta già giocando
 * @param email -> player1 email
 * @param player -> player2 email
 * @returns 
 */
export async function checkGameInProgress(email: string, player: string): Promise<boolean> {
    let result: any;
    let status: boolean = true;
    result = await models.Game.findOne({where: {[player]: email, in_progress: status}});
    return result;
    }


/**
 * Controlla l'esistenza di un gioco per suo id
 * @param id -> id gioco
 * @returns -> restituisce vero o falso a seconda se il gioco esiste o meno
 */
export async function checkGameExistById(id: string): Promise<boolean> {
    let result: any;
    result = await models.Game.findByPk(id, { raw: true });
    return result;
}
/**
 * controlla se un gioco esiste ed è in corso restituisce vero o falso
 * @param id id del gioco
 * @returns vero o falso
 */
export async function checkGameRunningById(id: number): Promise<boolean> {
    let result: any;
    let status: number = 1;
    result = await models.Game.findOne({where: {id_game: id, in_progress: status}});
    return result;
}

/**
 * Controlla la legittimità della mossa
 * @param email email del giocatore di turno
 * @param id_game id del gioco per cercare il gioco in questione e assumere tutte le informazioni necessarie su questo
 * @param da_x coordinata di riga del campo della posizione del pezzo ad inizio mossa
 * @param da_y coordinata di colonna del campo della posizione del pezzo ad inizio mossa
 * @param a_x coordinata di riga del campo della posizione del pezzo a fine mossa
 * @param a_y coordinata di colonna del campo della posizione del pezzo a fine mossa
 * @returns restituisce vero o falso a seconda se la mossa è legittima o meno
 */
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
    let fazioneda: string=campo.damiera[da_x][da_y].faction;
    let fazionea: string=campo.damiera[a_x][a_y].faction;
    let isdama: number=campo.damiera[da_x][da_y].dama;

    
    try{
    if (campo.damiera[da_x][da_y].occupied==0){
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

    if(Math.abs(a_x-da_x)!=1 || Math.abs(a_y-da_y)!=1){
        console.log("PASSO TROPPO LUNGO NON CONSENTITO!");
        return status;
    }
    if (fazioneda=="N" && isdama==0 && ((a_x-da_x)!=1)){
        console.log("MOSSA NON AMMESSA PER PEDONE NERO!");
        return status;
    }
    if (fazioneda=="B" && isdama==0 && ((a_x-da_x)!=-1)){
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
/**
 * Funzione di controllo del turno del giocatore in un gioco ci dice se è turno del giocatore o meno
 * @param id id del gioco
 * @param email email del giocatore per il quale controlliamo se è il suo turno
 * @returns vero o falso, a seconda se è effettivamente turno del giocatore
 */
export async function checkPlayerTurnById(id:string, email: string): Promise<boolean> {
    let result: any;
    result = await models.Game.findByPk(id, {raw: true});
    if (result.player_turn === email) return true;
    else return false;
}

/**
 * Mostra la classifica dei giocatori a seconda dell'ordinamento indicato
 * @param sort metodo di ordinamento ASC o DESC
 * @param res risposta del server
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
/**
 * Funzione che aggiorna la progressione del gioco, a fine mossa controlla se è finito il gioco e aggiorna la
 * classifica, restituisce un riassunto dello stato del pezzo a fine mossa:
 * sapremo se il pezzo è diventato dama, se ha mangiato e determina l'eventuale vincitore
 * @param email email del giocatore, ci serve per sapere la fazione di appartenenza
 * @param id_game id del gioco, serve per recuperare lo stato del gioco per aggiornarlo
 * @param da_x le coordinate "da" indicano la posizione iniziale del pezzo
 * @param da_y rispettivamente le x le righe del campo e y le sue colonne
 * @param a_x coordinate finali del pezzo, stesso ragionamento per le coordinate iniziali
 * @param a_y 
 * @param res risposta server per status del pezzo e del gioco
 */
export async function createMove(email: string, id_game: number, da_x: number, da_y: number, a_x: number, a_y:number, res: any): Promise<void> {
    let ha_mangiato:boolean=false;
    let game: any;
    let campo: models.Damiera;
    let winner: string="null";
    game= await models.Game.findByPk(id_game,{raw: true});
    let finish: Date=new Date();
    let gamegoing: number=game.in_progress;
    campo=game.board;
    let fazioneda: string=campo.damiera[da_x][da_y].faction;
    let fazionea: string=campo.damiera[a_x][a_y].faction;
    let pezzo1: number=game.pieces1;
    let pezzo2: number=game.pieces2;
    let mosse1: number=game.moves1;
    let mosse2: number=game.moves2;
    let giocatore1: string=game.player1;
    let giocatore2: string=game.player2;
    let giocatore: string=game.player_turn;
  
    if(fazionea!=""){
        if (fazionea!=fazioneda){
            console.log("MANGIAMO!!!");
            if (email==giocatore1){
                pezzo2=pezzo2-1;
                mosse1=mosse1+1;
                console.log("NERO MANGIA BIANCO!!");
                giocatore=giocatore2;
                                  
            }else if(email==giocatore2){
                pezzo1=pezzo1-1;
                mosse2=mosse2+1;
                console.log("BIANCO MANGIA NERO!!");
                giocatore=giocatore1;
            }
        ha_mangiato=true;
        }
    }else{
        if (email==giocatore1){
            mosse1=mosse1+1;
            console.log("NERO SI SPOSTA IN CASELLA VUOTA!!");
            giocatore=giocatore2;
                                
        }else if(email==giocatore2){
            mosse2=mosse2+1;
            console.log("BIANCO SI SPOSTA IN CASELLA VUOTA!!");
            giocatore=giocatore1;
        }
    }
    let movesw: number=0;
    let duration: any;
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
    let trasforma :number=0;
    if ((fazioneda=="B" && a_x==0)||(fazioneda=="N"&& a_x==campo.dim-1)){
        trasforma=1;
        campo.damiera[a_x][a_y]=campo.damiera[da_x][da_y];
        campo.damiera[a_x][a_y].dama=trasforma;
    } 
    else{
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
        await models.Mossa.create({
            id_game: id_game,
            player: giocatore,
            id_pezzo: campo.damiera[a_x][a_y].occupiedby,
            da_x: da_x,
            da_y: da_y,
            a_x: a_x,
            a_y: a_y,
            ha_mangiato: ha_mangiato
        });
        await models.Game.update({
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
        if(winner!="null"){
            console.log("ABBIAMO UN VINCITORE!! IL VINCITORE E':"+winner);
            await models.Users.update({isplaying: 0}, { where: { email: giocatore1 } });
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


/**
 * Funzione che cerca e restituisce su richiesta lo stato di una specifica partita per suo id
 * @param id_game id partita da giocare
 * @param res la risposta è un record dalla tabella game
 */
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
/**
 * Funzione che gestisce la terminazione di una partita a causa di resa del giocatore richiedente
 * @param player email del giocatore che si arrende
 * @param id_game id del gioco
 * @param res risposta del server
 */
export async function concede(player: string, id_game:number, res: any): Promise<void> {
    let game: any;
    let leaderboard1: any;
    let leaderboard2: any;
    let datafine: Date=new Date();

    game=await models.Game.findByPk(id_game);
    let datainizio: Date=game.date_start;
    leaderboard1 =await models.Leaderboard.findByPk(game.player1);

    leaderboard2 =await models.Leaderboard.findByPk(game.player2);
    let durata: string=utils.calcoladurata(datainizio);
    if(game.player1 == player) {
        console.log("CHI SI ARRENDE E' PLAYER 1");
        await models.Game.update({abbandono1: 1,  winner:game.player2, in_progress:0,movesw: game.moves2,duration:durata,date_end:datafine}, { where: { id_game: id_game } }); 
        await models.Leaderboard.update({dlosses: leaderboard1.dlosses+1, matches:leaderboard1.matches+1}, { where: { email: leaderboard1.email } });
        await models.Leaderboard.update({dwins: leaderboard2.dwins+1, matches:leaderboard2.matches+1 }, { where: { email: leaderboard2.email } })

    } else {
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
/**
 * Funzione che restituisce lo storico mosse di una specifica partita, lo mostra in risposta e 
 * lo salva in un formato specifico di file
 * @param id_gioco id della partita del quale vogliamo lo storico mosse
 * @param exportPath percorso nell'immagine docker nel quale vogliamo salvare il file
 * @param format formato di file accettati: JSON, CSV, PDF 
 * @param res mostra le mosse e indica l'esito di salvataggio del file
 */
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
/**
 * Funzione di ricerca partite di uno specifico utente per intervallo di date ordinato cronologicamente
 * @param email email del giocatore di cui siamo interessati a vedere lo storico partite
 * @param date_start data dal quale vogliamo vedere le partite
 * @param date_end data massima entro il quale vogliamo vedere le partite
 * @param sort criterio di ordinamento dei risultati ASC o DESC
 * @param exportPath percorso salvataggio file contenente i risultati di ricerca
 * @param format formato del file: CSV, PDF, JSON
 * @param res restituzione esito richiesta del server
 */
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
/**
 * Restituisce storico partite di un giocatore e lo ordina in base al numero di mosse effettuate in partita
 * @param email email del giocatore
 * @param sort criterio di ordinamento ASC o DESC
 * @param exportPath percorso file dove salviamo il risultato della ricerca
 * @param format formato del file PDF, JSON, CSV
 * @param res risposta del server
 */
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