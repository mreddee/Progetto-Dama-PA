/**
 * Interfaccia ErrorI che definisce i seguenti metodi (che devono essere implementati dalle classi che implementano
 * l'interfaccia):
 * -) getStatus(): restituisce il codice di stato HTTP associato alla risposta;
 * -) getMsg(): restituisce il messaggio di errore associato alla risposta.
 */
interface ErrorI {
    getStatus(): number;
    getMsg(): string;
}

class NoAuthHeaderError implements ErrorI {
    getStatus(): number {
        return 400;
    }
    getMsg(): string {
        return "Bad Request - No authorization header"
    }
}

class NoTokenError implements ErrorI {
    getStatus(): number {
        return 400;
    }
    getMsg(): string {
        return "Bad Request - No JWT";
    }
}

class InvalidTokenError implements ErrorI {
    getStatus(): number {
        return 403;
    }
    getMsg(): string {
        return "Forbidden - Invalid JWT (the key is incorrect)";
    }
}

class NotAuthenticatedError implements ErrorI {
    getStatus(): number {
        return 401;
    }
    getMsg(): string {
        return "Unauthorized - The user making the request was not authenticated";
    }
}

class InvalidGameModeError implements ErrorI {
    getStatus(): number {
        return 400;
    }
    getMsg(): string {
        return "Bad Request - Game mode must be: 0 (player vs ia), 1 (player vs player) or 2 (player vs player vs player)";
    }
}

class InvalidNumberOfEmailsError implements ErrorI {
    getStatus(): number {
        return 400;
    }
    getMsg(): string {
        return "Bad Request - The emails do not conform to the game mode"
    }
}

class InvalidGridSizeError implements ErrorI {
    getStatus(): number {
        return 400;
    }
    getMsg(): string {
        return "Bad Request - Grid size must be a number between 3 and 8"
    }
}

class InvalidNumberOfShipsError implements ErrorI {
    getStatus(): number {
        return 400;
    }
    getMsg(): string {
        return "Bad Request - Number of ships must be a number between 1 and half the size of the grid"
    }
}

class InvalidMaximumShipSizeError implements ErrorI {
    getStatus(): number {
        return 400;
    }
    getMsg(): string {
        return "Bad Request - Maximum ship size must be a number between 1 and 3"
    }
}

class InternalServerError implements ErrorI {
    getStatus(): number {
        return 500;
    }
    getMsg(): string {
        return "Internal Server Error - Something went wrong with the database";
    }
}

class NotExistingUserError implements ErrorI {
    getStatus(): number {
        return 404;
    }
    getMsg(): string {
        return "Not Found - The given user/users doesn't/don't exist"
    }
}

class MatchingUsersError implements ErrorI {
    getStatus(): number {
        return 400;
    }
    getMsg(): string {
        return "Bad Request - The given user/users must be different"
    }
}

class InsufficientTokensError implements ErrorI {
    getStatus(): number {
        return 401;
    }
    getMsg(): string {
        return "Unauthorized - Insufficient tokens";
    }
}

class AlreadyPlayingError implements ErrorI {
    getStatus(): number {
        return 401;
    }
    getMsg(): string {
        return "Unauthorized - The given user/users is/are already playing in another game"
    }
}

class InvalidIdGameError implements ErrorI {
    getStatus(): number {
        return 400;
    }
    getMsg(): string {
        return "Bad Request - Id game must be an integer"
    }
}

class NotExistingGameError implements ErrorI {
    getStatus(): number {
        return 404;
    }
    getMsg(): string {
        return "Not Found - The given id doesn't correspond to any game"
    }
}

class AlreadyFinishedGameError implements ErrorI {
    getStatus(): number {
        return 400;
    }
    getMsg(): string {
        return "Bad Request - The game you are looking for has already finished"
    }
}

class NotYourTurnError implements ErrorI {
    getStatus(): number {
        return 401;
    }
    getMsg(): string {
        return "Unauthorized - It's not your turn"
    }
}

class InvalidXAndYError implements ErrorI {
    getStatus(): number {
        return 400;
    }
    getMsg(): string {
        return "Bad Request - X (row of the cell to attack) and Y (column of the cell to attack) must be integers ";
    }
}

class InvalidMoveError implements ErrorI {
    getStatus(): number {
        return 400;
    }
    getMsg(): string {
        return "Bad Request - You are attempting to attack a cell that doesn't exist";
    }
}

class AlreadyDoneMoveError implements ErrorI {
    getStatus(): number {
        return 400;
    }
    getMsg(): string {
        return "Bad Request - Your are attempting to attack a cell that has already been attacked";
    }
}

class InvalidCSVError implements ErrorI {
    getStatus(): number {
        return 400;
    }
    getMsg(): string {
        return "Bad Request - The parameter csv must be a boolean (true: download csv of moves, false: no download)";
    }
}

class InvalidEmailError implements ErrorI {
    getStatus(): number {
        return 400;
    }
    getMsg(): string {
        return "Bad Request - The email must be a string (not null or empty)";
    }
}

class InvalidDatesError implements ErrorI {
    getStatus(): number {
        return 400;
    }
    getMsg(): string {
        return "Bad Request - The dates must be valid and the second one must come after the first one";
    }
}

class InvalidOrderError implements ErrorI {
    getStatus(): number {
        return 400;
    }
    getMsg(): string {
        return "Bad Request - Order must be specified and has to be either 'asc' or 'desc'";
    }
}

class InvalidByError implements ErrorI {
    getStatus(): number {
        return 400;
    }
    getMsg(): string {
        return "Bad Request - By must be specified and has to be either 'games' or 'wins' or 'losses'";
    }
}

class InvalidTokensError implements ErrorI {
    getStatus(): number {
        return 400;
    }
    getMsg(): string {
        return "Bad Request - Tokens must be specified and have to be a double between 0 and 100";
    }
}


export enum ErrorEnum {
    NoAuthHeader,
    NoToken,
    InvalidToken,
    NotAuthenticated,
    InvalidGameMode,
    InvalidNumberOfEmails,
    InvalidGridSize,
    InvalidNumberOfShips,
    InvalidMaximumShipSize,
    InternalServer,
    NotExistingUser,
    MatchingUsers,
    InsufficientTokens,
    AlreadyPlaying,
    InvalidIdGame,
    NotExistingGame,
    AlreadyFinishedGame,
    NotYourTurn,
    InvalidXAndY,
    InvalidMove,
    AlreadyDoneMove,
    InvalidCSV,
    InvalidEmail,
    InvalidDates,
    InvalidOrder,
    InvalidBy,
    InvalidTokens
}

/**
 * Classe ErrorFactory che stabilisce, in base al parametro di input type, quale implementazione di ErrorI utilizzare
 * per creare l'oggetto relativo all'errore.
 */
export class ErrorFactory {
    getError(type: ErrorEnum): ErrorI {
        let error: ErrorI;

        switch(type) {
            case(ErrorEnum.NoAuthHeader):
                error = new NoAuthHeaderError();
                break;
            case(ErrorEnum.NoToken):
                error = new NoTokenError();
                break;
            case(ErrorEnum.InvalidToken):
                error = new InvalidTokenError();
                break;
            case(ErrorEnum.NotAuthenticated):
                error = new NotAuthenticatedError();
                break;
            case(ErrorEnum.InvalidGameMode):
                error = new InvalidGameModeError();
                break;
            case(ErrorEnum.InvalidNumberOfEmails):
                error = new InvalidNumberOfEmailsError();
                break;
            case(ErrorEnum.InvalidGridSize):
                error = new InvalidGridSizeError();
                break;
            case(ErrorEnum.InvalidNumberOfShips):
                error = new InvalidNumberOfShipsError();
                break;
            case(ErrorEnum.InvalidMaximumShipSize):
                error = new InvalidMaximumShipSizeError();
                break;
            case(ErrorEnum.InternalServer):
                error = new InternalServerError();
                break;
            case(ErrorEnum.NotExistingUser):
                error = new NotExistingUserError();
                break;
            case(ErrorEnum.MatchingUsers):
                error = new MatchingUsersError();
                break;
            case(ErrorEnum.InsufficientTokens):
                error = new InsufficientTokensError();
                break;
            case(ErrorEnum.AlreadyPlaying):
                error = new AlreadyPlayingError();
                break;
            case(ErrorEnum.InvalidIdGame):
                error = new InvalidIdGameError();
                break;
            case(ErrorEnum.NotExistingGame):
                error = new NotExistingGameError();
                break;
            case(ErrorEnum.AlreadyFinishedGame):
                error = new AlreadyFinishedGameError();
                break;
            case(ErrorEnum.NotYourTurn):
                error = new NotYourTurnError();
                break;
            case(ErrorEnum.InvalidXAndY):
                error = new InvalidXAndYError();
                break;
            case(ErrorEnum.InvalidMove):
                error = new InvalidMoveError();
                break;
            case(ErrorEnum.AlreadyDoneMove):
                error = new AlreadyDoneMoveError();
                break;
            case(ErrorEnum.InvalidCSV):
                error = new InvalidCSVError();
                break;
            case(ErrorEnum.InvalidEmail):
                error = new InvalidEmailError();
                break;
            case(ErrorEnum.InvalidDates):
                error = new InvalidDatesError();
                break;
            case(ErrorEnum.InvalidOrder):
                error = new InvalidOrderError();
                break;
            case(ErrorEnum.InvalidBy):
                error = new InvalidByError();
                break;
            case(ErrorEnum.InvalidTokens):
                error = new InvalidTokensError();
                break;
        }

        return error;
    }
}