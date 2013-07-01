
// === Main class ===

var GameOfLife = function(target, params) {
    var self = this;

    this.ALIVE = true;
    this.DEAD = false;

    this.target = $(target);

    params = $.extend({
        width: 10,
        height: 10,
        speed: 10,
        minNeighbours: 2,
        maxNeighbours: 3,
        respawnNeighbours: 3,
        cellSize: 10,
        canvasPadding: 10,
        cellsMargin: 1,
        backgroundColor: '#333',
        cellColor: '#555',
        activeCellColor: '#fff',
        iteration: null,
        statusChanged: null
    }, params);

    var n;
    for (n in params) {
        this[n] = params[n];
    }

    this.iterations = 0;
    this.timeout = null;
    this.grid = new Grid(this.width, this.height, this.DEAD);
    this.canvas = null;

    this._fireIteration();
    this._fireStatusChanged();

    $(function() {
        self.canvas = new Canvas(self);
    });
};

GameOfLife.prototype.play = function() {
    this.stop();
    this._nextStep();
    this._fireStatusChanged();
    return this;
};

GameOfLife.prototype._nextStep = function() {
    var self = this;
    this.timeout = window.setTimeout(function() {
        self.update();
        if (self.isPlaying()) {
            self._nextStep();
        }
    }, Math.round(1000 / this.speed));
};

GameOfLife.prototype.stop = function() {
    if (!this.timeout) {
        return;
    }

    window.clearTimeout(this.timeout);
    this.timeout = null;
    this._fireStatusChanged();
    return this;
};

GameOfLife.prototype.toggle = function() {
    if (this.isPlaying()) {
        this.stop();
    } else {
        this.play();
    }

    return this;
};

GameOfLife.prototype.clear = function() {
    this.iterations = 0;
    return this;
};

GameOfLife.prototype.isPlaying = function() {
    return this.timeout ? true : false;
};

GameOfLife.prototype.getSpeed = function() {
    return this.speed;
};

GameOfLife.prototype.setSpeed = function(speed) {
    this.speed = speed;
    return this;
};

GameOfLife.prototype.update = function() {
    var self = this,
        newGrid = new Grid(this.grid);

    this.grid.each(function(x, y, status) {
        var neighbours = self.grid.countNeighbours(x, y, self.ALIVE);
        var newStatus = self.DEAD;

        if (status === self.ALIVE
            && neighbours >= self.minNeighbours
            && neighbours <= self.maxNeighbours) {
            newStatus = self.ALIVE;
        } else if (status === self.DEAD
            && neighbours === self.respawnNeighbours) {
            newStatus = self.ALIVE;
        }

        newGrid.set(x, y, newStatus);
        self._changeCellInCanvas(x, y, newStatus);
    });

    this.grid = newGrid;
    this.iterations++;
    this._fireIteration();

    return this;
};

GameOfLife.prototype.toggleCell = function(x, y) {
    this.changeCell(x, y,
        this.grid.get(x, y) === this.ALIVE ? this.DEAD : this.ALIVE);
    return this;
};

GameOfLife.prototype.changeCell = function(x, y, status) {
    this._changeCellInMatrix(x, y, status);
    this._changeCellInCanvas(x, y, status);
    return this;
};

GameOfLife.prototype._changeCellInMatrix = function(x, y, status) {
    this.grid.set(x, y, status);
};

GameOfLife.prototype._changeCellInCanvas = function(x, y, status) {
    if (x >= 0 && x <= this.width - 1 && y >= 0 && y <= this.height - 1) {
        this.canvas.changeCell(x, y, status === this.ALIVE);
    }
};

GameOfLife.prototype._fireIteration = function() {
    if (this.iteration instanceof Function) {
        this.iteration.call(this, this.iterations);
    }
};

GameOfLife.prototype._fireStatusChanged = function() {
    if (this.statusChanged instanceof Function) {
        this.statusChanged.call(this, this.isPlaying() ?
            'playing' : 'stopped');
    }
};

GameOfLife.prototype.loadSchema = function(schema) {
    this.grid = new Grid(this.width, this.height, this.DEAD);
    this.canvas.clearCells();

    schema = schema.split('\n');
    if (!schema.length) {
        return this;
    }

    var w = schema[0].length,
        h = schema.length,
        offsetX = Math.floor((this.width - w) / 2),
        offsetY = Math.floor((this.height - h) / 2),
        x,
        y;

    for (y = 0; y < schema.length; y++) {
        for (x = 0; x < schema[y].length; x++) {
            if (parseInt(schema[y].charAt(x), 10) === 1) {
                this.changeCell(x + offsetX, y + offsetY, this.ALIVE);
            }
        }
    }

    return this;
};

GameOfLife.prototype.remove = function() {
    this.stop();
    this.target.empty();
    return this;
};

// === Grid object ===

var Grid = function(width, height, defaultValue) {
    var sourceGrid = null;
    if (width instanceof Grid) {
        sourceGrid = width;
        width = sourceGrid.width;
        height = sourceGrid.height;
    }

    this.width = width || 0;
    this.height = height || 0;
    this.matrix = [];

    if (defaultValue === undefined) {
        defaultValue = false;
    }

    if (sourceGrid === undefined) {
        sourceGrid = [];
    }

    var x, y, value;

    for (x = -2; x < this.width + 2; x++) {
        this.matrix[x] = [];
        for (y = -2; y < this.height + 2; y++) {
            value = defaultValue;
            if (sourceGrid !== null) {
                value = sourceGrid.get(x, y);
            }
            this.matrix[x][y] = value;
        }
    }
};

Grid.prototype.exists = function(x, y) {
    return this.matrix.length - 1 >= x 
        && this.matrix[x].length - 1 >= y;
};

Grid.prototype.get = function(x, y) {
    if (!this.exists(x, y)) {
        return null;
    }
    return this.matrix[x][y];
};

Grid.prototype.set = function(x, y, value) {
    if (this.exists(x, y)) {
        this.matrix[x][y] = value;
    }
    return this;
};

Grid.prototype.each = function(callback) {
    var x, y;
    for (x = -2; x < this.width + 2; x++) {
        for (y = -2; y < this.height + 2; y++) {
            callback.call(this, x, y, this.matrix[x][y]);
        }
    }
    return this;
};

Grid.prototype.countNeighbours = function(x, y, filter) {
    var count = 0;
    if (filter !== undefined && this.matrix[x][y] === filter) {
        count--;
    }

    var nx, ny;
    for (nx = x - 1; nx <= x + 1; nx++) {
        if (nx < -2 || nx > this.width + 2 - 1) {
            continue;
        }
        for (ny = y - 1; ny <= y + 1; ny++) {
            if (ny < -2 || ny > this.height + 2 - 1) {
                continue;
            }
            if (filter === undefined || this.matrix[nx][ny] === filter) {
                count++;
            }
        }
    }

    return count;
};

var Canvas = function(game) {
    this.game = game;

    this.canvas = null;
    this.ctx = null;
    this.canvasWidth = null;
    this.canvasHeight = null;

    this._build();
};

Canvas.prototype._build = function() {
    var self = this,
        realCellSize = this.game.cellSize + this.game.cellsMargin;

    this.canvasWidth = ((this.game.width * realCellSize)
            - this.game.cellsMargin)
        + (this.game.canvasPadding * 2);
    this.canvasHeight = ((this.game.height * realCellSize)
            - this.game.cellsMargin)
        + (this.game.canvasPadding * 2);

    this.canvas = document.createElement('canvas');
    this.canvas.width = this.canvasWidth;
    this.canvas.height = this.canvasHeight;

    $(this.canvas).click(function(e) {
        var padding = self.game.canvasPadding,
            x = Math.floor((e.offsetX - padding) / realCellSize),
            y = Math.floor((e.offsetY - padding) / realCellSize);

        if (x >= 0 && x <= self.game.width - 1
            && y >= 0 && y <= self.game.height - 1) {
            self.game.toggleCell(x, y);
        }
    });

    this.game.target.html(this.canvas);

    this.ctx = this.canvas.getContext('2d');

    this.ctx.fillStyle = this.game.backgroundColor;
    this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

    this.clearCells();

    return this;
};

Canvas.prototype.clearCells = function() {
    var x, y;
    for (x = 0; x < this.game.width; x++) {
        for (y = 0; y < this.game.height; y++) {
            this.changeCell(x, y, false);
        }
    }
    return this;
};

Canvas.prototype.changeCell = function(x, y, isActive) {
    var posX = (x * (this.game.cellSize + this.game.cellsMargin))
            + this.game.canvasPadding,
        posY = (y * (this.game.cellSize + this.game.cellsMargin))
            + this.game.canvasPadding;

    this.ctx.fillStyle = isActive ?
        this.game.activeCellColor : this.game.cellColor;
    this.ctx.fillRect(posX, posY, this.game.cellSize, this.game.cellSize);

    return this;
};
