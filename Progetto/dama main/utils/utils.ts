import * as models from '../models/models';
import fs, { promises } from 'fs';
import Sequelize from 'sequelize';
import { Database } from "../connection/connection";
//fare npm install pdfkit
const PDFDocument = require('pdfkit');


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