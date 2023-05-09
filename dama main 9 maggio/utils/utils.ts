import {Game, Leaderboard} from '../models/models';
import {Database} from '../connection/connection'
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

    const [results, metadata] = await Database.connection().query("SELECT AVG(movesw) FROM game WHERE winner="+ username +" GROUP BY winner"); // Raw query - use array destructuring
    const mean=results[0]

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
}

/**
* Update leaderboard data for the losing player
* @param email -> loser email
*/
export async function updateLeaderboardLose(username: string): Promise<void> {
    let leaderboard: any;
    let numMatch: number;
    let numMatchLose: number;
    let winRatio: number;

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
        numMatch = leaderboard.total_matches + 1;
        numMatchLose = leaderboard.losses + 1;

        Leaderboard.update({
            matches: numMatch,
            losses: numMatchLose
        },
        {
            where: { email: username }
        });
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
export function exportAsPDF(logMoves: any, exportPath: string){
    let logMovesJSON = JSON.stringify(logMoves);
    const doc = new PDFDocument;
    doc.pipe(fs.createWriteStream(exportPath)); // write to PDF
    doc.pipe(logMovesJSON);                         //inserisce i log nel pdf
    doc.end;
    console.log('Game\'s log exported succesfully to: ', exportPath);
}


/**
* Export the game log as a csv file
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
* Check if a ship has been sunk and check if the game is over
* @param shipHit 
* @param grid 
* @param gridDim 
* @returns 
*/
export function returnGridState(shipName: string, grid: any, gridDim: number) {
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
    let userList = models.sequelize.query("SELECT * FROM users  WHERE token <= '" + tokenlimit + "'",
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