//la funzione aggiunge proprietà e metodi alle mappe esistenti nello script
(function(){
    if (TileMaps === undefined){
        console.log('NON SONO STATE INSERITE LE MAPPE NELLO SCRIPT')
    }
    else{
        var maxW;//variabili necessarie per l'assegnazione di
        var maxH;//valori alla proprietà oggetto maxImgDim
        for (let key in TileMaps){
            maxW = 0;
            maxH = 0;
            //trovo le dimensioni maggiori tra le immagini presenti nella mappa
            //questi dati sono necessari per il caricamento di parti della mappa che compaiono in camera prima della loro cella di riferimento
            //percorro i tileset della mappa
            for (let i = 0; i < TileMaps[key].tilesets.length; i++){
                //seleziono i tileset di immagini
                if (TileMaps[key].tilesets[i].tiles){
                    //verifico larghezza e altezza delle immagini
                    if (TileMaps[key].tilesets[i].tilewidth > maxW){maxW = TileMaps[key].tilesets[i].tilewidth ;}
                    if (TileMaps[key].tilesets[i].tileheight> maxH){maxH = TileMaps[key].tilesets[i].tileheight;}
                }
            }
            TileMaps[key].maxImgDim  = {
                W : maxW,
                H : maxH
            };
            //le dimensioni in pixel della mappa intera dipendono dalla proprietà 'isometriche staggered'
            TileMaps[key].pxDimension= {
                W : TileMaps[key].width *TileMaps[key].tilewidth   ,
                H : TileMaps[key].height*TileMaps[key].tileheight/2
            };
            //il metodo mapManager è un oggetto ausiliario all'oggetto per il disegno DrawManager
            TileMaps[key].mapManager = {
                setTiles : function(matrixValue){

                    var id = 0;

                    for (let i = 0; i < this.tilesets.length; i++){

                        if (matrixValue >= this.tilesets[i].firstgid){

                            id = i;
                        }
                    }
                    return  id;
                }.bind(TileMaps[key]),

                imgPnt   : function(tileSet,matrixValue){
                    if (tileSet.imagewidth && tileSet.imageheight){
                        var W       = Math.floor(tileSet.imagewidth / tileSet.tilewidth);
                        var tileW   = tileSet.tilewidth + tileSet.spacing;
                        var tileH   = tileSet.tileheight+ tileSet.spacing;
                        var index   = matrixValue - tileSet.firstgid;

                        return {x : tileSet.margin +           (index % W) * tileW,
                                y : tileSet.margin + Math.floor(index / W) * tileH};
                    }
                    else {
                        return {x : tileSet.margin ,
                                y : tileSet.margin };
                    }
                }.bind(TileMaps[key])
            };
        }
    }
}());
