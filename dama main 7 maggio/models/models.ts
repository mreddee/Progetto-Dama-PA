import { Database } from "../connection/connection";
import { DataTypes, Sequelize } from 'sequelize';

export const sequelize: Sequelize = Database.connection();


export const Users = sequelize.define('users', {
    email: {
        type: DataTypes.STRING(100),
        primaryKey: true
    },
    username: {
        type: DataTypes.STRING(100)
        
    },
    isadmin: {
        type: DataTypes.BOOLEAN,
        allowNull: true
    },
    isplaying: {
        type: DataTypes.BOOLEAN,
        allowNull: true
    },
    token: {
        type: DataTypes.DOUBLE(25,3),
        allowNull: true
}
},
{
    modelName: 'users',
    timestamps: false,
    freezeTableName: true
});

export const Game = sequelize.define('game', {
    id_game: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    player1: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    player2: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    in_progress: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
    date_start: {
        type: DataTypes.DATE,
        allowNull: false
    },
    date_end: {
        type: DataTypes.DATE,
        allowNull: true
    },
    player_turn: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    moves1: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    moves2: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    winner: {
        type: DataTypes.STRING(100),
        allowNull: true
    },
    pieces1: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    pieces2: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    abbandono1:{
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
    abbandono2:{
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
    dimensione: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    board: {
        type: DataTypes.JSON,
        allowNull: false
    }
},
{
    modelName: 'game',
    timestamps: false,
    freezeTableName: true
});

export const Leaderboard = sequelize.define('leaderboard', {
    username: {
        type: DataTypes.STRING(100),
        primaryKey: true
    },
    moves_mean: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    wins: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    losses: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    matches: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    dwins: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    dlosses: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
},
{
    modelName: 'leaderboard',
    timestamps: false,
    freezeTableName: true
});


export const Mossa = sequelize.define('moves', {
    id_game: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true
    },
    player: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    id_pezzo: {
        type: DataTypes.STRING(3),
        allowNull: false
    },
    da_x: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    da_y: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    a_x: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    a_y: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    ha_mangiato: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    }
},
{
    modelName: 'moves',
    timestamps: false,
    freezeTableName: true
});

/*
 * Funzione che verifica l'esistenza di un utente nel database, data la sua email.
 */
 export async function checkIfUserExists(email: string,res: any): Promise<boolean> {
    const [results,metadata]= await sequelize.query("SELECT email FROM users WHERE email="+ email);
    if (results !== null || results !== undefined) {
        return true;
    } else {
        return false;
    };
}

export async function checkIfAdmin(email: string): Promise<boolean> {
    const [results,metadata]= await sequelize.query("SELECT email FROM users WHERE email="+ email);
    
    if(results !== null || results !== undefined) {
        return true;//results[0] === 'admin';
    } else {
        return false;
    }
}

export async function checkIfUsersExist(email1: string, email2: string): Promise<boolean> {
    const [results,metadata]= await sequelize.query("SELECT email1,email2 FROM game WHERE player1="+ email1+"AND PLAYER2="+email2);
    if (results !== null || results !== undefined) {
        return true;
    } else {
        return false;
    };
}