//in html è possibile rilevare solo quando un pulsante da tastiera è premuto e quando esso viene rilasciato
//ogni pulsante da tastiera possiede un codice numerico di riferimento
document.onkeydown = function(event){
    //attivo un indicatore booleano al verificarsi di un dato evento da tastiera
    if (event.keyCode === 87 || event.keyCode === 38) { player01.toUp    = true ;}
    if (event.keyCode === 83 || event.keyCode === 40) { player01.toDown  = true ;}
    if (event.keyCode === 65 || event.keyCode === 37) { player01.toLeft  = true ;}
    if (event.keyCode === 68 || event.keyCode === 39) { player01.toRight = true ;}
};
document.onkeyup   = function(event){
    //attivo un indicatore booleano al verificarsi di un dato evento da tastiera
    if (event.keyCode === 87 || event.keyCode === 38) { player01.toUp    = false ;}
    if (event.keyCode === 83 || event.keyCode === 40) { player01.toDown  = false ;}
    if (event.keyCode === 65 || event.keyCode === 37) { player01.toLeft  = false ;}
    if (event.keyCode === 68 || event.keyCode === 39) { player01.toRight = false ;}
};
