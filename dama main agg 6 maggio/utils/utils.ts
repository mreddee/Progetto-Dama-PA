import {Game, Leaderboard} from '../models/models';
import {Database} from '../connection/connection'
import fs from 'fs';
//fai update leaderboard default win


/**
* Update leaderboard data for the winning player
* @param email 
*/
export async function updateLeaderboardWin(username: string): Promise<void> {
    let leaderboard: any;
    let numMatch: number;
    let numMatchWin: number;
    let winRatio: number;

    const [results, metadata] = await Database.connection().query("SELECT AVG(movesw) FROM game WHERE winner="+ username +" GROUP BY winner"); // Raw query - use array destructuring
    const mean=results[0]

    leaderboard = await Leaderboard.findByPk(username);

    if(!leaderboard) {
        Leaderboard.create({
            username: username,
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
            where: { username: username }
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
            username: username,
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
            where: { username: username }
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

