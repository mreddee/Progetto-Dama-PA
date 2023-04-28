import { Database } from "../connection/connection";
import { DataTypes, Sequelize } from 'sequelize';
//classe usata solo per generare le singole celle della damiera
//conterrà la posizione di riga e colonna nella damiera, dira' se e' occupata, e da quale pezzo, inseriamo anche la fazione di appartenenza del pezzo che la occupa
//assegno b per bianco e n per nero
class blocco{
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
//la classe damiera verra' usata per generare il campo da gioco, con il constructor genero il campo e lo popolo con le posizioni iniziali dei pezzi
//per capire il significato degli if, si osservi l'immagine di damieraitaliana.png nella repository,
//si osserva che le pedine inizialmente occupano per righe pari posti a colonne pari e per righe dispari colonna dispari
//il k ci serve per posizionare le specifiche pedine, arrivato a riga 3 sappiamo che abbiamo finito di posizionare i neri, passeremo a riga 5 i bianchi
//che seguono lo stesso pattern posizionale, le posizioni restanti sono lasciate vuote
    export class Damiera extends blocco{
    private damiera: blocco[][]
    private numRighe: number;
    private numCol: number;
    private pezziNeri: Array<string>;
    private pezziBianchi: Array<string>;
    constructor(r:number, c:number,occupied:boolean,occupiedby:string,faction:string,Damiera: blocco[][],numRighe: number,numCol:number,pezziNeri: string, pezziBianchi: string){
        super(r,c,occupied,occupiedby,faction)
        this.damiera=[];
        this.numRighe=7;
        this.numCol=7;
        this.pezziNeri=["1N","2N","3N","4N","5N","6N","7N","8N","9N","10N","11N","12N"];
        this.pezziBianchi=["1B","2B","3B","4B","5B","6B","7B","8B","9B","10B","11B","12B"];
        let k=0;
        for(let i = 0; i < numRighe; i++){
            this.damiera[i] = [];
            if (i==3) {k=0}
            for(let j = 0; j < numCol; j++){
                    if ((i<3 && i%2==0 && j%2==0)||(i<3 && i%2!=0 && j%2!=0)){
                        this.damiera[i][j] = new blocco(i,j,true,pezziNeri[k],"N");
                        k++;
                    }
                    if ((i>=5 && i%2==0 && j%2==0)||(i>=5 && i%2!=0 && j%2!=0)){
                        this.damiera[i][j] = new blocco(i,j,true,pezziBianchi[k],"B");
                        k++;
                    }
                    else{
                        this.damiera[i][j] = new blocco(i,j,false,"","");
                    }
            
                    
            }
        }
        
    }
   public getDamiera(){
       return this.damiera
    }
}
export const Users = sequelize.define('users', {
    email: {
        type: DataTypes.STRING(100),
        primaryKey: true
    },
    username: {
        type: DataTypes.STRING(100),
        primaryKey: true
    },
    isadmin: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
    isplaying: {
        type: DataTypes.BOOLEAN,
        allowNull: false
    },
    token: {
        type: DataTypes.DECIMAL,
        allowNull: false
}
},
{
    modelName: 'users',
    timestamps: false,
    freezeTableName: true
});
export const Game = sequelize.define('game', {
    id_game: {
        type: DataTypes.STRING(100),
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
        allowNull: false
    },
    player_turn: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    moves1: {
        type: DataTypes.SMALLINT,
        allowNull: false
    },
    moves2: {
        type: DataTypes.SMALLINT,
        allowNull: false
    },
    movescount: {
        type: DataTypes.SMALLINT,
        allowNull: false
    },
    winner: {
        type: DataTypes.STRING(100),
    },
    duration: {
        type: DataTypes.FLOAT,
    },
    pieces1: {
        type: DataTypes.SMALLINT,
        allowNull: false
    },
    pieces2: {
        type: DataTypes.SMALLINT,
        allowNull: false
    },
    grid_dim: {
        type: DataTypes.SMALLINT,
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
        type: DataTypes.INT,
        allowNull: false
    },
    id_pezzo: {
        type: DataTypes.STRING,
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
        allowNull: false
    },
    y_pos: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    lista_coppie_posizioni_possibili: {
        type: DataTypes.JSON,
        allowNull: false
    },
    has_Eaten: {
        type: DataTypes.BOOLEAN,
        allowNull: false
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
        type: DataTypes.INT,
        allowNull: false
    },
    id: {
        type: DataTypes.INT,
        primaryKey: true
    },
    id_player: {
        type: DataTypes.STRING,
        allowNull: false
    },
    id_pezzo: {
        type: DataTypes.INT,
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
        type: DataTypes.INT,
        allowNull: false
    },
    ypos_in: {
        type: DataTypes.INT,
        allowNull: false
    },
    xpos_fin: {
        type: DataTypes.INT,
        allowNull: false
    },
    ypos_fin: {
        type: DataTypes.INT,
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

