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