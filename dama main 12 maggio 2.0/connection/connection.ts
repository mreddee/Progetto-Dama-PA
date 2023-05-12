require('dotenv').config();
import { Sequelize } from 'sequelize';

/*
    Utilizzo del design pattern Singleton per creare una connessione al server mysql,
    per ritornare una nuova istanza se ancora non instanziata e per 
    controllare che vi sia una sola connessione al database.
*/

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