//collego lo script al contesto html
var canvas = document.getElementById('plancia');
//imposto la camera con gli argomenti: contesto, mappa, posizione iniziale della camera nella mappa, dimensioni della camera
var camera = new CamManager(canvas, TileMaps['ProvaMappa1'],0,0,1350,625);
//imposto l'oggetto per il disegno dela mappa
var draw   = new DrawManager(TileMaps['ProvaMappa1']);
//carico l'atlante di immagini relative alle mappe presenti sulla pagina
var atlas  = imgLoader.load(TileMaps);

function loop(){
    requestAnimationFrame(loop);//requestAnimationFrame pare il modo migliore per generare animazioni di gioco
    camera.moveCtx();           //aggiorno la posizione della camera nel contesto
    draw.drawMap(camera,atlas); //disegno la porzione di mappa nel contesto
};

window.onload = requestAnimationFrame(loop);
