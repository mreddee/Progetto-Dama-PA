import {Game, Leaderboard} from '../models/models';
import fs from 'fs';
import * as models from '../models/models';
const PDFDocument = require('pdfkit');
import moment from 'moment';
const Sequelize = require('sequelize');
/**
 * Aggiorna statistiche del vincitore in classifica
 * @param username email del vincitore a cui aggiornare la classifica
 */
export async function updateLeaderboardWin(username: string): Promise<void> {
    let leaderboard: any;
    let numMatch: number;
    let numMatchWin: number;
    const mean: any = await Game.findAll({
        attributes: [
          [Sequelize.fn('AVG', models.sequelize.col('movesw')), 'averageMoves']
        ],
        where: {
          winner: username
        }
      });
    
    const average = mean[0].dataValues.averageMoves;
    leaderboard = await Leaderboard.findByPk(username);

    if(!leaderboard) {
        console.log("CLASSIFICA INESISTENTE LA CREO DA ZERO")
        Leaderboard.create({
            email: username,
            moves_mean: average,
            wins: 1,
            losses: 0,
            matches: 1,
            dwin: 0,
            dlosses: 0,
        });
    }
    else {
        console.log("CLASSIFICA ESISTENTE LA AGGIORNO");
        numMatch = leaderboard.matches + 1;
        numMatchWin = leaderboard.wins + 1;

        Leaderboard.update({
            matches: numMatch,
            wins: numMatchWin,
            moves_mean: average
        },
        {
            where: { email: username }
        });
    }
    console.log("FINE AGGIORNAMENTO CLASSIFICA PER VINCITORE");
}

/**
* Aggiornamento statistiche classifica giocatore sconfitto
* @param username giocatore sconfitto
*/
export async function updateLeaderboardLose(username: string): Promise<void> {
    let leaderboard: any;
    let numMatch: number;
    let numMatchLose: number;

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
    }
    
    else {
        console.log("LEADERBOARD GIA' ESISTENTE, AGGIORNO STATISTICHE SCONFITTO");
        numMatch = leaderboard.matches + 1;
        numMatchLose = leaderboard.losses + 1;

        Leaderboard.update({
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
* Funzione per creazione file di json
* @param logMoves Contenuto del file
* @param exportPath percorso destinazione file
*/
export async function exportAsJSON(logMoves: any, exportPath: string) {
    let logMovesJSON = JSON.stringify(logMoves);

    fs.writeFile(exportPath, logMovesJSON, 'utf8', (err: any) => {
        if (err) throw err;
        console.log('Game\'s log exported succesfully to: ', exportPath);
    });
}

/**
* Funzione per creazione file di PDF
* @param logMoves Contenuto del file
* @param exportPath percorso destinazione file
*/
export async function exportAsPDF(logMoves: any, exportPath: string){
    const doc = new PDFDocument;
    doc.pipe(fs.createWriteStream(exportPath));
    let logMovesJSON = JSON.stringify(logMoves);
    fs.writeFile(exportPath, logMovesJSON, 'utf8', (err: any) => {
        if (err) throw err;
        console.log('Game\'s log exported succesfully to: ', exportPath);
    });
}

/**
* Funzione per creazione file di CSV
* @param logMoves Contenuto del file
* @param exportPath percorso destinazione file
*/
export async function exportAsCSV(logMoves: any, exportPath: string) {
    let logMovesJSON = JSON.stringify(logMoves);
    fs.writeFile(exportPath, logMovesJSON, 'utf8', (err: any) => {
        if (err) throw err;
        console.log('Game\'s log exported succesfully to: ', exportPath);
    });
}

/**
 * Funzione che determina il numero di pezzi delle due squadre a seconda della dimensione del campo da gioco
 * @param dimensione dimensione campo da gioco
 * @returns numero di pezzi a disposizione per ogni giocatore
 */
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

/**
 * Funzione che restituisce tutti i giocatori con credito pari o inferiore a token limit
 * @param tokenlimit 
 * @returns 
 */
export async function showUserLimitToken(tokenlimit: number): Promise<any> {
    let userList = models.sequelize.query("SELECT * FROM users  WHERE token <="+tokenlimit,
    {
        raw: true
    });
    return userList
}

/**
 * Restituisce classifica ordinata dei giocatori per vittorie
 * @param sort criterio ordinamento
 * @returns risultato query
 */
export async function getLeaderboard(sort: string): Promise<any> {
    let result: any;
    result = await models.sequelize.query("SELECT * FROM leaderboard ORDER BY wins " + sort,
        {
            raw: true
        });
    return (result[0]);
}

/**
 * Funzione per il calcolo della durata della partita
 * @param datai data inizio partita
 * @returns periodo trascorso da inizio partita fino a fine partita
 */
export function calcoladurata(datai: Date):string{
    const dataf=moment();
    const inizioMoment = moment(datai);
    const duration = moment.duration(dataf.diff(inizioMoment));
    const hours = duration.get('hours');
    const minutes = duration.get('minutes');
    const seconds = duration.get('seconds'); 
    const formattedDuration = `${hours}:${minutes}:${seconds}`;
    return formattedDuration;
    
}



