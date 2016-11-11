//collego lo script al contesto html
var canvas = document.getElementById('plancia');

//imposto l'oggetto per il disegno dela mappa
var mappa  = new MapManager();

//carico l'atlante di immagini relative alle mappe presenti sulla pagina
mappa.parseMapJSON(TileMaps["prova_mappa_3"]/*TileMaps["prova_mappa"]*/);

//imposto la camera con gli argomenti: contesto, mappa, posizione iniziale della camera nella mappa
var camera = new CamManager(canvas,mappa);

var drawManager = new DrawManager(mappa,camera);

var player01 = new EntityCreator(mappa,camera,"player","Madrediddio",mappa.tilesets[2],1000,1000);

function loop(){
    requestAnimationFrame(loop);//requestAnimationFrame pare il modo migliore per generare animazioni di gioco
    timeManager.updateTime();
    camera.findObj(player01);
    drawManager.drawMap();
    player01.move();
};

//attendo che il caricamento della pagina sia ultimato
window.onload = function(){
    //imposto il numero di colonne e righe da aggiungere alla renderizzazione
    //basandomi sulle dimensioni dell'immagine più grande riportata in mappa
    camera.maxMinusCol= Math.max(1,Math.ceil(mappa.maxTileSize.w / mappa.tileSize.w));
    camera.maxPlusRow = Math.max(1,Math.ceil(mappa.maxTileSize.h / mappa.tileSize.h)*2);
    requestAnimationFrame(loop);
}

//controllo i ridimensionamenti della finestra per adattare lo schermo
window.onresize = function(event){
    canvas.width = Math.min(mappa.pixelSize.w, window.innerWidth );
    canvas.height= Math.min(mappa.pixelSize.h, window.innerHeight);
    camera.w = canvas.width;
    camera.h = canvas.height;
    camera.numCol = Math.ceil(camera.w / mappa.tileSize.w   )+1;
    camera.numRow = Math.ceil(camera.h /(mappa.tileSize.h)*2)+1;

};
