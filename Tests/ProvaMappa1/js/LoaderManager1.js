
(function(){

    if (window.imgLoader === undefined){

        window.imgLoader = {

            tilesLoader : function(tileMap){

                var img = [];
                for (let i = 0; i < tileMap.tilesets.length; i++){
                    //carico i tileset composti da immagini
                    if (tileMap.tilesets[i].tiles){
                        img[i] = [];
                        for (let id in tileMap.tilesets[i].tiles){
                            img[i][id] = new Image();
                            img[i][id].src = tileMap.tilesets[i].tiles[id].image;
                        }
                    }
                    //carico i tileset
                    else {
                        img[i] = new Image();
                        img[i].src = tileMap.tilesets[i].image;
                    }
                }
                return img;
            },
            imagesLoader : function(tileMap){

                var img = {};
                var id;

                for (let i = 0; i < tileMap.layers.length; i++){
                    //cerco i livelli immagine
                    if (tileMap.layers[i].type === 'imagelayer'){
                        //converto l'indice in una stringa che sarà il mio id
                        id = i.toString();
                        //aggiungo l'immagine all'oggetto
                        img[id] = new Image();
                        img[id].src = tileMap.layers[i].image;
                    }
                }
                return img;
            },
            load : function(tileMaps){
                for (let key in tileMaps){
                    var atlas = {};
                    atlas.tiles = this.tilesLoader (tileMaps[key]);
                    atlas.images= this.imagesLoader(tileMaps[key]);
                    return atlas;
                }
            }
        }
    }
}());
