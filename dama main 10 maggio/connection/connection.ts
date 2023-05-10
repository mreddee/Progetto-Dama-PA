require('dotenv').config();
import { Sequelize } from 'sequelize';


 // Classe che si occupa di stabilire la connessione (unica grazie al pattern singleton) al database attraverso 
 // la libreria Sequelize.


export class Database {
    private static instance: Database;
    private connection: Sequelize;

    private constructor() {
        this.connection = new Sequelize(
            process.env.MYSQL_DATABASE!, process.env.MYSQL_USER!, process.env.MYSQL_PASSWORD, 
            {
                host: process.env.MYSQL_HOST, 
                port: Number(process.env.MYSQL_PORT), 
                dialect: 'mysql'
            }
        );
    }

    public static connection(): Sequelize {
        if(!Database.instance) {
            this.instance = new Database();
        }

        return Database.instance.connection;
    }
}