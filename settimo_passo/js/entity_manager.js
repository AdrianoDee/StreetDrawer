//inserisco le entità in mappa
//spriteSheet è il tileset di riferimento per l'entità
//'x' e 'y' sono le coordinate di partenza dell'entità
;function EntityCreator(map,cam,type,name,spriteSheet,x,y){
//------------------------------------------------------------------------------
//variabili private
var entityObj = null;
    entitiesId = 0;
    entityId = 0;
this.name = name;
//------------------------------------------------------------------------------
//funzioni invocate automaticamente
    //inserisco l'entità nella lista degli oggetti top_enitties della mappa
    (function pushEntity(){
        var i = 0,
            entity = {
                "gid"   : spriteSheet.firstgid,
                "name"  : name,
                "type"  : type,
                "width" : spriteSheet.tilewidth,
                "height": spriteSheet.tileheight,
                "x" : x,
                "y" : y,
                "framePerRow" : Math.floor(spriteSheet.imagewidth/spriteSheet.tilewidth),
                "visible" : true
            };
        for (i in map.layers){
            if (map.layers[i].type === "objectgroup" && map.layers[i].name === "entities"){
                map.layers[i].objects.push(entity);
                entityId = map.layers[i].objects.indexOf(entity);
                entitiesId = i;
                entityObj = map.layers[entitiesId].objects[entityId];
                break;
            }
        }
    }());
//------------------------------------------------------------------------------
//proprietà
    //inizializzo le proprietà per il movimento
    this.directionId = {
        "SS" : spriteSheet.firstgid +(0*entityObj.framePerRow),
        "SE" : spriteSheet.firstgid +(1*entityObj.framePerRow),
        "EE" : spriteSheet.firstgid +(2*entityObj.framePerRow),
        "NE" : spriteSheet.firstgid +(3*entityObj.framePerRow),
        "NN" : spriteSheet.firstgid +(4*entityObj.framePerRow),
        "NW" : spriteSheet.firstgid +(5*entityObj.framePerRow),
        "WW" : spriteSheet.firstgid +(6*entityObj.framePerRow),
        "SW" : spriteSheet.firstgid +(7*entityObj.framePerRow)
    };
    this.direction = "SS";

    this.toUp    = false;
    this.toDown  = false;
    this.toLeft  = false;
    this.toRight = false;
    //imposto la velocità di movimento
    this.speed = 10;
//------------------------------------------------------------------------------
//metodi
    //funzione per il movimento del giocatore
    this.move = function(){
        var key = 0,
            temp_x = entityObj.x,
            temp_y = entityObj.y,
            animationKey = "",
            animation= [];
             if (this.toRight && this.toDown) { temp_x += 0.5*this.speed; temp_y += 0.25*this.speed;
                                                this.direction = "SE";}
        else if (this.toRight && this.toUp  ) { temp_x += 0.5*this.speed; temp_y -= 0.25*this.speed;
                                                this.direction = "NE";}
        else if (this.toLeft  && this.toDown) { temp_x -= 0.5*this.speed; temp_y += 0.25*this.speed;
                                                this.direction = "SW";}
        else if (this.toLeft  && this.toUp  ) { temp_x -= 0.5*this.speed; temp_y -= 0.25*this.speed;
                                                this.direction = "NW";}
        else if (this.toUp   ) { temp_y -= 0.5*this.speed;
                                 this.direction = "NN";}
        else if (this.toDown ) { temp_y += 0.5*this.speed;
                                 this.direction = "SS";}
        else if (this.toLeft ) { temp_x -= this.speed;
                                 this.direction = "WW";}
        else if (this.toRight) { temp_x += this.speed;
                                 this.direction = "EE";}
        else {
            entityObj.gid = this.directionId[this.direction];
            timeManager.stop(name+"_animation");
            //per mantenere il giocatore nella mappa
            entityObj.x = Math.floor(Math.max((map.tileSize.w/2), Math.min(entityObj.x , (map.pixelSize.w)- entityObj.width)));
            entityObj.y = Math.floor(Math.max(entityObj.height, Math.min(entityObj.y , (map.pixelSize.h)-(map.tileSize.h/2))));
            //per far si che la camera si muova assieme al giocatore
            cam.x = Math.floor(Math.max((map.tileSize.w/2), Math.min((entityObj.x -(cam.w/2)+(entityObj.width/2)), (map.pixelSize.w)- cam.w)));
            cam.y = Math.floor(Math.max(0, Math.min((entityObj.y -(cam.h/2)-(entityObj.height/2)), (map.pixelSize.h)- cam.h - (map.tileSize.h/2))));
            return;
        }
        if (typeof collisionManager.collitionTest(temp_x,temp_y,cam.objOnCam.player,cam.objOnCam.objects) === "undefined"){
            entityObj.x = temp_x;
            entityObj.y = temp_y;
            key = this.directionId[this.direction] + 1 - spriteSheet.firstgid;
            animationKey = key;
            animation = spriteSheet.tiles[animationKey].animation;
            entityObj.gid = timeManager.animation(animation,name+"_animation") + spriteSheet.firstgid;
            //per mantenere il giocatore nella mappa
            entityObj.x = Math.floor(Math.max((map.tileSize.w/2), Math.min(entityObj.x , (map.pixelSize.w)- entityObj.width)));
            entityObj.y = Math.floor(Math.max(entityObj.height, Math.min(entityObj.y , (map.pixelSize.h)-(map.tileSize.h/2))));
            //per far si che la camera si muova assieme al giocatore
            cam.x = Math.floor(Math.max((map.tileSize.w/2), Math.min((entityObj.x -(cam.w/2)+(entityObj.width/2)), (map.pixelSize.w)- cam.w)));
            cam.y = Math.floor(Math.max(0, Math.min((entityObj.y -(cam.h/2)-(entityObj.height/2)), (map.pixelSize.h)- cam.h - (map.tileSize.h/2))));
            return;
        } else {
            entityObj.gid = this.directionId[this.direction];
            timeManager.stop(name+"_animation");
            //per mantenere il giocatore nella mappa
            entityObj.x = Math.floor(Math.max((map.tileSize.w/2), Math.min(entityObj.x , (map.pixelSize.w)- entityObj.width)));
            entityObj.y = Math.floor(Math.max(entityObj.height, Math.min(entityObj.y , (map.pixelSize.h)-(map.tileSize.h/2))));
            //per far si che la camera si muova assieme al giocatore
            cam.x = Math.floor(Math.max((map.tileSize.w/2), Math.min((entityObj.x -(cam.w/2)+(entityObj.width/2)), (map.pixelSize.w)- cam.w)));
            cam.y = Math.floor(Math.max(0, Math.min((entityObj.y -(cam.h/2)-(entityObj.height/2)), (map.pixelSize.h)- cam.h - (map.tileSize.h/2))));
            return;
        }
    };
};
