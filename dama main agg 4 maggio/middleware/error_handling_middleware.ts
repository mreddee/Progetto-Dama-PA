import { ErrorFactory } from "../responses/error";

/**
 * Si occupa di restituire nella risposta l'errore generato nella catena di validazione del middleware.
 */
export function errorHandler(err: any, req: any, res: any, next: any): void {
    const errorFactory = new ErrorFactory();
    const error = errorFactory.getError(err);
    res.status(error.getStatus()).json({
        "status": error.getStatus(),
        "error": error.getMsg()
    });
}