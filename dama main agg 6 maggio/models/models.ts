import { Database } from "../connection/connection";
import { DataTypes, Sequelize } from 'sequelize';

export const sequelize: Sequelize = Database.connection();

//classe usata solo per generare le singole celle della damiera
//conterrà la posizione di riga e colonna nella damiera, dira' se e' occupata, e da quale pezzo, inseriamo anche la fazione di appartenenza del pezzo che la occupa
//assegno b per bianco e n per nero
export class blocco{
    r: number
    c: number
    occupied: boolean
    occupiedby: string
    faction: string
    constructor(r:number, c: number, occupied:boolean,occupiedby: string,faction:string){
        this.r=r;
        this.c=c;
        this.occupied=occupied;
        this.occupiedby=occupiedby;
        this.faction=faction;
    }

}

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
    //un boolean è tradotto in SQL come TINY INT, un intero ad una cifra e quindi 0 oppure 1
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
    movescount: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    movesw: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    winner: {
        type: DataTypes.STRING(100),
    },
    duration: {
        type: DataTypes.DOUBLE(25,2),
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
    },
    log_mosse: {
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
export const Pezzo = sequelize.define('pezzi', {
    id_game: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    id_pezzo: {
        type: DataTypes.STRING(3),
        primaryKey: true
    },
    is_white: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
    dama: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
    x_pos: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    y_pos: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    lista_coppie_posizioni_possibili: {
        type: DataTypes.JSON,
        allowNull: true
    },
    has_Eaten: {
        type: DataTypes.BOOLEAN,
        allowNull: true
    },
    been_Eaten: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    }
},
{
    modelName: 'pezzi',
    timestamps: false,
    freezeTableName: true
});
export const Mossa = sequelize.define('move', {
    id_game: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true
    },
    id_player: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    id_pezzo: {
        type: DataTypes.STRING(3),
        allowNull: false
    },
    is_white: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
    dama: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
    xpos_in: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    ypos_in: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    xpos_fin: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    ypos_fin: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    ha_mangiato: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    }
},
{
    modelName: 'move',
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
//queste 3 funzioni di sopra devono restituire un pacchetto http, ridefinire in futuro il return

export class Damiera {
    //4x4 2 pezzi nella prima e ultima riga, 6x6 6 pezzi prime due e ultime 2 righe, 8x8 default
    public damiera: blocco[][] = [];
    pezziNeri: Array<string> = [];
    pezziBianchi: Array<string> = [];
    dim: number;
    static damieraToJSON: any;
    //dimensioni possibili: 3,5,7
        public constructor(dim:number){
            this.dim=dim;
            let k=0;
            switch(dim){
                case(3):{
                    this.pezziNeri = ["1N", "2N", "3N", "4N"];
                    this.pezziBianchi = ["1B", "2B", "3B", "4B"];
                    for(let i = 0; i < dim; i++){
                        this.damiera[i] = [];
                        if (i==1) {k=0}
                        for(let j = 0; j < dim; j++){
                                if ((i==0 && i%2==0 && j%2==0)||(i==0 && i%2!=0 && j%2!=0)){
                                    this.damiera[i][j] = new blocco(i,j,true,this.pezziNeri[k],"N");
                                    k++;
                                }
                                if ((i==3 && i%2==0 && j%2==0)||(i==3 && i%2!=0 && j%2!=0)){
                                    this.damiera[i][j] = new blocco(i,j,true,this.pezziBianchi[k],"B");
                                    k++;
                                }
                                else{
                                    this.damiera[i][j] = new blocco(i,j,false,"","");
                                }
                        
                                
                        }
                    }
                    break;
                }
                case(5):{
                    this.pezziNeri=["1N","2N","3N","4N","5N","6N"];
                    this.pezziBianchi=["1B","2B","3B","4B","5B","6B"];
                    for(let i = 0; i < dim; i++){
                        this.damiera[i] = [];
                        if (i==2) {k=0}
                        for(let j = 0; j < dim; j++){
                                if ((i<2 && i%2==0 && j%2==0)||(i<2 && i%2!=0 && j%2!=0)){
                                    this.damiera[i][j] = new blocco(i,j,true,this.pezziNeri[k],"N");
                                    k++;
                                }
                                if ((i>3 && i%2==0 && j%2==0)||(i>3 && i%2!=0 && j%2!=0)){
                                    this.damiera[i][j] = new blocco(i,j,true,this.pezziBianchi[k],"B");
                                    k++;
                                }
                                else{
                                    this.damiera[i][j] = new blocco(i,j,false,"","");
                                }
                        
                                
                        }
                    }
                    break;
                }
                case(7):{
                    this.pezziNeri=["1N","2N","3N","4N","5N","6N","7N","8N","9N","10N","11N","12N"];
                    this.pezziBianchi=["1B","2B","3B","4B","5B","6B","7B","8B","9B","10B","11B","12B"];
                    for(let i = 0; i < dim; i++){
                        this.damiera[i] = [];
                        if (i==3) {k=0}
                        for(let j = 0; j < dim; j++){
                                if ((i<3 && i%2==0 && j%2==0)||(i<3 && i%2!=0 && j%2!=0)){
                                    this.damiera[i][j] = new blocco(i,j,true,this.pezziNeri[k],"N");
                                    k++;
                                }
                                if ((i>=5 && i%2==0 && j%2==0)||(i>=5 && i%2!=0 && j%2!=0)){
                                    this.damiera[i][j] = new blocco(i,j,true,this.pezziBianchi[k],"B");
                                    k++;
                                }
                                else{
                                    this.damiera[i][j] = new blocco(i,j,false,"","");
                                }
                        
                                
                        }
                    }
                    break;
                }
                }

        
        }
    get Damiera(){
        return this.damiera;
    }
    public damieraToJSON(): string{
        return JSON.stringify(this.damiera);
    }

}