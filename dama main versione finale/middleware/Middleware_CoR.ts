import * as Middleware from './middleware';

/* 
    Pattern Chains of Responsibility usato per il controllo delle richieste utenti
*/

export const authentication = [
    Middleware.checkHeader,
    Middleware.checkToken,
    Middleware.verifyAndAuthenticate
]

export const refill = [
    Middleware.checkAdmin,
    Middleware.checkUserExistRefill,
    Middleware.checkTokenOk
]

export const catchError = [
    Middleware.logErrors,
    Middleware.errorHandler
]

export const checkToken = [
    Middleware.checkUserExist,
    Middleware.checkRemainingToken2
]

export const beginMatch = [
    Middleware.checkUserExist,
    Middleware.checkOpponentExist,
    Middleware.checkRemainingToken,
    Middleware.checkUserGame,
    Middleware.checkUserGame2,
    Middleware.checkSameUser
]

export const makeMove = [
    Middleware.checkUserExist,
    Middleware.checkGameRunning,
    Middleware.checkPlayerTurn,
    Middleware.checkGameMove
]

export const gameState = [
    Middleware.checkUserExist,
    Middleware.checkGameRunning
]

export const gameLog = [
    Middleware.checkUserExist,
    Middleware.checkGameExist
]

export const gameLog2 = [
    Middleware.checkUserExist
]

export const userStats = [
    Middleware.checkUserExist,
    Middleware.checkDate
]

export const leaderboard = [
    Middleware.checkSortMethod
]