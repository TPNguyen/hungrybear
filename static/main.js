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

    var SQUARE_SIZE = 30;
    for (var y = 0; y < graphHeight; y++) {
        for (var x = 0; x < graphWidth; x++) {
            var value = grid[y][x];
            var color = "rgb(255, 255, 255)";
            if (value == 1) {
                color = "rgb(200, 0, 0)";
            }
            ctx.fillStyle = color;  
            ctx.fillRect(
                x * SQUARE_SIZE,
                y * SQUARE_SIZE,
                SQUARE_SIZE,
                SQUARE_SIZE);  
            ctx.strokeRect(
                x * SQUARE_SIZE,
                y * SQUARE_SIZE,
                SQUARE_SIZE,
                SQUARE_SIZE);  
        }
    } 
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
