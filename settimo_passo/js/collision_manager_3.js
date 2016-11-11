
;(function CollisionManager(){
    //creo l'oggetto per la gestione delle collisioni
    window.collisionManager = new Object();
    //funzione per il rilevamento della distanza tra due punti
    //restituisce la distanza
    collisionManager.getDistance = function(pnt_1 , pnt_2){
        return (Math.sqrt(((pnt_1.x-pnt_2.x)*(pnt_1.x-pnt_2.x))+((pnt_1.y-pnt_2.y)*(pnt_1.y-pnt_2.y))));
    };
    //funzione che restituisce il vertice di un oggetto più vicino ad un dato punto
    //restituisce l'indice del punto
    collisionManager.getClosestPnt = function(pnt_centre , objPnts){
        var minDist = collisionManager.getDistance(pnt_centre , objPnts[0]),
            pnt_id = 0;
        for (let pnt = 1 ; pnt < objPnts.length ; pnt++){
            if (collisionManager.getDistance(pnt_centre , objPnts[pnt]) < minDist){
                minDist = collisionManager.getDistance(pnt_centre , objPnts[pnt]);
                pnt_id = pnt;
            }
        }
        return pnt_id;
    };
    //funzione per rilevare i vertici adiacenti ad un dato vertice di un oggetto
    //restituisce un vettore con gli indici dei punti adiacenti e l'indice del vertice in prima posizione
    //objLength è la lunghezza del vettore di punti passato
    collisionManager.vertexAdiacentPnt = function(vertex_id , objLength){
        var pnts_id = [vertex_id],
            id_1 = (vertex_id === 0) ?  (objLength - 1) : (vertex_id - 1),
            id_2 = (vertex_id === (objLength - 1)) ?  0 : (vertex_id + 1);
        pnts_id.push(id_1);
        //verifico se l'oggetto passato non è un segmento
        if (objLength > 2) pnts_id.push(id_2);
        return pnts_id;
    };
    //funzione che restituisce la retta passante per due punti
    collisionManager.getLine = function(pnt_1 , pnt_2){
        var line = new Object();
        //se i punti coincidono il risultato è indefinito
        if (pnt_1.x === pnt_2.x && pnt_1.y === pnt_2.y) return undefined;
        //calcolo i coefficienti delle rette
        if (pnt_1.x !== pnt_2.x){
            line.m = (pnt_1.y - pnt_2.y) / (pnt_1.x - pnt_2.x);
            line.q = ((line.m*pnt_2.x) + pnt_2.y);
            //valore bandiera
            line.mode = true;
        } else {
            line.m = 0;
            line.q = pnt_2.x;
            //valore bandiera
            line.mode = false;
        }
        console.log(line);
        line.pnt = [pnt_1,pnt_2];
        return line;
    };
    //funzione che risolve il sistema e restituisce i punti di intersezione tra un ellisse ed una retta
    //restituisce un vettore
    collisionManager.getIntersectionLine = function(ellipse , line){
        var a = ellipse.w/2,
            a2= a*a,
            b = ellipse.h/2,
            b2= b*b,
            x_e = ellipse.pnt.x,
            x_e2= x_e*x_e,
            y_e = ellipse.pnt.y,
            y_e2= y_e*y_e,
            m2 = line.m*line.m,
            q2 = line.q*line.q,
            A = 0,
            B = 0,
            C = 0,
            delta = 0,
            _1 = 0,
            _2 = 0,
            pnts = new Array();
        if (line.mode){
            A = (b2+(a2*m2));
            B = ((line.m*line.q*a2)-(line.m*y_e*a2)-(x_e*b2));
            C = ((b2*x_e2)+(a2*q2)+(a2*y_e2)-(2*line.q*y_e*a2)-(b2*a2));
        } else {
            A = (a2+(b2*m2));
            B = ((line.m*line.q*b2)-(line.m*x_e*b2)-(y_e*a2));
            C = ((a2*y_e2)+(b2*q2)+(b2*x_e2)-(2*line.q*x_e*b2)-(b2*a2));
        }
        delta = ((B*B)-A*C);
        if (delta > 0){
            _1 = (Math.sqrt(delta)-B)/A;
            _2 = (-Math.sqrt(delta)-B)/A;
            if (line.mode){
                pnts[0] = {
                    "x" : _1,
                    "y" : line.m*_1 + line.q
                };
                pnts[1] = {
                    "x" : _2,
                    "y" : line.m*_2 +line.q
                };
            } else {
                pnts[0] = {
                    "x" : line.m*_1 + line.q,
                    "y" : _1
                };
                pnts[1] = {
                    "x" : line.m*_2 + line.q,
                    "y" : _2
                };
            }
        }
        else if (delta === 0){
            _1 = (-B)/A;
            if (line.mode){
                pnts[0] = {
                    "x" : _1,
                    "y" : line.m*_1 + line.q
                };
            } else {
                pnts[0] = {
                    "x" : line.m*_1 + line.q,
                    "y" : _1
                };
            }
        }
        return pnts;
    };
    //funzione che verifica se un punto è interno ad un ellisse
    collisionManager.getIntersectionPnt = function(ellipse , pnt){
        var a = ellipse.w/2,
            a2= a*a,
            b = ellipse.h/2,
            b2= b*b,
            X = pnt.x - ellipse.pnt.x,
            X2= X*X,
            Y = pnt.y - ellipse.pnt.y,
            Y2= Y*Y,
            r = (X2/a2)+(Y2/b2);
        return (r <= 1);
    };
    //funzione che rivela se un punto di una retta è interno ad un dato segmento sulla retta
    collisionManager.verifyIntersection = function(intersectPnt , pnts){
        var x1 = pnts[0].x,
            x2 = pnts[1].x,
            y1 = pnts[0].y,
            y2 = pnts[1].y;
        if (x1 > x2){ x1 = pnts[1].x; x2 = pnts[0].x; }
        if (y1 > y2){ y1 = pnts[1].y; y2 = pnts[0].y; }
        return (((x1<=intersectPnt.x)&&(intersectPnt.x<=x2))&&((y1<=intersectPnt.y)&&(intersectPnt.y<=y2)));
    };
    //funzione che rileva le collisioni tra un ellisse e un oggetto qualsiasi
    collisionManager.detectCollision = function(ellipse , obj){
        var line = null,
            vertex_id = 0,
            pnts = new Array();
        //se l'oggetto non è un ellisse scelgo il vertice più vicino al centro
        if (!obj.ellipse) vertex_id = collisionManager.getClosestPnt(ellipse.pnt,obj.pnt);
        //se singolo punto o se uno dei vertici è interno all'ellisse
        if (!obj.ellipse && collisionManager.getIntersectionPnt(ellipse,obj.pnt[vertex_id])) return true;
        if (!obj.ellipse && obj.pnt.length === 1) return false;
        //se ellisse
        if (obj.ellipse){
            //acquisisco la retta che congiunge i centri dei due ellisse
            line = collisionManager.getLine(ellipse.pnt,obj.pnt);
            //ottengo i punti di intersezione tra ellissi e tale retta
            pnts[0] = collisionManager.getIntersectionLine(ellipse,line);
            pnts[1] = collisionManager.getIntersectionLine(obj,line);
            //verifico che le intersezioni siano interne agli ellissi reciprocamente
            for (let id in pnts[0]){
                if (collisionManager.verifyIntersection(pnts[0][id],pnts[1])) return true;
            }
        }
        //se composizione di segmenti
        else if (obj.polyline){
            for (let id = 1 ; id < obj.length ; id++){
                line = collisionManager.getLine(obj.pnt[id-1],obj.pnt[id]);
                pnts = collisionManager.getcollisionManagerIntersectionLine(ellipse,line);
                for (let id_1 = 0 ; id_1 < pnts.length ; id_1++){
                    if (collisionManager.verifyIntersection(pnts[id_1],line.pnt)) return true;
                }
            }
        }
        //se rettangolo o poligono convesso
        else {
            pnts[0] = collisionManager.vertexAdiacentPnt(vertex_id,obj.pnt.length);
            for (let id = 1 ; id < pnts[0].length ; id++){
                line = collisionManager.getLine(obj.pnt[pnts[0][0]],obj.pnt[pnts[0][id]]);
                pnts[1] = collisionManager.getIntersectionLine(ellipse,line);
                for (let id_1 = 0 ; id_1 < pnts[1].length ; id_1++){
                    if (collisionManager.verifyIntersection(pnts[1][id_1],line.pnt)) return true;
                }
            }
        }
        return false;
    };
    collisionManager.collitionTest = function(player_x,player_y,playerObj,objList){
        var tempEllipse = null,
            increment_x = 0,
            increment_y = 0;
        for (let key in playerObj){
            if (!playerObj[key].ellipse) continue;
            tempEllipse = playerObj[key];
            increment_x = player_x - tempEllipse.map_x;
            increment_y = player_y - tempEllipse.map_y;
            tempEllipse.pnt.x += increment_x;
            tempEllipse.pnt.y += increment_y;
            for (let id in objList){
                if(collisionManager.detectCollision(tempEllipse,objList[id])) { console.log("COLLISION"); return objList[id];}
            }
        }
        return undefined;
    };
}());
