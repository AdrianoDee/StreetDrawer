//CamManager è un oggetto che gestisce i parametri per la visualizzazione della porzione di mappa in cui è puntata la camera

//CamManager è costruito ai fini di gestire mappe 'isometriche staggered' con ordine 'right-down'

;function CamManager(can,map){
    //imposto automaticamente le dimensioni del contesto in base alla mappa assegnata a CamManager e ai valori W e H
    (function(){
        can.setAttribute('width' , Math.min(window.innerWidth ,map.pixelSize.w));
        can.setAttribute('height', Math.min(window.innerHeight,map.pixelSize.h));
    }());
    //assegno il contesto in cui visualizzare la porzione di mappa
    this.ctx= can.getContext('2d');
    //assegno il punto della mappa in cui si trova la camera
    this.x  = 0;
    this.y  = 0;
    //imposto le dimensioni della camera uguali a quelle del contesto
    this.w  = can.width ;
    this.h  = can.height;
    //rilevo le dimensioni della camera in unità celle della mappa
    this.numCol = Math.ceil(this.w / map.tileSize.w   )+1;
    //il '*2' è dovuto alla visualizzazione 'staggered' della mappa
    this.numRow = Math.ceil(this.h /(map.tileSize.h)*2)+1;
    //numero di colonne in meno e righe in più per garantire la visualizzazione in camera di tutte le porzione di immagine
    //in tal modo immagini che hanno dimensioni superiori a quelle delle celle della mappa
    //possono essere renderizzate correttamente anche quando la loro cella di riferimento non è in camera
    this.maxMinusCol= Math.max(1,Math.ceil(map.maxTileSize.w / map.tileSize.w));
    this.maxPlusRow = Math.max(1,Math.ceil(map.maxTileSize.h / map.tileSize.h)*2);
    //vettore contenente l'elenco delle animazioni visualizzate in camera
    this.animOnCam = {};
    //vettore contenente l'elenco degli oggetti visualizzati in camera
    this.objOnCam = {
        "player"  : [],
        "objects" : [],
        "imgObj"  : {
                    "bottomObj" : [],
                    "topObj"    : []
                    }
    };
    //findObj è un metodo che crea il vettore objOnCam nell'istante in cui viene richiamato
    //findObj restituisce il vettore degli oggetti immagine visibili in camera
    //N.B. gli oggetti di immagini si dividono in 2 tipologie:
    // -bottomObj: oggetti renderizzati assieme al pavimento
    // -topObj: oggetti renderizzati in secondo piano assieme a elementi che si sviluppano anche in altezza
    //per tale ragione findObj ha come parametro l'indicatore del relativo tipo di oggetti da rilevare
    //findObj permette di rilevare oggetti che:
    // -siano di forma convessa
    // -non abbiano angoli di rotazione
    //N.B. il metodo è atto a rilevare le coordinate dei vertici degli oggetti che sono più piccole o più grandi
    //di modo che si possa far uso del 'teorema degli assi separati' per  gestire le collisioni tra gli stessi
    this.findObj = function(player){
        var obj  = null,
            newObj = null,
            max_x= 0,
            min_x= 0,
            max_y= 0,
            min_y= 0,
            max_cam_x = this.x + this.w,
            min_cam_x = this.x,
            max_cam_y = this.y + this.h,
            min_cam_y = this.y,
            type = "";
        //inizializzo la proprietà objOnCam
        this.objOnCam.player = new Array();
        this.objOnCam.objects = new Array();
        this.objOnCam.imgObj.bottomObj = new Array();
        this.objOnCam.imgObj.topObj = new Array();
        //percorro i livelli
        for (let key in map.layers){
            //seleziono i livelli di oggetti e mi assicuro sia visibile
            if (map.layers[key].type != "objectgroup" || !map.layers[key].visible) continue;
            //percorro gli oggetti interni al livello
            obj = map.layers[key].objects;
            for (let i in obj){
                //inizializzo l'oggetto da classificare
                newObj = {};
                //verifico la tipologia dell'oggetto
                if (obj[i].polygon || obj[i].polyline){
                    max_x = obj[i].x + map.layers[key].x;
                    min_x = obj[i].x + map.layers[key].x;
                    max_y = obj[i].y + map.layers[key].y;
                    min_y = obj[i].y + map.layers[key].y;
                    //seleziono il tipo di oggetto
                    if (obj[i].polygon) {type = "polygon";} else {type = "polyline"; newObj.polyline = true;}
                    //seleziono le coordinate maggiori e minori dei vertici
                    for (let j in obj[i][type]){
                        if (max_x < (obj[i].x + map.layers[key].x + obj[i][type][j].x)) max_x = obj[i].x + map.layers[key].x + obj[i][type][j].x;
                        if (min_x > (obj[i].x + map.layers[key].x + obj[i][type][j].x)) min_x = obj[i].x + map.layers[key].x + obj[i][type][j].x;
                        if (max_y < (obj[i].y + map.layers[key].y + obj[i][type][j].y)) max_y = obj[i].y + map.layers[key].y + obj[i][type][j].y;
                        if (min_y > (obj[i].y + map.layers[key].y + obj[i][type][j].y)) min_y = obj[i].y + map.layers[key].y + obj[i][type][j].y;
                    }
                }
                else if (obj[i].hasOwnProperty("gid")){
                    //seleziono il tileset di appartenenza della cella
                    newObj = map.getTilePacket(obj[i].gid,obj[i].x + map.layers[key].x,obj[i].y + map.layers[key].y);
                    //seleziono le coordinate maggiori e minori dei vertici
                    max_x = obj[i].x + map.layers[key].x + newObj.w;
                    min_x = obj[i].x + map.layers[key].x;
                    max_y = obj[i].y + map.layers[key].y;
                    min_y = obj[i].y + map.layers[key].y - newObj.h;
                }
                else {
                    //seleziono le coordinate maggiori e minori dei vertici
                    max_x = obj[i].x + map.layers[key].x + obj[i].width;
                    min_x = obj[i].x + map.layers[key].x;
                    max_y = obj[i].y + map.layers[key].y + obj[i].height;
                    min_y = obj[i].y + map.layers[key].y;
                    //verifico se è o meno un ellisse
                    if (obj[i].ellipse) newObj.ellipse = true;
                }
                //verifico che l'oggetto sia visualizzato in camera o limitrofo ad essa
                //la verifica è grossolana ingloba in camera anche oggetti limitrofi
                if (((min_x <= max_cam_x)&&(min_cam_x <= max_x))&&
                    ((min_y <= max_cam_y)&&(min_cam_y <= max_y))){
                    //se l'oggetto non è una immagine lo inserisco nel vettore objOnCam
                    if (!obj[i].hasOwnProperty("gid")){
                        newObj.x = Math.floor(obj[i].x + map.layers[key].x);
                        newObj.y = Math.floor(obj[i].y + map.layers[key].y);
                        newObj.w = Math.floor(max_x - min_x);
                        newObj.h = Math.floor(max_y - min_y);
                        if (obj[i].polygon || obj[i].polyline){
                            newObj.pnt = [];
                            for (let pnt = 0 ; pnt < obj[i][type].length ; pnt++){
                                newObj.pnt[pnt] = new Object();
                                newObj.pnt[pnt].x = Math.floor(newObj.x + obj[i][type][pnt].x);
                                newObj.pnt[pnt].y = Math.floor(newObj.y + obj[i][type][pnt].y);
                            }
                        } else if (obj[i].ellipse ){
                            newObj.pnt = new Object();
                            newObj.pnt.x = Math.floor(newObj.x +(newObj.w / 2));
                            newObj.pnt.y = Math.floor(newObj.y +(newObj.h / 2));
                        } else {
                            newObj.pnt = [];
                            newObj.pnt[0] = new Object();
                            newObj.pnt[0].x = Math.floor(newObj.x);
                            newObj.pnt[0].y = Math.floor(newObj.y);
                            newObj.pnt[1] = new Object();
                            newObj.pnt[1].x = Math.floor(newObj.x + newObj.w);
                            newObj.pnt[1].y = Math.floor(newObj.y);
                            newObj.pnt[2] = new Object();
                            newObj.pnt[2].x = Math.floor(newObj.x + newObj.w);
                            newObj.pnt[2].y = Math.floor(newObj.y + newObj.h);
                            newObj.pnt[3] = new Object();
                            newObj.pnt[3].x = Math.floor(newObj.x);
                            newObj.pnt[3].y = Math.floor(newObj.y + newObj.h);
                        }
                        this.objOnCam.objects.push(newObj);
                    //altrimenti inserisco il tipo di oggetto immagine nella collezione da restituire
                    } else {
                        //aggiungo all'oggetto immagine le coordinate relative alla mappa
                        newObj.map_x  = Math.floor(min_x);
                        newObj.map_y  = Math.floor(max_y);
                        newObj.ctx_x  = Math.floor(min_x - this.x);
                        newObj.ctx_y  = Math.floor(max_y - this.y);
                        newObj.opacity= map.layers[key].opacity;
                        newObj.id     = 0;
                        //inserisco eventuali oggetti nel vettore di camManager objOnCam
                        for (let i in newObj.obj) {
                            if (obj[i].type === "player" && obj[i].name === player.name){
                                newObj.obj[i].map_x = obj[i].x;
                                newObj.obj[i].map_y = obj[i].y;
                                this.objOnCam.player.push(newObj.obj[i]);
                            } else { this.objOnCam.objects.push(newObj.obj[i]); }
                        }
                        //determino il livello dell'oggetto e lo assegno al vettore relativo
                        if (map.layers[key].properties.bottomObj) this.objOnCam.imgObj.bottomObj.push(newObj);
                        if (map.layers[key].properties.topObj   ) this.objOnCam.imgObj.topObj.push(newObj);
                    }
                }
            }
        }
    }
    //dataOnCam è un metodo di CamManager che legge la proprietà data di un livello
    //dataOnCam colleziona in un vettore gli indici delle celle della mappa da visualizzare nel contesto
    //dataOnCam ordina gli indici in modo che essi possano essere renderizzati secondo 'right-down'
    this.fillData = function(layer){
        var flag = Boolean;
            //creo il vettore di oggeti in camera nel livello
            objLevel = null,
            //creo il vettore degli oggetti su uno stesso tile
            objOnTile= null,
            //creo il vettore di dati
            newData = null,
            //creo la variabile per ordine di renderizzazione degli oggetti su una stessa cella
            obj_y = 0,
            obj_x = 0,
            //rilevo la colonna e la riga della cella in cui è posizionata la camera nella mappa
            //la cella in cui è puntata la mappa è la prima in alto a sinistra del contesto
            startCol= Math.floor(this.x / map.tileSize.w)  ,
            //il '*2' è dovuto alla visualizzazione 'staggered' della mappa
            startRow= Math.floor(this.y / map.tileSize.h)*2,
            //ricerco il numero di colonne da sottrarre all'acquisizione dati
            minusCol= Math.min(startCol, this.maxMinusCol),
            //ricerco il numero di righe da aggiungere all'acquisizione dati
            plusRow = Math.min((layer.height -(startRow + this.numRow)), this.maxPlusRow),
            //aggiungo il numero opportuno di colonne perchè gli oggetti vengano renderizzati correttamente
            plusCol = Math.min((map.numTiles.w-startCol-this.numCol),Math.ceil(this.maxMinusCol/2));
        //inizializzo il vettore newData
        newData  = new Array();
        //rilevo gli oggetti presenti in camera se il livello è atto a contenere oggetti
        if (layer.properties.bottom) objLevel = this.objOnCam.imgObj.bottomObj;
        if (layer.properties.top   ) objLevel = this.objOnCam.imgObj.topObj;
        //rilevo il numero della cella in cui renderizzare gli oggetti immagine
        for (let key in objLevel){
            objLevel[key].id = ((Math.floor(objLevel[key].map_y / map.tileSize.h)*2*layer.width)+Math.floor((objLevel[key].map_x+(objLevel[key].w/2)) / map.tileSize.w));
        }
        //percorro le celle della mappa interne al contesto
        for (let row = startRow; row < startRow + this.numRow + plusRow; row++){
            for (let col = startCol - minusCol; col < startCol + this.numCol + plusCol; col++){
                let tileId = row * layer.width + col;
                flag = true;
                //inizializzo il vettore objOnTile
                objOnTile= new Array();
                //inizializzo il marcatore di ordinata per una giusta renderizzazione
                obj_y = 0;
                obj_x = 0;
                //rilevo il valore dell'indice della cella della mappa e lo inserisco nel vettore
                for (let obj in objLevel){
                    if (tileId === objLevel[obj].id){
                        if (objLevel[obj].map_y > obj_y){
                            obj_y = objLevel[obj].map_y;
                            obj_x = (objLevel[obj].map_x+(objLevel[obj].w/2));
                            objOnTile.push(objLevel[obj]);
                        }
                        else if (objLevel[obj].map_y = obj_y){
                            if((objLevel[obj].map_x+(objLevel[obj].w/2)) > obj_x){
                                obj_x = (objLevel[obj].map_x+(objLevel[obj].w/2));
                                objOnTile.push(objLevel[obj]);
                            } else {
                                objOnTile.unshift(objLevel[obj]);
                            }
                        }
                        else if (objLevel[obj].map_y < obj_y){
                            objOnTile.unshift(objLevel[obj]);
                        }
                        flag = false;
                    }
                }
                if (flag) {newData.push(tileId);} else {newData.push({tile   : tileId   ,
                                                                      objects: objOnTile});}
            }
        }
        return { data    : newData,
                 otherCol: minusCol+plusCol,
                 otherRow: plusRow };
    };
    //ctxPnt è un metodo di CamManager che ha come parametri l'indice del vettore generato dal metodo dataOnCam e il numero di colonne in più da renderizzare
    //ctxPnt restituisce le coordinate del punto da dove deve partire la renderizzazione della cella nel contesto
    this.ctxPnt = function(index,plusCol){
        //imposto il numero di colonne totali da renderizzare
        var numCol = this.numCol + plusCol;
        //controllo che la riga relativa alla cella relativa all'indice sia pari o dispari
        //tale controllo è necessario ai fini della composizione 'isometriche staggered'
        if (Math.floor(index / numCol)%2 === 0){
            return {x : (index % numCol)* map.tileSize.w                              ,
                    y : map.tileSize.h + Math.floor(index / numCol)*(map.tileSize.h/2)};
        } else {
            return {x : (index % numCol)* map.tileSize.w + (map.tileSize.w/2)         ,
                    y : map.tileSize.h + Math.floor(index / numCol)*(map.tileSize.h/2)};
        }
    };
};
