//CamManager è un oggetto che gestisce i parametri per la visualizzazione della porzione di mappa in cui è puntata la camera

//CamManager è costruito ai fini di gestire mappe 'isometriche staggered' con ordine 'right-down'

function CamManager(canvas,tileMap,x,y,W,H){
    //imposto automaticamente le dimensioni del contesto in base alla mappa assegnata a CamManager e ai valori W e H
    (function(){
        canvas.setAttribute('width' , Math.min(W,tileMap.pxDimension.W));
        canvas.setAttribute('height', Math.min(H,tileMap.pxDimension.H));
    }());
    //assegno il contesto in cui visualizzare la porzione di mappa
    this.ctx= canvas.getContext('2d');
    //assegno il punto della mappa in cui si trova la camera
    this.x  = x;
    this.y  = y;
    //inizializzo le proprietà per il movimento della camera
    this.toUp    = false;
    this.toDown  = false;
    this.toLeft  = false;
    this.toRight = false;
    //imposto le dimensioni della camera uguali a quelle del contesto
    this.W  = canvas.width ;
    this.H  = canvas.height;
    //imposto la velocità con cui si potrà muovere la camera
    this.speed = 20;
    //rilevo le dimensioni della camera in unità celle della mappa
    this.numCol = Math.ceil(this.W / tileMap.tilewidth )+1;
    //il '*2' è dovuto alla visualizzazione 'staggered' della mappa
    this.numRow = Math.ceil(this.H / tileMap.tileheight)*2+1;
    //numero di colonne in meno e righe in più per garantire la visualizzazione in camera di tutte le porzione di immagine
    //in tal modo immagini che hanno dimensioni superiori a quelle delle celle della mappa
    //possono essere renderizzate correttamente anche quando la loro cella di riferimento non è in camera
    this.maxMinusCol= Math.max(1,Math.ceil(tileMap.maxImgDim.W / tileMap.tilewidth ));
    this.maxPlusRow = Math.max(1,Math.ceil(tileMap.maxImgDim.H / tileMap.tileheight)*2);
    //dataOnCam è un metodo di CamManager che legge la proprietà data di un livello
    //dataOnCam colleziona in un vettore gli indici delle celle della mappa da visualizzare nel contesto
    //dataOnCam ordina gli indici in modo che essi possano essere renderizzati secondo 'right-down'
    this.dataOnCtx = function(layer){
        var newData = [];
        //rilevo la colonna e la riga della cella in cui è posizionata la camera nella mappa
        //la cella in cui è puntata la mappa è la prima in alto a sinistra del contesto
        var startCol= Math.floor(this.x / tileMap.tilewidth )  ;
        //il '*2' è dovuto alla visualizzazione 'staggered' della mappa
        var startRow= Math.floor(this.y / tileMap.tileheight)*2;
        //ricerco il numero di colonne da sottrarre all'acquisizione dati
        var minusCol= Math.min(startCol, this.maxMinusCol);
        //ricerco il numero di righe da aggiungere all'acquisizione dati
        var plusRow = Math.min((layer.width -(startRow + this.numRow)), this.maxPlusRow);
        //percorro le celle della mappa interne al contesto
        for (let row = startRow; row < startRow + this.numRow + plusRow; row++){
            for (let col = startCol - minusCol; col < startCol + this.numCol; col++){
                //rilevo il valore dell'indice della cella della mappa e lo inserisco nel vettore
                newData.push(row * layer.width + col);
            }
        }
        return { data    : newData,
                 otherCol: minusCol };
    };
    //ctxPnt è un metodo di CamManager che ha come parametri l'indice del vettore generato dal metodo dataOnCam e il numero di colonne in più da renderizzare
    //ctxPnt restituisce le coordinate del punto da dove deve partire la renderizzazione della cella nel contesto
    this.ctxPnt = function(index,plusCol){
        //imposto il numero di colonne totali da renderizzare
        var numCol = this.numCol + plusCol;
        //controllo che la riga relativa alla cella relativa all'indice sia pari o dispari
        //tale controllo è necessario ai fini della composizione 'isometriche staggered'
        if (Math.floor(index / numCol)%2 === 0){
            return {x : (index % numCol)* tileMap.tilewidth                                   ,
                    y : tileMap.tileheight + Math.floor(index / numCol)*(tileMap.tileheight/2)};
        } else {
            return {x : (index % numCol)* tileMap.tilewidth + (tileMap.tilewidth/2)           ,
                    y : tileMap.tileheight + Math.floor(index / numCol)*(tileMap.tileheight/2)};
        }
    };
    //funzione di movimento camera
    this.moveCtx  = function(){
        if (this.toUp   ) { this.y -= this.speed ;}
        if (this.toDown ) { this.y += this.speed ;}
        if (this.toLeft ) { this.x -= this.speed ;}
        if (this.toRight) { this.x += this.speed ;}
        //per mantenere l'entità nello schermo
        this.x = Math.max((tileMap.tilewidth/2), Math.min(this.x , (tileMap.pxDimension.W)- this.W));
        this.y = Math.max(0, Math.min(this.y , (tileMap.pxDimension.H)- this.H - (tileMap.tileheight/2)));
    };
};
