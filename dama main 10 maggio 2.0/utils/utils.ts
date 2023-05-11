import {Game, Leaderboard} from '../models/models';
import fs from 'fs';
import * as models from '../models/models';
const PDFDocument = require('pdfkit');


/**
* Update leaderboard data for the winning player
* @param email 
*/

export async function updateLeaderboardWin(username: string): Promise<void> {
    let leaderboard: any;
    let numMatch: number;
    let numMatchWin: number;
    let results: any;
    console.log("INIZIO AGGIORNAMENTO CLASSIFICA VINCITORE!")
    //const results = await Database.connection().query("SELECT AVG(movesw) FROM game WHERE winner="+ username); // Raw query - use array destructuring
    results=await models.Game.findAll({//ottengo tutte le partite dove vince l'utente
        where:{
            winner: username
        }
    });
    console.log(results.movesw);
    const mean=results;
    console.log("MEDIA VITTORIE: "+mean);

    leaderboard = await Leaderboard.findByPk(username);

    if(!leaderboard) {
        Leaderboard.create({
            email: username,
            moves_mean: mean,
            wins: 1,
            losses: 0,
            matches: 1,
            dwin: 0,
            dlosses: 0,
        });
    }
    else {
        numMatch = leaderboard.matches + 1;
        numMatchWin = leaderboard.wins + 1;

        Leaderboard.update({
            total_matches: numMatch,
            wins: numMatchWin,
            moves_mean: mean
        },
        {
            where: { email: username }
        });
    }
    console.log("FINE AGGIORNAMENTO CLASSIFICA PER VINCITORE");
}

/**
* Update leaderboard data for the losing player
* @param email -> loser email
*/
export async function updateLeaderboardLose(username: string): Promise<void> {
    let leaderboard: any;
    let numMatch: number;
    let numMatchLose: number;
    console.log("INIZIO CLASSIFICA PER PERDENTE!!!!");

    leaderboard = await Leaderboard.findByPk(username);

    if(!leaderboard) {
        Leaderboard.create({
            email: username,
            moves_mean: 0,
            wins: 0,
            losses: 1,
            matches: 1,
            dwin: 0,
            dlosses: 0,
        });
        console.log("SE LEADERBOARD NON ESISTEVA ORA E' STATA CREATA");
    }
    
    else {
        console.log("LEADERBOARD GIA' ESISTENTE, AGGIORNO STATISTICHE SCONFITTO");
        numMatch = leaderboard.total_matches + 1;
        numMatchLose = leaderboard.losses + 1;

        leaderboard.update({
            matches: numMatch,
            losses: numMatchLose
        },
        {
            where: { email: username }
        });
    }
    console.log("AGGIORNAMENTO SCONFITTO RIUSCITA!!");
}


/**
* Export the game log as a json file
* @param logMoves -> object containing the moves log
* @param exportPath -> exported file path
*/
export async function exportAsJSON(logMoves: any, exportPath: string) {
    let logMovesJSON = JSON.stringify(logMoves);

    fs.writeFile(exportPath, logMovesJSON, 'utf8', (err: any) => {
        if (err) throw err;
        console.log('Game\'s log exported succesfully to: ', exportPath);
    });
}
export async function exportAsPDF(logMoves: any, exportPath: string){
    const doc = new PDFDocument;
    doc.pipe(fs.createWriteStream(exportPath));
    /*
    const tableContent = {
        headers: ["id_game","id","player","id_pezzo","da_x","da_y","a_x","a_y","ha_mangiato"],
        rows: [logMoves.id_game,logMoves.id,logMoves.id_pezzo,logMoves.da_x,logMoves.da_y,logMoves.a_x,logMoves.a_y,logMoves.ha_mangiato]
    }
    let tableContent2=tableContent.toString();*/
    let logMovesJSON = JSON.stringify(logMoves);
    fs.writeFile(exportPath, logMovesJSON, 'utf8', (err: any) => {
        if (err) throw err;
        console.log('Game\'s log exported succesfully to: ', exportPath);
    });
}


/**
* Export the game log as a csv file
* @param logMoves -> object containing the moves log
* @param exportPath -> exported file path
*/
export async function exportAsCSV(logMoves: any, exportPath: string) {
    //let headerLine: string = 'Player, Row, Col';
    /*
    let moves = logMoves.moves;
    moves.unshift(headerLine);

    var logMovesCSV = moves.map(function(element: any){
        if (element == moves[0]) return element;
        return JSON.stringify(Object.values(element));
    })
    .join('\n')
    .replace(/(^\[)|(\]$)/mg, '');
    */
    let logMovesJSON = JSON.stringify(logMoves);
    fs.writeFile(exportPath, logMovesJSON, 'utf8', (err: any) => {
        if (err) throw err;
        console.log('Game\'s log exported succesfully to: ', exportPath);
    });
}


export function piecesnumber(dimensione: number):number{
    var n: number = 0;

    if(dimensione==4) {
        n=2;
    };

    if(dimensione==6) {
        n=6;
    };

    if(dimensione==8) {
        n=12;
    };

    return n;
}

export async function showUserLimitToken(tokenlimit: number): Promise<any> {
    let userList = models.sequelize.query("SELECT * FROM users  WHERE token <="+tokenlimit,
    {
        raw: true
    });
    return userList
}

/**
 * Query to retrieve the leaderboard from DB
 * @param sort -> sorting method for the leaderboard table
 * @returns -> query result
 */
export async function getLeaderboard(sort: string): Promise<any> {
    let result: any;
    result = await models.sequelize.query("SELECT * FROM leaderboard ORDER BY wins " + sort,
        {
            raw: true
        });
    return (result[0]);
}

export async function isBusy(player:string):Promise<number>{
    let controllo: any;
    /*
    controllo=await models.sequelize.query("SELECT * FROM users WHERE email="+player,
    {
        raw: true
    });
    */
    controllo=models.Users.findByPk(player);
    controllo=JSON.parse(controllo);
    console.log("ISPLAYING:"+controllo);
    return controllo.isplaying;
}
//(data2.getTime()-data.getTime())/60000
export function calcoladurata(dataf: Date,datai: Date):string{//errore nell'uso della funzione gettime: non la riconosce
    let durata: string;
    //var tempo: number = new Date(dataf).getTime() - new Date(datai).getTime();
    var tempo: number=new Date(dataf).valueOf()-new Date(datai).valueOf();
    console.log(tempo);
    //let tempo: number=dataf.getTime()-datai.getTime();//millisecondi
    let secondi: number=Math.round(tempo/1000); //tempo in secondi
    let minuti: number=Math.round(tempo/60000); //tempo in minuti
    let ore: number=Math.round(tempo/3600000); //tempo in ore
    durata=ore.toString()+":"+minuti.toString()+":"+secondi.toString()
    return durata;
}
//let data: Date=new Date;
//console.log(data.getTime());