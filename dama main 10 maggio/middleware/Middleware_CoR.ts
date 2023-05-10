import * as Middleware from './middleware';

/* 
    Chains of Responsibility design pattern used to validates
    various user requests 
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

export const noAuthentication = [
    Middleware.checkPayloadHeader,
    Middleware.checkJSONPayload
]

export const checkToken = [
    Middleware.checkUserExist,
    Middleware.checkRemainingToken2
]

export const beginMatch = [
    Middleware.checkUserExist,
    Middleware.checkOpponentExist,
    Middleware.checkRemainingToken,
    Middleware.checkUserGame,//controlla il check: vedi se controlla entrambi
    Middleware.checkUserGame2,
    Middleware.checkSameUser
]

export const makeMove = [
    Middleware.checkUserExist,
    Middleware.checkGameRunning,
    Middleware.checkPlayerTurn,
    Middleware.checkGameMove//il check della mossa gliela facciamo fare nella funzione di controllo?
]

export const gameState = [
    Middleware.checkUserExist,//gamestate e game log sono uguali
    Middleware.checkGameRunning
]

export const gameLog = [
    Middleware.checkUserExist,
    Middleware.checkGameExist
]

export const userStats = [
    Middleware.checkUserExist,
    Middleware.checkDate
]

export const leaderboard = [
    Middleware.checkSortMethod
]