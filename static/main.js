$(document).ready(function() {
    if (!window.console) window.console = {};
    if (!window.console.log) window.console.log = function() {};
    updater.start();
});

var draw = function(grid) {

    var canvas = document.getElementById('tutorial');
    var ctx = canvas.getContext('2d');

    // Infer the graph dimensions from the received object containing all node
    // values. 
    var graphHeight = grid.length;
    var graphWidth = grid[0].length;

    var NODE_SIZE = 30;
    for (var y = 0; y < graphHeight; y++) {
        for (var x = 0; x < graphWidth; x++) {
            var screenX = x * NODE_SIZE;
            var screenY = y * NODE_SIZE;
            switch (grid[y][x]) {
                case NODE_TYPE_BEAR:
                    drawBear(ctx, screenX, screenY, NODE_SIZE);
                    break;
                case NODE_TYPE_HONEY:
                    drawHoney(ctx, screenX, screenY, NODE_SIZE);
                    break;
                case NODE_TYPE_PATH:
                    drawPath(ctx, screenX, screenY, NODE_SIZE);
                    break;
                case NODE_TYPE_TREE:
                    drawTree(ctx, screenX, screenY, NODE_SIZE);
                    break;
                default:
                    drawGrass(ctx, screenX, screenY, NODE_SIZE);
            }
        }
    } 
}

// TODO(jhibberd) Abstract functions, they all take the same args.

var drawTree = function(ctx, x, y, size) {
    drawGrass(ctx, x, y, size);
    ctx.fillStyle = "rgb(42, 92, 11)";  
    ctx.beginPath();
    ctx.moveTo(x + (size*.5), y + (size*.1));
    ctx.lineTo(x + (size*.1), y + (size*.7)); 
    ctx.lineTo(x + (size*.9), y + (size*.7));
    ctx.lineTo(x + (size*.5), y + (size*.1));
    ctx.fill();
    ctx.fillRect(
        x + (size*.4),
        y + (size*.7),
        size*.2,
        size*.2);
}

var drawBear = function(ctx, x, y, size) {
    drawPath(ctx, x, y, size);
    ctx.fillStyle = "#63420b";
    ctx.beginPath();
    ctx.moveTo(x + (size*.1), y + (size*.8));
    ctx.bezierCurveTo(
        x + (size*.1),
        y - (size*.1),
        x + (size*.9),
        y - (size*.1),
        x + (size*.9),
        y + (size*.8));
    ctx.lineTo(x + (size*.1), y + (size*.8));
    ctx.fill()
    ctx.fillStyle = "rgb(255, 255, 255)";
    ctx.beginPath();
    ctx.arc(
        x + (size*.43), 
        y + (size*.3), 
        size*.04, 
        0, 
        Math.PI*2, 
        true);
    ctx.arc(
        x + (size*.57), 
        y + (size*.3), 
        size*.04, 
        0, 
        Math.PI*2, 
        true);
    ctx.fill()
}

var drawHoney = function(ctx, x, y, size) {
    drawPath(ctx, x, y, size);
    ctx.fillStyle = "rgb(234, 42, 21)"; 
    ctx.beginPath(); 
    ctx.arc(
        x + (size*.5), 
        y + (size*.5), 
        size*.3, 
        0, 
        Math.PI*2, 
        true);
    ctx.fill();
}

var drawPath = function(ctx, x, y, size) {
    ctx.fillStyle = "#a36c13";  
    ctx.fillRect(
        x,
        y,
        size,
        size);  
}

var drawGrass = function(ctx, x, y, size) {
    ctx.fillStyle = "rgb(128, 143, 18)";  
    ctx.fillRect(
        x,
        y,
        size,
        size);  
}

var updater = {
    socket: null,

    start: function() {
        if ("WebSocket" in window) {
            updater.socket = new WebSocket("ws://localhost:8888/subscribe");
        } else {
            updater.socket = new MozWebSocket("ws://localhost:8888/subscribe");
        }
        updater.socket.onmessage = function(event) {
            updater.showMessage(JSON.parse(event.data));
        }
    },

    showMessage: function(message) {
        draw(message);
    }
};
