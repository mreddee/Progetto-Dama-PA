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
    Middleware.checkUserExistRefill
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
    Middleware.checkRemainingToken
]

export const beginMatch = [
    Middleware.checkUserExist,
    Middleware.checkOpponentExist,
    Middleware.checkRemainingToken,
    Middleware.checkUserGame,//controlla il check: vedi se effettivamente se l'avversario è libero
    Middleware.checkSameUser
]

export const makeMove = [
    Middleware.checkUserExist,
    Middleware.checkGameExist,
    Middleware.checkPlayerTurn,
    Middleware.checkGameMove
]

export const gameState = [
    Middleware.checkUserExist,
    Middleware.checkGameExist
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