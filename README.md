# Dama (Progetto PA)
Progetto del corso di Programmazione Avanzata

## Descrizione del progetto
Il progetto consiste nello sviluppo di sistema backend per la gestione del gioco della dama. Il sistema prevede sia la possibilità di far interagire due utenti (autenticati mediante JWT) sia la possibilità che più partite siano attive nello stesso momento. Alla creazione si possono scegliere tre configurazioni di griglie (4x4, 6x6, 8x8) che corrispondono, rispettivamente, a tre diverse configurazioni iniziali di partenza. In particolare, si possono creare nuove partite, effettuare mosse, verificare tutte le info relative ad una partita, comprese di statistiche e di classifica e dello storico delle partite giocate. La creazione di una partita e la singola mossa hanno un costo in termini di token, rispettivamente 0.35 e 0.015.

* Esempio Damiera:
![InteractionOverview](https://github.com/mreddee/Progetto-Dama-PA/blob/main/damiera%20esempio.jpg)



## Funzioni del sistema

| Funzioni | Ruolo |
| -------- | ----- |
| Crea una nuova partita | User |
| Esegue una mossa | User |
| Mostra lo stato di una partita | User |
| Determina l'abbandono di una partita da parte di un utente | User |
| Mostra lo storico delle mosse di una data partita | User |
| Mostra lo storico delle partite in un dato intervallo | User |
| Mostra la classifica dei giocatori ordinata | General |
| Mostra il credito rimasto di un utente | User | 
| Mostra la lista degli utenti con credito residuo inferiore al valore scelto | Admin |
| Ricarica il credito di un utente | Admin |

Ogni funzione è associata ad una diversa richiesta HTTP (POST o GET), per alcune delle quali è prevista un'autenticazione tramite token JWT.

## Rotte 

| Tipo | Rotte |
| ---- | ----- |
| POST | /create-game |
| POST | /make-move |
| GET | /show-game |
| POST | /concede |
| GET | /game-log|
| GET | /games |
| GET | /leaderboard |
| POST | /show-token |
| POST | /show-token-admin |
| POST | /refill |

## Progettazione

### Use Case Diagram

![UseCase](https://github.com/mreddee/Progetto-Dama-PA/blob/main/Schema%20attori.jpg)

### Interaction Overview Diagram

![InteractionOverview](https://github.com/mreddee/Progetto-Dama-PA/blob/main/Interaction%20Overview%20Diagram.jpg)

## Crea una nuova partita (/create-game)
Mediante l'utilizzo di questa rotta si può creare una nuova partita. Questa rotta può essere richiamata solamente dagli utenti autenticati.
L'utente autenticato con JWT può iniziare una partita specificando il nome del player 2 e la dimensione della griglia tra le seguenti configurazioni: 4x4, 6x6, 8x8.

Da effettuare tramite token JWT che deve contenere un payload JSON con la seguente struttura:
~~~
{
    "player2": "player1@gmail.com",
    "dimensione": 4
}
~~~

### Sequence Diagram di /create-game

```mermaid
sequenceDiagram
autonumber
Client->>Router: /create-game
Router->>Middleware CoR: app.post()
Middleware CoR->>Middleware: autentication() 
Middleware->>Middleware: checkHeader()
Middleware->>Middleware: checkToken()
Middleware->>Middleware: verifyAndAuthenticate()
Middleware->>Middleware CoR: next() 
Middleware CoR->>Middleware: beginMatch()
Middleware->>Middleware: checkUserExist()
Middleware->>Controller: checkUser()
Controller->>Model: Users.findByPk()
Model->>Controller: object
Controller->>Middleware: result: boolean
Middleware->>Middleware: checkOpponentExist()
Middleware->>Controller: checkUser()
Controller->>Model: Users.findByPk()
Model->>Controller: object
Controller->>Middleware: result: boolean
Middleware->>Middleware: checkRemainingToken()
Middleware->>Controller: getToken()
Controller->>Model: Users.findByPk()
Model->>Controller: object
Controller->>Middleware: result: number
Middleware->>Middleware: checkUserGame()
Middleware->>Controller: checkGameInProgress()
Controller->>Model: Game.findOne()
Model->>Controller: object
Controller->>Middleware: result: boolean
Middleware->>Middleware: checkUserGame2()
Middleware->>Controller: checkGameInProgress()
Controller->>Model: Game.findOne()
Model->>Controller: object
Controller->>Middleware: result: boolean
Middleware->>Middleware: checkSameUser()
Middleware->>Middleware CoR: next()
Middleware CoR->>Router: next()
Router->>Controller: updateToken()
Controller->>Controller: getToken()
Controller->>Model: Users.findByPk()
Model->>Controller: object
Model->>Controller: number
Controller->>Model: Users.update()
Router->>Controller: createGame()
Controller->>Model: Users.update()
Controller->>Model: Users.update()
Controller->>Model: Game.create()
Controller->>Client: res.status().json
```

## Esegui una mossa (/make-move)
Mediante l'utilizzo di questa rotta si può effettuare una mossa. Questa rotta può essere richiamata solamente dagli utenti autenticati. 
L'utente autenticato tramite JWT, a partire dall'id del gioco e dalle coordinate iniziali (da_x e da_y), sceglie in quale casella muoversi (a_x e a_y). Sono ammesse solo movimenti in diagonale di una casella e all'interno della dimensione del campo da gioco.

La rotta si deve effettuare tramite token JWT che deve contenere un payload JSON con la seguente struttura:
~~~
{
    "id_game": 1,
    "da_x":0,
    "da_y":0,
    "a_x":1,
    "a_y":1
}
~~~

### Sequence Diagram di /make-move

```mermaid
sequenceDiagram
autonumber
Client->>Router: /make-move
Router->>Middleware CoR: app.post()
Middleware CoR->>Middleware: autentication()
Middleware->>Middleware: checkHeader()
Middleware->>Middleware: checkToken()
Middleware->>Middleware: verifyAndAuthenticate()
Middleware->>Middleware CoR: next()
Middleware CoR->>Middleware: makeMove()
Middleware->>Middleware: checkUserExist()
Middleware->>Controller: checkUser()
Controller->>Models: Users.findByPk()
Models->>Controller: object
Controller->>Middleware: result: boolean
Middleware->>Middleware: checkGameRunning()
Middleware->>Controller: checkGameRunningById()
Controller->>Model: Game.findOne()
Model->>Controller: object
Controller->>Middleware: result: boolean
Middleware->>Middleware: checkPlayerTurn()
Middleware->>Controller: checkPlayerTurnById()
Controller->>Models: Game.findByPk()
Models->>Controller: object
Controller->>Middleware: result: boolean
Middleware->>Middleware: checkGameMove()
Middleware->>Controller: checkMove()
Controller->>Models: Game.findByPk()
Models->>Controller: object
Controller->>Middleware: result: boolean
Middleware->>Middleware CoR: next()
Middleware CoR->>Router: next()
Router->>Controller: updateToken()
Controller->>Controller: getToken()
Controller->>Models: Users.findByPk()
Models->>Controller: number
Controller->>Models: Users.update()
Router->>Controller: createMove()
Controller->>Models: Game.findByPk()
Models->>Controller: object
Controller->>Utils: calcoladurata()
Utils->>Controller: string
Controller->>Model: Mossa.create()
Controller->>Model: Game.update()
Controller->>Model: Users.update()
Controller->>Model: Users.update()
Controller->>Utils: updateLeaderboardWin()
Utils->>Models: Leaderboard.findByPk()
Models->>Utils: object
Utils->>Model: Leaderboard.create()
Utils->>Model: Leaderboard.update()
Utils->>Controller: string
Controller->>Client: res.status().json
```

## Mostra lo stato di una partita (/show-game) 
Mediante l'utilizzo di questa rotta si può vedere lo stato di una partita.
L'utente autenticato tramite JWT può vedere lo stato di una partita semplicemente inserendo l'id della partita in corso o terminata. Questa rotta può essere richiamata solamente dagli utenti autenticati.

Il payload JSON deve avere la seguente struttura:
~~~
{
    "id_game": 1
}
~~~

### Sequence Diagram di /show-game

```mermaid
sequenceDiagram
autonumber
Client->>Router: /show-game
Router->>Middleware CoR: app.post()
Middleware CoR->>Middleware: autentication()
Middleware->>Middleware: checkHeader()
Middleware->>Middleware: checkToken()
Middleware->>Middleware: verifyAndAuthenticate()
Middleware->>Middleware CoR: next()
Middleware CoR->>Router: next()
Router->>Controller: showGame()
Controller->>Model: Game.findByPk()
Model->>Controller: object
Controller->>Client: res.send()
```

## Datermina l'abbandono di una partita da parte di un utente (/concede) 
Mediante questa rotta si va a determinare l'abbandono di una partita, dato il suo id univoco, da parte di un utente. Si aggiornano i campi dei modelli Game, Leaderboard e Users. Può essere chiamata solo da utenti autenticati tramite JWT.

Da effettuare tramite token JWT che deve contenere un payload JSON con la seguente struttura:
~~~
{
    "id_game":1
}
~~~

### Sequence Diagram di /concede

```mermaid
sequenceDiagram
autonumber
Client->>Router: /concede
Router->>Middleware CoR: app.post()
Middleware CoR->>Middleware: autentication()
Middleware->>Middleware: checkHeader()
Middleware->>Middleware: checkToken()
Middleware->>Middleware: verifyAndAuthenticate()
Middleware->>Middleware CoR: next()
Middleware CoR->>Middleware: gameState()
Middleware->>Middleware: checkUserExist()
Middleware->>Controller: checkUser()
Controller->>Model: Users.findByPk()
Model->>Controller: object
Controller->>Middleware: result: boolean
Middleware->>Middleware CoR: next()
Middleware CoR->>Middleware: checkGameRunning()
Middleware->>Controller: checkGameRunningById()
Controller->>Model: Game.findOne()
Model->>Controller: object
Controller->>Middleware: result: boolean
Middleware->>Middleware CoR: next()
Middleware CoR->>Router: next()
Router->>Controller: concede()
Controller->>Model: Game.findByPk()
Model->>Controller: object
Controller->>Model: Leaderboard.findByPk()
Model->>Controller: object
Controller->>Model: Leaderboard.findByPk()
Model->>Controller: object
Conttroller->>Utils.calcolodurata()
Utils->>Controller: string
Controller->>Model: Game.update()
Controller->>Model: Leaderboard.update()
Controller->>Model: Leaderboard.update()
Controller->>Model: Users.update()
Controller->>Model: Users.update()
Controller->>Factory: Success().getMsg()
Factory->>Controller: json
Controller->>Client: res.status().json
```
## Mostra lo storico delle mosse di una data partita (/game-log)
Mediante l'utilizzo di questa rotta si può vedere lo storico delle mosse di una partita e di salvarlo nel path specificato sottoforma di JSON, CSV o PDF. Questa rotta può essere richiamata solamente dagli utenti autenticati tramite JWT selezionando, quindi, l'id del gioco, il path e il formato desiderati.

Da effettuare tramite token JWT che deve contenere un payload JSON con la seguente struttura:
~~~
{
    "id_game":1, 
    "path": "/usr/src/app",
    "format": "JSON"
}
~~~

### Sequence Diagram di /game-log

```mermaid
sequenceDiagram
autonumber
Client->>Router: /game-log
Router->>Middleware CoR: app.post()
Middleware CoR->>Middleware: autentication()
Middleware->>Middleware: checkHeader()
Middleware->>Middleware: checkToken()
Middleware->>Middleware: verifyAndAuthenticate()
Middleware->>Middleware CoR: next()
Middleware CoR->>Middleware: gameLog()
Middleware->>Middleware: checkUserExist()
Middleware->>Controller: checkUser()
Controller->>Model: Users.findByPk()
Model->>Controller: object
Controller->>Middleware: result: boolean
Middleware->>Middleware: checkGameExist()
Middleware->>Controller: checkGameExistById()
Controller->>Model: Game.findByPk()
Model->>Controller: object
Controller->>Middleware: result: boolean
Middleware->>Middleware CoR: next()
Middleware CoR->>Router: next()
Router->>Controller: getLog()
Controller->>Model: Mossa.findAll()
Model->>Controller: object
Controller->>Utils: exposrtAsJSON()
Controller->>Utils: exposrtAsCSV()
Controller->>Utils: exposrtAsPDF()
Controller->>Client: res.send()
```

## Mostra lo storico delle partite in un dato intervallo (/games)
Mediante l'utilizzo di questa rotta si può vedere lo storico delle mosse di un giocatore tra la data finale e iniziale specificate. Questa rotta può essere richiamata solamente dagli utenti autenticati tramite JWT.

Da effettuare tramite token JWT che deve contenere un payload JSON con la seguente struttura:
~~~
{
    "email": "player1@gmail.com",
    "date_start": "2023-06-01",
    "date_end": "2023-07-01"
}
~~~

### Sequence Diagram di /games
```mermaid
sequenceDiagram
autonumber
Client->>Router: /games
Router->>Middleware CoR: app.post()
Middleware CoR->>Middleware: autentication()
Middleware->>Middleware: checkHeader()
Middleware->>Middleware: checkToken()
Middleware->>Middleware: verifyAndAuthenticate()
Middleware->>Middleware CoR: next()
Middleware CoR->>Middleware: checkUserExist()
Middleware->>Controller: checkUser()
Controller->>Model: Users.findByPk()
Model->>Controller: object
Controller->>Middleware: result: boolean
Middleware->>Middleware: checkDate()
Middleware->>Middleware CoR: next()
Middleware CoR->>Router: next()
Router->>Controller: getGames()
Controller->>Client: res.send()
```

## Mostra la classifica dei giocatori ordinata (/leaderboard)
Mediante l'utilizzo di questa rotta si può vedere la classifica ordinata in modo crescente o descrescente. Questa rotta è pubblica.

Da effettuare con un payload JSON con la seguente struttura:
* Classifica decrescente
~~~
{
    "sort": "desc"
}
~~~
* Classifica crescente
~~~
{
    "sort": "asc"
}
~~~

### Sequence Diagram di /leaderboard

```mermaid
sequenceDiagram
autonumber
Client->>Router: /leaderboard
Router->>Middleware CoR: app.post()
Middleware CoR->>Middleware: leaderboard()
Middleware->>Middleware: checkSortMethod()
Middleware->>Middleware CoR: next()
Middleware CoR->>Router: next()
Router->>Controller: showLeaderboard()
Controller->>Utils.getLeaderboard()
Utils->>Controller: string
Controller->>Client: res.send()
```

## Mostra credito di un utente (/show-token)
Mediante l'utilizzo di questa rotta si può visualizzare il proprio credito. Questa rotta può essere richiamata dagli utenti autenticati.

Da effettuare solo tramite token JWT.

### Sequence Diagram di /show-token

```mermaid
sequenceDiagram
autonumber
Client->>Router: /show-token
Router->>Middleware CoR: app.post()
Middleware CoR->>Middleware: autentication()
Middleware->>Middleware: checkHeader()
Middleware->>Middleware: checkToken()
Middleware->>Middleware: verifyAndAuthenticate()
Middleware->>Middleware CoR: next()
Middleware CoR->>Middleware: checkToken()
Middleware->>Middleware: checkUserExist()
Middleware->>Controller: checkUser()
Controller->>Model: Users.findByPk()
Model->>Controller: object
Controller->>Middleware: result: boolean
Middleware->>Middleware: checkRemainingToken2()
Middleware->>Controller: getToken()
Controller->>Model: Users.findByPk()
Model->>Controller: object
Controller->>Middleware: result: number
Middleware->>Middleware CoR: next()
Middleware CoR->>Router: next()
Router->>Controller: showToken()
Controller->>Model: Users.findByPk()
Model->>Controller: object
Controller->>Factory: Success().getMsg()
Factory->>Controller: json
Controller->>Client: res.status().json
```
 
## Mostra credito di un utente (/show-token-admin)
Mediante l'utilizzo di questa rotta si mostra la lista degli utenti con credito residuo inferiore al valore scelto. Questa rotta può essere richiamata dagli utenti autenticati con ruolo admin.

Da effettuare tramite token JWT che deve contenere un payload JSON con la seguente struttura:
~~~
{
    "token": 10.000
}
~~~


### Sequence Diagram di /show-token-admin

```mermaid
sequenceDiagram
autonumber
Client->>Router: /show-token-admin
Router->>Middleware CoR: app.post()
Middleware CoR->>Middleware: autentication()
Middleware->>Middleware: checkHeader()
Middleware->>Middleware: checkToken()
Middleware->>Middleware: verifyAndAuthenticate()
Middleware->>Middleware CoR: next()
Middleware CoR->>Middleware: refill()
Middleware->>Middleware: checkAdmin()
Middleware->>Controller: checkUser()
Controller->>Model: Users.findByPk()
Model->>Controller: object
Controller->>Middleware: result: boolean
Middleware->>Controller: getRole()
Controller->>Model: Users.findByPk()
Model->>Controller: object
Controller->>Middleware: result: string
Middleware->>Middleware: checkUserExistRefill()
Middleware->>Controller: checkUser()
Controller->>Model: Users.findByPk()
Model->>Controller: object
Controller->>Middleware: result: boolean
Middleware->>Middleware: checkTokenOk()
Middleware->>Middleware CoR: next()
Middleware CoR->>Router: next()
Router->>Controller: showTokenAdmin()
Controller->>Utils: showUserLimitToken()
Utils->>Controller: number
Controller->>Client: res.status().json
```

## Ricarica il credito di un utente (/refill)
Mediante l'utilizzo di questa rotta si può settare il credito di un utente. Questa rotta può essere richiamata solamente dagli utenti autenticati, con ruolo admin.

Da effettuare tramite token JWT che deve contenere un payload JSON con la seguente struttura:
~~~
{
    "email": "user2@mail.it",
    "token": 50
}
~~~

### Sequence Diagram di /refill

```mermaid
sequenceDiagram
autonumber
Client->>Router: /refill
Router->>Middleware CoR: app.post()
Middleware CoR->>Middleware: autentication()
Middleware->>Middleware: checkHeader()
Middleware->>Middleware: checkToken()
Middleware->>Middleware: verifyAndAuthenticate()
Middleware->>Middleware CoR: next()
Middleware CoR->>Middleware: refill()
Middleware->>Middleware: checkAdmin()
Middleware->>Controller: checkUser()
Controller->>Model: Users.findByPk()
Model->>Controller: object
Controller->>Middleware: result: boolean
Middleware->>Controller: getRole()
Controller->>Model: Users.findByPk()
Model->>Controller: object
Controller->>Middleware: result: string
Middleware->>Middleware: checkUserExistRefill()
Middleware->>Controller: checkUser()
Controller->>Model: Users.findByPk()
Model->>Controller: object
Controller->>Middleware: result: boolean
Middleware->>Middleware: checkTokenOk()
Middleware->>Middleware CoR: next()
Middleware CoR->>Router: next()
Router->>Controller: refill()
Controller->>Model: Users.update()
Controller->>Factory: Success().getMsg() --------> o come show token?
Factory->>Controller: json
Controller->>Client: res.status().json
```

## Pattern utilizzati

### Factory Method:
Il **factory method** è un pattern di progettazione creazionale che fornisce un’interfaccia per la creazione di oggetti in una superclasse, ma consente alle sottoclassi di modificare il tipo di oggetti che verranno creati.  
Nel nostro progetto abbiamo utilizzato questo pattern per generare diverse classi di errori e messaggi di stato in base alle esigenze.  
Il pattern permette, dunque, di rimpiazzare la creazione diretta degli oggetti delle classi di interesse con una più generica chiamata al factory method. Il factory method instanzierà l'oggetto corretto in base all'argomento che riceverà in input. Il vantaggio principale consiste nel poter fare l'override del factory method nelle sotto-classi in modo da specializzarne il comportamento.

### Singleton
Il **singleton** è un design pattern creazionale che ha lo scopo di garantire che di una determinata classe venga creata una e una sola istanza, e di fornire un punto di accesso globale a tale istanza.  
L'uso più comune di tale pattern è quando si vuole garantire e, allo stesso tempo, controllare l'accesso ad una risorsa condivisa, come ad esempio una connessione oppure un file. 
Nel nostro progetto viene utilizzato per generare la connesione al database. Difatti, non appena una porzione di codice vorrà accedere al database, verrà istanziato il singleton. Tuttavia, non appena succesive chiamate tenteranno di accedere nuovamente al database, invece che instanziare una nuova connessione verrà resituita al chiamante l'istanza del singleton già creata. Ciò permette di rispamiare risorse computazionali, dato che mantenere attive delle connessioni inutilmente è "costoso".

### Chain Of Responsibility
La **catena di responsabilità** è un pattern comportamentale che consente di passare le richieste lungo una catena di gestori. Alla ricezione di una richiesta, ciascun handler decide di elaborare la richiesta o di passarla al successivo handler della catena.  
È molto simile ad un decoratore ma a differenza di quest’ultimo, la catena di responsabilità può essere interrotta.  
La Catena di Responsabilità è formata da degli handler (funzioni o metodi), che hanno lo scopo di verificare se quello che gli viene passato soddisfa o meno dei criteri. Se il criterio è soddisfatto, non si ritorna, come avveniva nel Proxy, ma si va avanti passando il controllo all’handler successivo.  
Le funzioni middleware sono funzioni che hanno accesso all'oggetto richiesta (req), all'oggetto risposta (res) e alla successiva funzione middleware nel ciclo richiesta-risposta dell'applicazione. La funzione middleware successiva è comunemente indicata da una variabile denominata next.  
Nel progetto utilizziamo la catena di responsabilità insieme al middleware per verificare che per ciascuna delle operazioni che si vogliono compiere siano rispettati tutti i requisiti, se così non fosse il middleware che non viene rispettato segnalerà l'errore opportuno.

## Avviare il progetto:
Il progetto può essere avviato usando **Docker**.

Steps:
1. Clonare repository
2. Posizionarsi nella directory del repository appena clonato
3. Digitare ```docker compose up```
4. Il programma è in esecuzione nel container docker.

## Testing
Si può testare il progetto eseguendo una serie di test predefiniti, per fare ciò occorre importare all'interno di Postman le due collection presenti nella cartella **postman_collections** all'interno di questo repository.   
I token **JWT**, sono stati generati, utilizzando JWT.IO, tramite la chiave ```secretkey```.  

## Autori
#### Giannelli Edoardo
#### Maccarone Ciro
