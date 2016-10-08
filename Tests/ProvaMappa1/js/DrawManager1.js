function DrawManager(tileMap) {

    this.drawObjectLayer= function(layer,loadedObjectImages,ctx){};

    this.drawImgLayer   = function(cam,layer,loadedImages){
        var ctx    = cam.ctx;
        //inizializzo le variabili
        var id  = tileMap.layers.indexOf(layer).toString();
        var img = loadedImages[id];
        //salvo le impostazioni del contesto
        ctx.save();
        //imposto nuove impostazioni generali del contesto
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = layer.opacity;
        //inizio la composizione
        ctx.beginPath();
        //disegno la cella nel contesto
        ctx.drawImage(img, layer.x, layer.y);
        //finisco la composizione
        ctx.closePath();
        //ripristino le impostazioni generali del contesto
        ctx.restore();
    };

    this.drawTileLayer  = function(cam,layer,loadedTileset){
        var ctx    = cam.ctx;
        //inizializzo le variabili
        var ctx_x  = 0;
        var ctx_y  = 0;
        var img_x  = 0;
        var img_y  = 0;
        var img    = null;
        var imgId     ;
        var tileSetId ;
        var dataOnCam = cam.dataOnCtx(layer);
        var index;
        var camIndex;
        //salvo le impostazioni del contesto
        ctx.save();
        //imposto nuove impostazioni generali del contesto
        ctx.globalCompositeOperation = 'source-over';
        ctx.globalAlpha = layer.opacity;
        ctx.translate(-(cam.x % tileMap.tilewidth)-(dataOnCam.otherCol*tileMap.tilewidth),-(cam.y % tileMap.tileheight));
        //inizio la composizione
        //leggo il vettore data
        for (let index = 0; index < dataOnCam.data.length; index++){
            camIndex = dataOnCam.data[index];
            //controllo che la cella sia piena
            if (layer.data[camIndex] !== 0){
                //scelgo il tileset di riferimento
                tileSetId = tileMap.mapManager.setTiles(layer.data[camIndex]);
                //controllo se il tileset è una collezione di immagini
                if (tileMap.tilesets[tileSetId].tiles){
                    //imposto l'immagine del tileset di immagini
                    imgId = layer.data[camIndex] - tileMap.tilesets[tileSetId].firstgid;
                    img   = loadedTileset[tileSetId][imgId];
                }
                else{
                    //imposto il tileset
                    img   = loadedTileset[tileSetId];
                }
                //imposto i parametri der drawImage()
                img_W = tileMap.tilesets[tileSetId].tilewidth ;
                img_H = tileMap.tilesets[tileSetId].tileheight;
                ctx_x = layer.x + cam.ctxPnt(index,dataOnCam.otherCol).x;
                ctx_y = layer.y + cam.ctxPnt(index,dataOnCam.otherCol).y;
                img_x = tileMap.mapManager.imgPnt(tileMap.tilesets[tileSetId],layer.data[camIndex]).x;
                img_y = tileMap.mapManager.imgPnt(tileMap.tilesets[tileSetId],layer.data[camIndex]).y;
                //disegno la cella nel contesto
                //console.log(ctx_x,ctx_y- img_H,camIndex,index);
                //ctx.fillText(camIndex,ctx_x,ctx_y- img_H);
                //ctx.fillText(camIndex,ctx_x+30,ctx_y- img_H);
                ctx.drawImage(img  ,
                              img_x, img_y ,
                              img_W, img_H ,
                              ctx_x, ctx_y - img_H,//punta l'immagine
                              img_W, img_H );      //nell'angolo in basso a sinistra
                }
            }
        //finisco la composizione
        //ripristino le impostazioni generali del contesto
        ctx.restore();
    };

    this.drawMap  = function(cam,loadedAtlas){

        for (let  i = 0; i < tileMap.layers.length; i++){
            //controllo che il livello sia visibile
            if (tileMap.layers[i].visible){
                //controllo il tipo di livello da disegnare nel contesto
                if      (tileMap.layers[i].type === 'tilelayer'  ){
                    this.drawTileLayer(cam,tileMap.layers[i],loadedAtlas.tiles);
                }
                else if (tileMap.layers[i].type === 'imagelayer' ){
                    this.drawImgLayer(cam,tileMap.layers[i],loadedAtlas.images);
                }
                else if (tileMap.layers[i].type === 'objectgroup'){

                }
            }
        }
    };
};
