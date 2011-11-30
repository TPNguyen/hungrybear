// TODO(jhibberd) All colors to hex.
// TODO(jhibberd) Way more commenting.

$(document).ready(function() {
    if (!window.console) window.console = {};
    if (!window.console.log) window.console.log = function() {};
    websocket.init();
});

var websocket = {

    socket: null,

    init: function() {
        var HOST = "ws://localhost:8888/subscribe";
        if ("WebSocket" in window) {
            websocket.socket = new WebSocket(HOST);
        } else {
            websocket.socket = new MozWebSocket(HOST);
        }
        websocket.socket.onmessage = function(msg) {
            draw(JSON.parse(msg.data));
        }
    }
};

// Used to prevent nodes that haven't changed from being re-rendered.
var last_graph = null;

// Size (in pixels) to render each graph node.
var NODE_SIZE = 30;

var draw = function(graph) {

    var canvas = document.getElementById('tutorial');
    var ctx = canvas.getContext('2d');

    var graphHeight = graph.length;
    var graphWidth = graph[0].length;

    var renderer = {}
    renderer[NODE_TYPE_GRASS] =             drawGrass;
    renderer[NODE_TYPE_BEAR_ON_GRASS] =     drawBearOnGrass;
    renderer[NODE_TYPE_HONEY_ON_GRASS] =    drawHoneyOnGrass;
    renderer[NODE_TYPE_PATH] =              drawPath;
    renderer[NODE_TYPE_BEAR_ON_PATH] =      drawBearOnPath;
    renderer[NODE_TYPE_HONEY_ON_PATH] =     drawHoneyOnPath;
    renderer[NODE_TYPE_TREE] =              drawTree;

    for (var y = 0; y < graphHeight; y++) {
        for (var x = 0; x < graphWidth; x++) {

            var screenX = x * NODE_SIZE;
            var screenY = y * NODE_SIZE;
            var nodeType = graph[y][x];

            // Only render nodes that have changed since the last graph was
            // received.
            if (!last_graph || last_graph[y][x] != nodeType) {
                renderer[nodeType](ctx, screenX, screenY, NODE_SIZE);
            }
        }
    }
    
    last_graph = graph; 
}

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

var drawBearOnGrass = function(ctx, x, y, size) {
    drawGrass(ctx, x, y, size);
    drawBear(ctx, x, y, size);
}

var drawBearOnPath = function(ctx, x, y, size) {
    drawPath(ctx, x, y, size);
    drawBear(ctx, x, y, size);
}

var drawBear = function(ctx, x, y, size) {

    // Body
    ctx.fillStyle = "#63420b";
    ctx.beginPath();
    ctx.moveTo(x + (size*.1), y + (size*.9));
    ctx.bezierCurveTo(
        x + (size*.1),
        y,
        x + (size*.9),
        y,
        x + (size*.9),
        y + (size*.9));
    ctx.lineTo(x + (size*.1), y + (size*.9));
    ctx.fill()
   
    // Ears
    ctx.beginPath();
    ctx.arc(
        x + (size*.4), 
        y + (size*.23), 
        size*.06, 
        0, 
        Math.PI*2, 
        true);
    ctx.arc(
        x + (size*.6), 
        y + (size*.23), 
        size*.06, 
        0, 
        Math.PI*2, 
        true);
    ctx.fill()
 
    // Eyes
    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(
        x + (size*.43), 
        y + (size*.4), 
        size*.04, 
        0, 
        Math.PI*2, 
        true);
    ctx.arc(
        x + (size*.57), 
        y + (size*.4), 
        size*.04, 
        0, 
        Math.PI*2, 
        true);
    ctx.fill()

    // Snout
    ctx.fillStyle = "#483008";
    ctx.beginPath();
    ctx.arc(
        x + (size*.5), 
        y + (size*.53), 
        size*.03, 
        0, 
        Math.PI*2, 
        true);
    ctx.fill()
}

var drawHoneyOnGrass = function(ctx, x, y, size) {
    drawGrass(ctx, x, y, size);
    drawHoney(ctx, x, y, size);
}

var drawHoneyOnPath = function(ctx, x, y, size) {
    drawPath(ctx, x, y, size);
    drawHoney(ctx, x, y, size);
}

var drawHoney = function(ctx, x, y, size) {
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

