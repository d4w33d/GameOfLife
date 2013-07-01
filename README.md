
# Le Jeu de la Vie de Conway

Jeu de la Vie interactif avec Canvas.

* HTML 5
* JavaScript
* jQuery 1.8.2+
* Canvas

## Utilisation

HTML :

    <div id="game"></div>

JavaScript :

    new GameOfLife('#game', {
        width: 64,
        height: 32,
        iteration: function(i) {
            console.log('Iteration: ' + i);
        },
        statusChanged: function(status) {
            console.log('Status changed: ' + status);
        }
    });

## Options

### Basique
    * **width** : Nombre de cellules horizontalement (défaut : 10) ;
    * **height** : Nombre de cellules verticalement (défaut : 10) ;
    * **speed** : Vitesse d'itération (défaut : 10) ;
### Apparence
    * **cellSize** : Taille en pixels d'une cellule - les cellules sont
        carrées (défaut : 10) ;
    * **canvasPadding** : Marge intérieure du canvas en pixels (défaut : 10) ;
    * **cellsMargin** : Marge en pixels entre chaque cellule (défaut : 1) ;
    * **backgroundColor** : Couleur de fond du canvas (défaut : #333) ;
    * **cellColor** : Couleur de cellule morte (défaut : #555) ;
    * **activeCellColor** : Couleur de cellule vivante (défaut : #fff) ;
### Événements
    * **iteration** : Fonction de callback exécutée à chaque itération, avec
        pour paramètre le nombre d'itérations réalisées depuis
        l'initialisation ;
    * **statusChanged** : Fonction de callback exécutée lors du changement
        d'état (lecture, pause). En paramètre : *playing* ou *stopped* ;
### Jeu (*coeur du jeu*) :
    * **minNeighbours** : Nombre de cases voisines actives minimum pour
        survivre (défaut : 2) ;
    * **maxNeighbours** : Nombre de cases voisites actives maximum pour
        survivre (défaut : 3) ;
    * **respawnNeighbours** : Nombre exact de cases à voisines actives
        pour qu'une cellule morte puisse renaître (défaut : 3).
