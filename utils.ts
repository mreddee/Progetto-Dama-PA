import * as models from '../models/models';
import fs from 'fs';
//fare npm install pdfkit
const PDFDocument = require('pdfkit');

/**
* Update leaderboard data for the winning player
* @param username 
*/
//mi faccio restituire tutti i giochi terminati in cui username è il vincitore
//come memorizzare le mosse del giocatore vincitore
//devo fare in modo di memorizzare moves1 se vince player1 e moves2 se vince player2
export async function getAllFinishedGames(username): Promise<any> {
    let games: any = await models.Game.findAll({
            where: {
                in_progress: false,
                winner: username
            }
    });

    return games;
}
export async function countGames(username): Promise<any> {
    let games: any = await models.Game.findAll({
            where: {
                in_progress: false,
                winner: username
            }
    });

    return games;
}

export async function updateLeaderboardWin(username: string): Promise<void> {
    let leaderboard: any;
    let numMatch: number;
    let numMatchWin: number;
    let numMatchLoss: number;
    let meanMoves: any;
    let numD_MatchWin: number;
    let numD_MatchLoss: number;
    //cerco le mosse totali fatte dal giocatore
    
    
    leaderboard = await models.Leaderboard.findByPk(username);
    
    //se la classifica non è mai stata creata viene creata e vengono inseriti i valori dei primi risultati
    //vedere come inserire l'abbandono (probabilmente boolean su games)
    //caso di vittoria classica
    if(!leaderboard) {
        if(!abbandono){
            models.Leaderboard.create({
                username: username,
                moves_mean: 1,//vedere come calcolare la media
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
                moves_mean: 1, //stesso problema di sopra
                wins: 0,
                losses: 0,
                matches: 1,
                dWin: 1,
                dLosses: 0,
            });
        }
        
    }
    else {
        numMatch = leaderboard.total_matches + 1;
        if (!abbandono){
            numMatchWin = leaderboard.wins + 1;
        }
        else{
            numD_MatchWin=leaderboard.dWin+1;
        }
    
        
        models.Leaderboard.update({
            matches: numMatch,
            wins: numMatchWin,
            dWin: numD_MatchWin,
        },
        {
            where: { username: username }
        });
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

    if(!leaderboard) {
        if (!abbandono){
            models.Leaderboard.create({
                username: username,
                moves_mean: 0,
                wins: 0,
                losses: 1,
                matches: 1,
                dWin: 1,
                dLosses: 0
            });
        else{
            models.Leaderboard.create({
                username: username,
                moves_mean: 0,
                wins: 0,
                losses: 0,
                matches: 1,
                dWin: 0,
                dLosses: 1
            });
        }
    }
    else {
        numMatch = leaderboard.total_matches + 1;
        numMatchLose = leaderboard.losses + 1;

        models.Leaderboard.update({
            matches: numMatch,
            losses: numMatchWin,
            dlosses: numD_MatchWin
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