import * as models from '../models/models';
import fs, { promises } from 'fs';
import Sequelize from 'sequelize';
import { Database } from "../connection/connection";
//fare npm install pdfkit
const PDFDocument = require('pdfkit');
import * as jwt from 'jsonwebtoken';
import * as a from '../responses/error';
/**
* Update leaderboard data for the winning player
* @param username 
*/


export async function updateLeaderboardWin(username: string): Promise<void> {
    let leaderboard: any;
    let numMatch: number;

    const [results, metadata] = await Database.connection().query("SELECT AVG(movesw) FROM game WHERE winner="+ username +" GROUP BY winner"); // Raw query - use array destructuring
    const mean=results[0]
    leaderboard = await models.Leaderboard.findByPk(username);

    if(!leaderboard) {
        if(!(leaderboard.abbandono1 || leaderboard.abbandono2)){
            models.Leaderboard.create({
                username: username,
                moves_mean: mean,
                wins: 1,
                losses: 0,
                matches: 1,
                dWin: 0,
                dLosses: 0,
            });
        }
        else{
    //caso di vittoria per abbandono da parte dell'avversario
            models.Leaderboard.create({
                username: username,
                moves_mean: mean,
                wins: 0,
                losses: 0,
                matches: 1,
                dWin: 1,
                dLosses: 0,
            });
        }
        
    }
    else {
        numMatch = leaderboard.matches + 1;
        if (!(leaderboard.abbandono1 || leaderboard.abbandono2)){
            models.Leaderboard.update({
                matches: numMatch,
                wins: leaderboard.wins + 1
            },
            {
                where: { username: username }
            });
            
        }
        else{
            models.Leaderboard.update({
                matches: numMatch,
                dwins: leaderboard.dWin+1,
                
            },
            {
                where: { username: username }
            });
        
        }
}
}

/**
* Update leaderboard data for the losing player
* @param username -> loser email
*/
export async function updateLeaderboardLose(username: string): Promise<void> {
    let leaderboard: any;
    let numMatch: number;
    let numMatchLose: number;
    let winRatio: number;

    leaderboard = await models.Leaderboard.findByPk(username);
//in caso la leaderboard non sia mai stata creata
    if(!leaderboard) {
        //sconfitta onorevole
        if ((!(leaderboard.abbandono1 || leaderboard.abbandono2))){
            models.Leaderboard.create({
                username: username,
                moves_mean: 0,
                wins: 0,
                losses: 1,
                matches: 1,
                dwins: 1,
                dlosses: 0
            });
        }
        //rage quit
        else{
            models.Leaderboard.create({
                username: username,
                moves_mean: 0,
                wins: 0,
                losses: 0,
                matches: 1,
                dwins: 0,
                dlosses: 1
            });
        }
    }
    else {
        //caso di classifica già esistente, aggiorno solo le statistiche del giocatore dlosses: numD_MatchWin
        numMatch = leaderboard.total_matches + 1;
        if ((!(leaderboard.abbandono1 || leaderboard.abbandono2))){
            models.Leaderboard.update({
                matches: numMatch,
                losses: leaderboard.losses + 1,
                
            },
            {
                where: { username: username }
            });
        }
        else{
            models.Leaderboard.update({
                matches: numMatch,
                dlosses: leaderboard.dlosses+1,
                
            },
            {
                where: { username: username }
            });
        }
    }
}


/**
* Export the game log as a json file
* @param logMoves -> object containing the moves log
* @param exportPath -> exported file path
*/
export function exportAsJSON(logMoves: any, exportPath: string) {
    let logMovesJSON = JSON.stringify(logMoves);

    fs.writeFile(exportPath, logMovesJSON, 'utf8', (err: any) => {
        if (err) throw err;
        console.log('Game\'s log exported succesfully to: ', exportPath);
    });
}


/**
* Export the game log as a json file
* @param logMoves -> object containing the moves log
* @param exportPath -> exported file path
*/
export function exportAsCSV(logMoves: any, exportPath: string) {
    let headerLine: string = 'Player, Row, Col';
    let moves = logMoves.moves;
    moves.unshift(headerLine);

    var logMovesCSV = moves.map(function(element: any){
        if (element == moves[0]) return element;
        return JSON.stringify(Object.values(element));
    })
    .join('\n')
    .replace(/(^\[)|(\]$)/mg, '');
    
    fs.writeFile(exportPath, logMovesCSV, 'utf8', (err: any) => {
        if (err) throw err;
        console.log('Game\'s log exported succesfully to: ', exportPath);
    });
}


/**
* Check if a piece has been eaten and check if the game is over
* @param been_Eaten 
* @param damiera
* @param gameDim
* @returns 
*/
export function returnGameState(id_pezzo: string, Damiera: any, gameDim: number) {
    let isGameClosed: boolean = true;
    let isShipSunk: boolean = true;
    let gridState: any = {
        isShipSunk,
        isGameClosed
    };

    for(let j = 0; j < gridDim; j++) {
        for(let k = 0; k < gridDim; k++) {
            if(grid[j][k] === shipName) {
                gridState.isShipSunk = false;
            }
            if(grid[j][k] !== 'X' && grid[j][k] !== 'O' && grid[j][k] !== 'W') {
                gridState.isGameClosed = false;
            }
        }
    }
    return gridState
}
//Visualizzazione classifica giocatori in ordine crescente o decrescente
//definire bene i parametri
//il return deve essere un messaggio http, riformulare il return
export async function returnLeaderboard(crescente: boolean, qualcosadadefinire: any){
    if (crescente){
        const [results, metadata] = await Database.connection().query("SELECT * FROM leaderboard ORDER BY ASC(wins+dwins)");
        return results;
    }else
    {
        const [results, metadata] = await Database.connection().query("SELECT * FROM leaderboard ORDER BY DESC(wins+dwins)");
        return results;
    }
    
}
/**Restituisce i log della partita dell'utente
 * @param id_player 
 * @param datain
 * @param dataf
 * @returns
 */


//restituire i log delle partite dell'utente richiedente con la possibilità di cercarle per certi intervalli di tempo
export async function returnMatchesLog(id_player: string, datain?: Date, dataf?:Date):Promise<any>{
    //caso in cui non ho specificato le date e mi riporta lo storico di tutte le partite
    if (typeof datain==undefined && dataf==undefined){
        const [results,metadata]=await Database.connection().query("SELECT * FROM game WHERE player1="+id_player+"OR player2="+id_player+" AND in_progress=false");
        return results;
    }
    //caso in cui specifico solo la data inferiore
    if (typeof datain!==undefined && dataf==undefined){
        const [results,metadata]=await Database.connection().query("SELECT * FROM game WHERE player1="+id_player+"OR player2="+id_player+" AND in_progress=false AND date_start>="+datain);
        return results;
    }
    //caso in cui specifico un intervallo di tempo di interesse
    if (typeof datain!==undefined && dataf!==undefined){
        const [results,metadata]=await Database.connection().query("SELECT * FROM game WHERE player1="+id_player+"OR player2="+id_player+" AND in_progress=false AND date_start>="+datain+"AND date_start<"+dataf);
        return results;
    }
}
/**
 * Verifica che nel JWT il richiedente sia l'admin.
 */
export async function authenticateAdmin(req: any, res: any, next: any): Promise<void>{
    try {
        let decoded = JSON.parse(JSON.stringify(jwt.decode(req.token)));
        let authenticated: boolean = await checkIfAdmin(decoded.richiedente);
        if (authenticated) {
            next();
        } else {
            next(a.ErrorEnum.NotAuthenticated);
        }
    } catch (e) { 
        next(a.ErrorEnum.InternalServer); 
    }
}
export function gridInitialize(gridDim: number) {
    let oggetto: models.Damiera={
        Dim: gridDim,
        damiera: models.blocco
    }

}

//la classe damiera verra' usata per generare il campo da gioco, con il constructor genero il campo e lo popolo con le posizioni iniziali dei pezzi
//per capire il significato degli if, si osservi l'immagine di damieraitaliana.png nella repository,
//si osserva che le pedine inizialmente occupano per righe pari posti a colonne pari e per righe dispari colonna dispari
//il k ci serve per posizionare le specifiche pedine, arrivato a riga 3 sappiamo che abbiamo finito di posizionare i neri, passeremo a riga 5 i bianchi
//che seguono lo stesso pattern posizionale, le posizioni restanti sono lasciate vuote
export class Damiera {
    //4x4 2 pezzi nella prima e ultima riga, 6x6 6 pezzi prime due e ultime 2 righe, 8x8 default
    public damiera: models.blocco[][];
    pezziNeri: Array<string>;
    pezziBianchi: Array<string>;
    dim: number;
    //dimensioni possibili: 3,5,7
        public constructor(dim:number){
            this.dim=dim;
            let k=0;
            switch(dim){
                case(3):{
                    this.pezziNeri = ["1N", "2N", "3N", "4N"];
                    this.pezziBianchi = ["1B", "2B", "3B", "4B"];
                    for(let i = 0; i < dim; i++){
                        this.damiera[i] = [];
                        if (i==1) {k=0}
                        for(let j = 0; j < dim; j++){
                                if ((i==0 && i%2==0 && j%2==0)||(i==0 && i%2!=0 && j%2!=0)){
                                    this.damiera[i][j] = new models.blocco(i,j,true,this.pezziNeri[k],"N");
                                    k++;
                                }
                                if ((i==3 && i%2==0 && j%2==0)||(i==3 && i%2!=0 && j%2!=0)){
                                    this.damiera[i][j] = new models.blocco(i,j,true,this.pezziBianchi[k],"B");
                                    k++;
                                }
                                else{
                                    this.damiera[i][j] = new models.blocco(i,j,false,"","");
                                }
                        
                                
                        }
                    }
                    break;
                }
                case(5):{
                    this.pezziNeri=["1N","2N","3N","4N","5N","6N"];
                    this.pezziBianchi=["1B","2B","3B","4B","5B","6B"];
                    for(let i = 0; i < dim; i++){
                        this.damiera[i] = [];
                        if (i==2) {k=0}
                        for(let j = 0; j < dim; j++){
                                if ((i<2 && i%2==0 && j%2==0)||(i<2 && i%2!=0 && j%2!=0)){
                                    this.damiera[i][j] = new models.blocco(i,j,true,this.pezziNeri[k],"N");
                                    k++;
                                }
                                if ((i>3 && i%2==0 && j%2==0)||(i>3 && i%2!=0 && j%2!=0)){
                                    this.damiera[i][j] = new models.blocco(i,j,true,this.pezziBianchi[k],"B");
                                    k++;
                                }
                                else{
                                    this.damiera[i][j] = new models.blocco(i,j,false,"","");
                                }
                        
                                
                        }
                    }
                    break;
                }
                case(7):{
                    this.pezziNeri=["1N","2N","3N","4N","5N","6N","7N","8N","9N","10N","11N","12N"];
                    this.pezziBianchi=["1B","2B","3B","4B","5B","6B","7B","8B","9B","10B","11B","12B"];
                    for(let i = 0; i < dim; i++){
                        this.damiera[i] = [];
                        if (i==3) {k=0}
                        for(let j = 0; j < dim; j++){
                                if ((i<3 && i%2==0 && j%2==0)||(i<3 && i%2!=0 && j%2!=0)){
                                    this.damiera[i][j] = new models.blocco(i,j,true,this.pezziNeri[k],"N");
                                    k++;
                                }
                                if ((i>=5 && i%2==0 && j%2==0)||(i>=5 && i%2!=0 && j%2!=0)){
                                    this.damiera[i][j] = new models.blocco(i,j,true,this.pezziBianchi[k],"B");
                                    k++;
                                }
                                else{
                                    this.damiera[i][j] = new models.blocco(i,j,false,"","");
                                }
                        
                                
                        }
                    }
                    break;
                }
                }

        
        }
    get Damiera(){
        return this.damiera;
    }
    public damieraToJSON(): string{
        return JSON.stringify(this.damiera);
    }

}

    