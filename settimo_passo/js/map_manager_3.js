//COSTRUTTORE

//realizza un oggetto mappa con i dati ottenuti tramite XMLHttpRequest()
//possono essere elaborate correttamente le sole mappe editate in TILED con:
// -orientamento "staggered"
// -ordine di renderizzazione "right-down"
// -che non presentino logiche di collisione interne alle celle
//inoltre deve risultare che per ciascun livello di cui è composta la mappa:
// -non vi devono essere traslazioni dello stesso rispetto alla mappa
// -le sue dimensioni devono essere le medesime della mappa

;function MapManager(){

//------------------------------------------------------------------------------
//prorietà processate dal file JSON ottenuto da TILED

    //livelli:
    //vengono riportati tutti i livelli (immagini, celle e oggetti)
    this.layers = [];

    //tilesets:
    //possono essere caricati solo tileset privi di:
    // -collezioni di immagini
    // -animazioni
    // -collisioni
    this.tilesets = [];

    //dimensioni mappa in unità celle
    this.numTiles = {
        "w" : 1,
        "h" : 1
    };

    //dimensioni cella mappa in pixel
    this.tileSize = {
        "w": 128,
        "h": 64
    };

    //dimensioni mappa in pixel
    this.pixelSize = {
        "w": 128,
        "h": 64
    };

    //dimensioni massime tra le celle dei tileset e dei tile di immagine
    this.maxTileSize = {
        "w": 0,
        "h": 0
    };

    //contatore di immagini sorgente caricate
    this.imgLoadCount = 0;

    //bandiera di avvenuto caricamentodell'intera mappa
    this.fullyLoaded = false;

//------------------------------------------------------------------------------
//metodi

    //carico i dati dal file mapJSON presente nel server
    //N.B. il metodo 'load' è momentaneamente sospeso
    //la funzione xhrGet() fa uso di XMLHttpRequest() che necessita di un server
    /*this.load = function (map) {

        //funzione che performa la richiesta XMLHttpRequest al server
        xhrGet(map, false, function (data) {
            //funzione di callback per il caricamento dei dati in MapManager
            this.parseMapJSON(data.responseText);
        });
    };*/

    //processo i dati in formato 'mapJSON'
    //salvo i dati nell'oggetto MapManager
    this.parseMapJSON = function (mapJSON) {
        //chiamata al metodo JSON.parse() e memorizzazione dei dati della mappa
        var map = /*JSON.parse(*/mapJSON/*)*/,//momentaneamente sospeso

            //predispongo gli oggetti necessari all'elaborazione delle immagini
            img = [],
            numImg = 0;
        //rilevo il numero di immagini sorgente totali della mappa
        //rilevo il numero di livelli immagine nella mappa
        for (let i in map.layers){
            if (map.layers[i].type == "imagelayer") numImg++;
        }
        //rilevo il numero di immagini che compongono tileset eterogenei
        for (let i in map.tilesets){
            if (!map.tilesets[i].imageheight && !map.tilesets[i].imagewidth){
                for (id in map.tilesets[i].tiles){
                    if (map.tilesets[i].tiles[id].image) numImg++;
                }
                numImg--;
            }
        }
        numImg += map.tilesets.length;

        //dimensioni mappa in unità celle
        this.numTiles.w = map.width;
        this.numTiles.h = map.height;

        //dimensioni cella della mappa
        this.tileSize.w = map.tilewidth;
        this.tileSize.h = map.tileheight;

        //dimensioni mappa in pixel
        this.pixelSize.w = this.numTiles.w * this.tileSize.w;
        this.pixelSize.h = this.numTiles.h * this.tileSize.h / 2;

        //immagazzino i tilesets nel vettore relativo
        for(let i = 0; i < map.tilesets.length; i++) {
            //carico i tileset composti da immagini
            if (!map.tilesets[i].imageheight && !map.tilesets[i].imagewidth){
                img[i] = new Array();
                //in questo caso la proprietà image sarà un vettore di immagini
                for (let id in map.tilesets[i].tiles){
                    if (map.tilesets[i].tiles[id].image){
                        img[i][id] = new Image();
                        img[i][id].onload = function () {
                            //a caricamento atlante avvenuto incremento il contatore
                            this.imgLoadCount++;
                            //verifico che tutti i file immagine siano stati caricati
                            if (this.imgLoadCount === numImg) {
                                //se la verifica ha successo imposto la bandiera su 'vero'
                                this.fullyLoaded = true;
                            }
                            //imposto le dimensioni della cella più grande presente nella mappa
                            if (img[i][id].width  > this.maxTileSize.w) this.maxTileSize.w = img[i][id].width;
                            if (img[i][id].height > this.maxTileSize.h) this.maxTileSize.h = img[i][id].height;
                        }.bind(this);
                        img[i][id].src = "img/" + map.tilesets[i].tiles[id].image.replace(/^.*[\\\/]/,'');
                    }
                }
            } else {
                //carico i tileset con atlante
                //per ogni tileset carico l'atlante relativo come un immagine
                img[i] = new Image();
                img[i].onload = function () {
                    //a caricamento atlante avvenuto incremento il contatore
                    this.imgLoadCount++;
                    //verifico che tutti i file immagine siano stati caricati
                    if (this.imgLoadCount === numImg) {
                        //se la verifica ha successo imposto la bandiera su 'vero'
                        this.fullyLoaded = true;
                    }
                }.bind(this);
                //imposto la sorgente dell'immagine
                img[i].src = "img/" + map.tilesets[i].image.replace(/^.*[\\\/]/,'');
                //imposto le dimensioni della cella più grande presente nella mappa
                if (map.tilesets[i].tilewidth  > this.maxTileSize.w) this.maxTileSize.w = map.tilesets[i].tilewidth;
                if (map.tilesets[i].tileheight > this.maxTileSize.h) this.maxTileSize.h = map.tilesets[i].tileheight;
            }
            //assegno l'atlante alla proprietà immagine del tileset
            map.tilesets[i].image = img[i];
            //inserisco il tileset nel vettore
            this.tilesets.push(map.tilesets[i]);
        }
        //inserisco i livelli nel vettore relativo
        for(let i = 0; i < map.layers.length; i++) {
            //se il livello è un livello immagini
            //carico l'immagine relativa prima di procedere
            if (map.layers[i].type == "imagelayer"){
                img[i + map.tilesets.length] = new Image();
                img[i + map.tilesets.length].onload = function () {
                    //incremento il contatore di immagini caricate
                    this.imgLoadCount++;
                    //verifico che siano state caricate tutte le immagini
                    if (this.imgLoadCount === numImg) {
                        //imposto il valore della bandiera
                        this.fullyLoaded = true;
                    }
                }.bind(this);
                img[i + map.tilesets.length].src = "img/" + map.layers[i].image.replace(/^.*[\\\/]/,'');
                //assegno l'immagine alla proprietà immagine del livello
                map.layers[i].image = img[i + map.tilesets.length];
            }
            //se è un livello celle aggiungo l'ultimo valore
            if (map.layers[i].data) map.layers[i].data.push(0);
            //inserisco il livello nel vettore
            this.layers.push(map.layers[i]);
        }
    };

    //ad ogni valore del vettore 'data' di ciascun livello associo:
    // -l'immagine dell'atlante relativo al tileset di provenienza della cella
    // -le coordinate e la dimensione della stessa cella
    //perchè vengano anche passati al vettore di camManager objOnCam gli oggetti presenti sul tileSize
    //oltre al dataValue vengono passate alla funzione le coordinate di renderizzazione del tile
    this.getTilePacket = function (dataValue,ctx_x,ctx_y) {
        //genero un oggetto che organizza le informazioni che desidero
        var pkt = {
            "img": null,
            "x": 0,
            "y": 0,
            "w": 0,
            "h": 0
            },
            tile = 0,
            index = 0,
            W = 0,
            tileW = 0,
            tileH = 0,
            obj = null,
            newObj = null;
        //rilevo il tileset di appartenenza della cella
        //effettuo un confronto tra 'dataValue' e il 'firstgid' di ogni tileset
        for(tile = this.tilesets.length - 1; tile >= 0; tile--) {
            if(this.tilesets[tile].firstgid <= dataValue) break;
        }

        // -indice della cella relativo al tileset di appartenenza
        index = dataValue - this.tilesets[tile].firstgid;

        if(!this.tilesets[tile].imageheight && !this.tilesets[tile].imagewidth){
            //assegno le proprietà dal tileset di immagini all'oggetto pkt
            pkt.img = this.tilesets[tile].image[index];
            pkt.w   = this.tilesets[tile].image[index].width -this.tilesets[tile].spacing;
            pkt.h   = this.tilesets[tile].image[index].height-this.tilesets[tile].spacing;
            pkt.x = this.tilesets[tile].margin;
            pkt.y = this.tilesets[tile].margin;
        } else {
            //assegno le proprietà dal tileset all'oggetto pkt
            pkt.img = this.tilesets[tile].image;
            pkt.w   = this.tilesets[tile].tilewidth;
            pkt.h   = this.tilesets[tile].tileheight;

            //inizializzo delle variabili locali utili per rilevare le coordinate
            // -larghezza in celle dell'atlante del tileset
            W     = Math.floor(this.tilesets[tile].imagewidth / pkt.w);
            // -dimensioni delle celle comprensive della spaziatura
            tileW = pkt.w + this.tilesets[tile].spacing;
            tileH = pkt.h + this.tilesets[tile].spacing;

            //assegno le coordinate della cella
            //le coordinate sono relative al margine impostato sul tileset
            pkt.x = this.tilesets[tile].margin + Math.floor(index % W) * tileW;
            pkt.y = this.tilesets[tile].margin + Math.floor(index / W) * tileH;
        }
        //verifico l'esistenza di un'animazione corrispondente alla cella in questione
        if (this.tilesets[tile].tiles && this.tilesets[tile].tiles[index] && this.tilesets[tile].tiles[index].animation){
            pkt.animation = this.tilesets[tile].tiles[index].animation;
        }
        //ai fini del controllo delle collisioni aggiungo agli oggetti in camera le colisioni presenti sui tile renderizzati
        //in questo modo la verifica degli oggetti in camera avviene in due tempi:
        //- vi è una chiamata di funzione prima che venga renderizzato il contesto tramite 'findObj' metodo dell'oggetto camManager
        //- poi durante la renderizzazione del contesto vengono aggiunti oggetti presenti sui singoli tile in camera
        if (this.tilesets[tile].tiles && this.tilesets[tile].tiles[index] && this.tilesets[tile].tiles[index].objectgroup){
            pkt.obj = [];
            obj = this.tilesets[tile].tiles[index].objectgroup.objects;
            for (let i in obj){
                //inizializzo l'oggetto da classificare
                newObj = {};
                //verifico la tipologia dell'oggetto
                newObj.x = Math.floor(ctx_x + obj[i].x);
                newObj.y = Math.floor(ctx_y + obj[i].y - pkt.h);
                newObj.w = Math.floor(obj[i].width);
                newObj.h = Math.floor(obj[i].height);
                if (obj[i].polygon){
                    newObj.pnt = [];
                    for (let pnt = 0 ; pnt < obj[i].polygon.length ; pnt++){
                        newObj.pnt[pnt] = new Object();
                        newObj.pnt[pnt].x = Math.floor(newObj.x + obj[i].polygon[pnt].x);
                        newObj.pnt[pnt].y = Math.floor(newObj.y + obj[i].polygon[pnt].y);
                    }
                } else if (obj[i].polyline){
                    newObj.pnt = [];
                    newObj.polyline = true;
                    for (let pnt = 0 ; pnt < obj[i].polyline.length ; pnt++){
                        newObj.pnt[pnt] = new Object();
                        newObj.pnt[pnt].x = Math.floor(newObj.x + obj[i].polyline[pnt].x);
                        newObj.pnt[pnt].y = Math.floor(newObj.y + obj[i].polyline[pnt].y);
                    }
                } else if (obj[i].ellipse ){
                    newObj.pnt = new Object();
                    newObj.ellipse = true;
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
                pkt.obj.push(newObj);
            }
        }
        //restituisco l'oggetto pkt
        return pkt;
    };
};
