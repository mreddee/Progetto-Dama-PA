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
        type: DataTypes.INTEGER,
        allowNull: true
    },
    isplaying: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0
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
        type: DataTypes.INTEGER,
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
        type: DataTypes.INTEGER,
        allowNull: false
    },
    abbandono2:{
        type: DataTypes.INTEGER,
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
    email: {
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
        type: DataTypes.INTEGER,
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



//Prove per me

export class blocco{
    r: number
    c: number
    occupied: number
    occupiedby: string
    faction: string
    dama: number 
    constructor(r:number, c: number, occupied:number,occupiedby: string,faction:string, dama: number){
        this.r=r;
        this.c=c;
        this.occupied=occupied;
        this.occupiedby=occupiedby;
        this.faction=faction;
        this.dama=dama;
    }

}
export class Damiera {
    //4x4 2 pezzi nella prima e ultima riga, 6x6 6 pezzi prime due e ultime 2 righe, 8x8 default
    public damiera: blocco[][] = [];
    pezziNeri: Array<string> = [];
    pezziBianchi: Array<string> = [];
    dim: number;
    static damiera: any;
    //dimensioni possibili: 3,5,7
        public constructor(dim:number){
            this.dim=dim;
            let k=0;
            let sistemato:boolean=false;
            switch(dim){
                case(4):{//quando carica i pezzzi i neri non li mette correttamente
                    this.pezziNeri = ["1N", "2N", "3N", "4N"];
                    this.pezziBianchi = ["1B", "2B", "3B", "4B"];
                    
                    for(let i = 0; i < dim; i++){
                        this.damiera[i] = [];
                        if (i==1) {k=0}
                        for(let j = 0; j < dim; j++){
                                if (i==0 && j%2==0){
                                    this.damiera[i][j] = new blocco(i,j,1,this.pezziNeri[k],"N",0);
                                    k++;
                                    sistemato=true;
                                }
                                else if((i==3 && i%2==0 && j%2==0)||(i==3 && i%2!=0 && j%2!=0)){
                                    this.damiera[i][j] = new blocco(i,j,1,this.pezziBianchi[k],"B",0);
                                    k++;
                                    sistemato=true;
                                }
                                else if(sistemato==false){
                                    this.damiera[i][j] = new blocco(i,j,0,"","",0);
                                }
                                sistemato=false;
                        
                                
                        }
                    }
                    /*PEZZA PER POSIZIONARE CORRETTAMENTE I PEZZI NERI
                    k=0;
                    this.damiera[0][0]=new blocco(0,0,0,this.pezziNeri[k],"N",0);
                    k++;
                    this.damiera[0][2]=new blocco(0,2,0,this.pezziNeri[k],"N",0);
                    k=0;
                    */
                    break;
                }
                case(6):{
                    this.pezziNeri=["1N","2N","3N","4N","5N","6N"];
                    this.pezziBianchi=["1B","2B","3B","4B","5B","6B"];
                    for(let i = 0; i < dim; i++){
                        this.damiera[i] = [];
                        if (i==2) {k=0}
                        for(let j = 0; j < dim; j++){
                                if ((i<2 && i%2==0 && j%2==0)||(i<2 && i%2!=0 && j%2!=0)){
                                    this.damiera[i][j] = new blocco(i,j,1,this.pezziNeri[k],"N",0);
                                    k++;
                                    sistemato=true;
                                }
                                else if ((i>3 && i%2==0 && j%2==0)||(i>3 && i%2!=0 && j%2!=0)){
                                    this.damiera[i][j] = new blocco(i,j,1,this.pezziBianchi[k],"B",0);
                                    k++;
                                    sistemato=true;
                                }
                                else if (sistemato==false){
                                    this.damiera[i][j] = new blocco(i,j,0,"","",0);
                                }
                                sistemato=false;
                        
                                
                        }
                    }
                    break;
                }
                case(8):{
                    this.pezziNeri=["1N","2N","3N","4N","5N","6N","7N","8N","9N","10N","11N","12N"];
                    this.pezziBianchi=["1B","2B","3B","4B","5B","6B","7B","8B","9B","10B","11B","12B"];
                    for(let i = 0; i < dim; i++){
                        this.damiera[i] = [];
                        if (i==3) {k=0}
                        for(let j = 0; j < dim; j++){
                                if ((i<3 && i%2==0 && j%2==0)||(i<3 && i%2!=0 && j%2!=0)){
                                    this.damiera[i][j] = new blocco(i,j,1,this.pezziNeri[k],"N",0);
                                    k++;
                                    sistemato=true;
                                }
                                else if ((i>=5 && i%2==0 && j%2==0)||(i>=5 && i%2!=0 && j%2!=0)){
                                    this.damiera[i][j] = new blocco(i,j,1,this.pezziBianchi[k],"B",0);
                                    k++;
                                    sistemato=true;
                                }
                                else if(sistemato==false){
                                    this.damiera[i][j] = new blocco(i,j,0,"","",0);
                                }
                                sistemato=false;
                                
                        }
                    }
                    break;
                }
                }

        
        }

}
