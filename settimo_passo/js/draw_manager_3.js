//disegno la mappa nel contesto assegnato
;function DrawManager(map,cam) {

    //funzione per debug della logica delle collisioni
    this.drawObj = function(){
        var ctx = cam.ctx,
            obj = null;
        if (cam.objOnCam.player.length !== 0){
            for (let i in cam.objOnCam.player){
                obj = cam.objOnCam.player[i];
                ctx.save();
                ctx.lineWidth = 5;
                ctx.beginPath();
                if (obj.ellipse){
                    ctx.ellipse(obj.pnt.x - cam.x,obj.pnt.y - cam.y,obj.w/2,obj.h/2,0,0,2*Math.PI);
                } else {
                    ctx.moveTo(obj.pnt[0].x - cam.x,obj.pnt[0].y - cam.y);
                    for (let j = 1 ; j < obj.pnt.length ; j++){
                        ctx.lineTo(obj.pnt[j].x - cam.x,obj.pnt[j].y - cam.y);
                    }
                    if (!obj.polyline) ctx.lineTo(obj.pnt[0].x - cam.x,obj.pnt[0].y - cam.y);
                }
                ctx.stroke();
                ctx.restore();
            }
        }
        if (cam.objOnCam.objects.length !== 0){
            for (let i in cam.objOnCam.objects){
                obj = cam.objOnCam.objects[i];
                ctx.save();
                ctx.lineWidth = 5;
                ctx.beginPath();
                if (obj.ellipse){
                    ctx.ellipse(obj.pnt.x - cam.x,obj.pnt.y - cam.y,obj.w/2,obj.h/2,0,0,2*Math.PI);
                } else {
                    ctx.moveTo(obj.pnt[0].x - cam.x,obj.pnt[0].y - cam.y);
                    for (let j = 1 ; j < obj.pnt.length ; j++){
                        ctx.lineTo(obj.pnt[j].x - cam.x,obj.pnt[j].y - cam.y);
                    }
                    if (!obj.polyline) ctx.lineTo(obj.pnt[0].x - cam.x,obj.pnt[0].y - cam.y);
                }
                ctx.stroke();
                ctx.restore();
            }
        }
    };

    this.drawImgLayer   = function(layer){
        var ctx    = cam.ctx,
            ctx_x  = layer.x,
            ctx_y  = layer.y,
            //inizializzo le variabili
            img = layer.image;
        //rilevo se l'immagine è solidale alla camera
        //se non si aggiungono proprietà al livello immagine esso rimane privo
        //dell'oggetto "properties" dove vengono collezionate le proprietà opzionali
        //diversamente da quanto accade in un livello celle dove tale oggetto permane vuoto
        if (layer.properties && layer.properties.fixed){
            //inizio la composizione
            //salvo le impostazioni del contesto
            ctx.save();
            //imposto nuove impostazioni generali del contesto
            ctx.globalCompositeOperation = "source-over";
            ctx.globalAlpha = layer.opacity;
            //disegno la cella nel contesto
            ctx.drawImage(img, ctx_x, ctx_y);
            //finisco la composizione
            //ripristino le impostazioni generali del contesto
            ctx.restore();
        } else {
            ctx_x -= cam.x;
            ctx_y -= cam.y;
            //verifico che l'immagine sia in camera
            if ((cam.x <= layer.x + layer.image.width  &&
                cam.x + cam.w >= layer.x )       &&
                (cam.y <= layer.y + layer.image.height &&
                cam.y + cam.h >= layer.y)){
                //inizio la composizione
                //salvo le impostazioni del contesto
                ctx.save();
                //imposto nuove impostazioni generali del contesto
                ctx.globalCompositeOperation = "source-over";
                ctx.globalAlpha = layer.opacity;
                //disegno la cella nel contesto
                ctx.drawImage(img, ctx_x, ctx_y);
                //finisco la composizione
                //ripristino le impostazioni generali del contesto
                ctx.restore();
            }
        }

    };

    this.drawTileLayer  = function(layer){

        var ctx        = cam.ctx,
            ctx_x      = 0,
            ctx_y      = 0,
            tilePkt    = null,
            dataOnCam  = cam.fillData(layer),
            camIndex   = null,
            translate_x= -(cam.x % map.tileSize.w)-(dataOnCam.otherCol*map.tileSize.w),
            translate_y= -(cam.y % map.tileSize.h);

        //salvo le impostazioni del contesto
        ctx.save();
        //imposto nuove impostazioni generali del contesto
        ctx.globalCompositeOperation = "source-over";
        ctx.globalAlpha = layer.opacity;
        ctx.translate(translate_x,translate_y);
        //inizio la composizione
        //leggo il vettore data
        for (let index = 0; index < dataOnCam.data.length; index++){
            camIndex = dataOnCam.data[index];
            //verifico se nella cella ci sono oggetti immagine da renderizzare
            if (camIndex.objects){
                //verifico che il livello sia bottom
                if (layer.properties.bottom){
                    //procedo con la renderizzazine della cella
                    //controllo che la cella sia piena
                    if (layer.data[camIndex.tile] !== 0){
                        //imposto le coordinate dove disegnare nel contesto
                        ctx_x = layer.x + cam.ctxPnt(index,dataOnCam.otherCol).x;
                        ctx_y = layer.y + cam.ctxPnt(index,dataOnCam.otherCol).y;
                        //ottengo il contenuto della cella processando il valore in dat
                        tilePkt = map.getTilePacket(layer.data[camIndex.tile],ctx_x + translate_x + cam.x,ctx_y + translate_y + cam.y);
                        //inserisco eventuali oggetti nel vettore di camManager objOnCam
                        for (let i in tilePkt.obj) {cam.objOnCam.objects.push(tilePkt.obj[i]);}
                        //disegno la cella nel contesto
                        //console.log(ctx_x,ctx_y- img_H,camIndex,index);
                        //ctx.fillText(camIndex,ctx_x,ctx_y- img_H);
                        //ctx.fillText(camIndex,ctx_x+30,ctx_y- img_H);
                        ctx.drawImage(tilePkt.img                ,
                                      tilePkt.x,tilePkt.y        ,
                                      tilePkt.w,tilePkt.h        ,
                                      ctx_x    ,ctx_y - tilePkt.h,
                                      tilePkt.w,tilePkt.h);
                    }
                }
                //inizio la renderizzazione dell'oggetto immagine
                //annullo la traslazione del contesto
                ctx.restore();
                ctx.save();
                ctx.globalCompositeOperation = "source-over";
                for (let j=0; j < camIndex.objects.length; j++){
                    //imposto nuove impostazioni generali del contesto
                    ctx.globalAlpha = camIndex.objects[j].opacity;
                    //impostole coordinate dove disegnare nel contesto
                    ctx_x = Math.floor(layer.x + camIndex.objects[j].ctx_x);
                    ctx_y = Math.floor(layer.y + camIndex.objects[j].ctx_y);
                    //disegno la cella nel contesto
                    //console.log(ctx_x,ctx_y- img_H,camIndex,index);
                    //ctx.fillText(camIndex,ctx_x,ctx_y- img_H);
                    //ctx.fillText(camIndex,ctx_x+30,ctx_y- img_H);
                    ctx.drawImage(camIndex.objects[j].img                ,
                                  camIndex.objects[j].x,camIndex.objects[j].y,
                                  camIndex.objects[j].w,camIndex.objects[j].h,
                                  ctx_x    ,ctx_y - camIndex.objects[j].h,
                                  camIndex.objects[j].w,camIndex.objects[j].h);
                    //ripristino la traslazione del contesto
                }
                ctx.globalAlpha = layer.opacity;
                ctx.translate(translate_x,translate_y);
                //verifico che il livello sia top
                if (layer.properties.top){
                    //procedo con la renderizzazine della cella
                    //controllo che la cella sia piena
                    if (layer.data[camIndex.tile] !== 0){
                        //imposto le coordinate dove disegnare nel contesto
                        ctx_x = layer.x + cam.ctxPnt(index,dataOnCam.otherCol).x;
                        ctx_y = layer.y + cam.ctxPnt(index,dataOnCam.otherCol).y;
                        //ottengo il contenuto della cella processando il valore in dat
                        tilePkt = map.getTilePacket(layer.data[camIndex.tile],ctx_x + translate_x + cam.x,ctx_y + translate_y + cam.y);
                        //inserisco eventuali oggetti nel vettore di camManager objOnCam
                        for (let i in tilePkt.obj) {cam.objOnCam.objects.push(tilePkt.obj[i]);}
                        //disegno la cella nel contesto
                        //console.log(ctx_x,ctx_y- img_H,camIndex,index);
                        //ctx.fillText(camIndex,ctx_x,ctx_y- img_H);
                        //ctx.fillText(camIndex,ctx_x+30,ctx_y- img_H);
                        ctx.drawImage(tilePkt.img                ,
                                      tilePkt.x,tilePkt.y        ,
                                      tilePkt.w,tilePkt.h        ,
                                      ctx_x    ,ctx_y - tilePkt.h,
                                      tilePkt.w,tilePkt.h);
                    }
                }
            } else {
                //controllo che la cella sia piena
                if (layer.data[camIndex] === 0) continue;
                //impostole coordinate dove disegnare nel contesto
                ctx_x = layer.x + cam.ctxPnt(index,dataOnCam.otherCol).x;
                ctx_y = layer.y + cam.ctxPnt(index,dataOnCam.otherCol).y;
                //ottengo il contenuto della cella processando il valore in dat
                tilePkt = map.getTilePacket(layer.data[camIndex],ctx_x + translate_x + cam.x,ctx_y + translate_y + cam.y);
                //inserisco eventuali oggetti nel vettore di camManager objOnCam
                for (let i in tilePkt.obj) {cam.objOnCam.objects.push(tilePkt.obj[i]);}
                //disegno la cella nel contesto
                //console.log(ctx_x,ctx_y- img_H,camIndex,index);
                //ctx.fillText(camIndex,ctx_x,ctx_y- img_H);
                //ctx.fillText(camIndex,ctx_x+30,ctx_y- img_H);
                ctx.drawImage(tilePkt.img                ,
                              tilePkt.x,tilePkt.y        ,
                              tilePkt.w,tilePkt.h        ,
                              ctx_x    ,ctx_y - tilePkt.h,
                              tilePkt.w,tilePkt.h);
            }
        }
        //finisco la composizione
        //ripristino le impostazioni generali del contesto
        ctx.restore();
    };

    this.drawMap  = function(){
        //impedisco alla funzione di partire prima che tutte le immagini
        //siano caricate
        if(!map.fullyLoaded) return;
        cam.ctx.clearRect(0,0,cam.w,cam.h);
        for (let  i = 0; i < map.layers.length; i++){
            //controllo che il livello sia visibile
            if (map.layers[i].visible){
                //controllo il tipo di livello da disegnare nel contesto
                if      (map.layers[i].type === "tilelayer" ){
                    this.drawTileLayer(map.layers[i]);
                }
                else if (map.layers[i].type === "imagelayer"){
                    this.drawImgLayer(map.layers[i]);
                }
            }
        }
        this.drawObj();
    };
};
