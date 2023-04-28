import * as models from '../model/models';
import fs from 'fs';
//fare npm install pdfkit
const PDFDocument = require('pdfkit');

/**
* Update leaderboard data for the winning player
* @param email 
*/
export async function updateLeaderboardWin(email: string): Promise<void> {
    let leaderboard: any;
    let numMatch: number;
    let numMatchWin: number;
    let numMatchLoss: number;
    let meanMoves: any;
    let numD_MatchWin: number;
    let numD_MatchLoss: number;

    leaderboard = await models.Leaderboard.findByPk(username);

    if(!leaderboard) {
        models.Leaderboard.create({
            username: username,
            total_matches: 1,
            wins: 1,
            losses: 0,
            win_ratio: 1,
        });
    }
    else {
        numMatch = leaderboard.total_matches + 1;
        numMatchWin = leaderboard.wins + 1;
        winRatio = Math.round((numMatchWin/numMatch + Number.EPSILON) * 100) / 100;

        Leaderboard.update({
            total_matches: numMatch,
            wins: numMatchWin,
            win_ratio: winRatio
        },
        {
            where: { email: email }
        });
    }
}


/**
* Update leaderboard data for the losing player
* @param email -> loser email
*/
export async function updateLeaderboardLose(email: string): Promise<void> {
    let leaderboard: any;
    let numMatch: number;
    let numMatchLose: number;
    let winRatio: number;

    leaderboard = await Leaderboard.findByPk(email);

    if(!leaderboard) {
        Leaderboard.create({
            email: email,
            total_matches: 1,
            wins: 0,
            losses: 1,
            win_ratio: 0
        });
    }
    else {
        numMatch = leaderboard.total_matches + 1;
        numMatchLose = leaderboard.losses + 1;
        winRatio = Math.round((1 - numMatchLose/numMatch + Number.EPSILON) * 100) / 100;

        Leaderboard.update({
            total_matches: numMatch,
            losses: numMatchLose,
            win_ratio: winRatio
        },
        {
            where: { email: email }
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