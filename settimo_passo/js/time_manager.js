//timeManager è un costrutore che si occupa dell agestione dei tempi di animazione
;(function TimeManager(){
//creo l'oggetto per la gestione dei tempi del loop
    window.timeManager      = new Object();
//------------------------------------------------------------------------------
//proprietà
    timeManager.currentTime = Date.now();
    timeManager.signals     = new Object();
//------------------------------------------------------------------------------
//metodi
    timeManager.signal= function(interval,signalId){
        var startTime  = 0,
            currentTime= timeManager.currentTime,
            elapsed    = 0;
        if (timeManager.signals.hasOwnProperty(signalId)){
            startTime  = timeManager.signals[signalId].startTime;
            elapsed    = currentTime - startTime;
            if (interval <= elapsed){
                timeManager.signals[signalId].startTime = currentTime - (elapsed % interval);
                return true;
            } else {
                return false;
            }
        } else {
            timeManager.signals[signalId] = new Object();
            timeManager.signals[signalId].startTime = currentTime;
            return false;
        }
    };
    timeManager.animation= function(animation,animationId){
        var currentFrame = 0,
            frameDuration= 0;
        if (timeManager.signals.hasOwnProperty(animationId)){
            currentFrame = timeManager.signals[animationId].frame;
            frameDuration= animation[currentFrame].duration;
            if (timeManager.signal(frameDuration,animationId)){
                timeManager.signals[animationId].frame++;
                if (timeManager.signals[animationId].frame >= animation.length) timeManager.signals[animationId].frame = 0;
            }
            currentFrame = timeManager.signals[animationId].frame;
        } else {
            timeManager.signals[animationId]           = new Object();
            timeManager.signals[animationId].startTime = timeManager.currentTime;
            timeManager.signals[animationId].frame     = 0;
        }
        return animation[currentFrame].tileid;
    };
    timeManager.speed = function(MSperPX){

    };
    timeManager.stop = function(id){
        if (!timeManager.signals.hasOwnProperty(id)) return;
        delete timeManager.signals[id];
    };
    timeManager.updateTime = function(){
        timeManager.currentTime = Date.now();
    };
}());
