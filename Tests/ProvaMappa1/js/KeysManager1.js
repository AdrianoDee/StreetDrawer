//in html è possibile rilevare solo quando un pulsante da tastiera è premuto e quando esso viene rilasciato
//ogni pulsante da tastiera possiede un codice numerico di riferimento
document.onkeydown = function(event){
    //attivo un indicatore booleano al verificarsi di un dato evento da tastiera
    if (event.keyCode === 87 || event.keyCode === 38) { camera.toUp    = true ;}
    if (event.keyCode === 83 || event.keyCode === 40) { camera.toDown  = true ;}
    if (event.keyCode === 65 || event.keyCode === 37) { camera.toLeft  = true ;}
    if (event.keyCode === 68 || event.keyCode === 39) { camera.toRight = true ;}
};
document.onkeyup   = function(event){
    //attivo un indicatore booleano al verificarsi di un dato evento da tastiera
    if (event.keyCode === 87 || event.keyCode === 38) { camera.toUp    = false ;}
    if (event.keyCode === 83 || event.keyCode === 40) { camera.toDown  = false ;}
    if (event.keyCode === 65 || event.keyCode === 37) { camera.toLeft  = false ;}
    if (event.keyCode === 68 || event.keyCode === 39) { camera.toRight = false ;}
};
