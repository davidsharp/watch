{ // must be inside our own scope here so that when we are unloaded everything disappears
  // we also define functions using 'let fn = function() {..}' for the same reason. function decls are global
let drawTimeout;

// Actually draw the watch face
let draw = function() {
  var x = g.getWidth() / 2;
  var y = g.getHeight() / 2;
  g.reset().clearRect(Bangle.appRect); // clear whole background (w/o widgets)
  g.setColor(0.2,0.2,1);
  var date = new Date();
  var timeStr = '0x'+date.getHours().toString(16)+':'+date.getMinutes()
  g.setFontAlign(0, 0).setFont("6x8",4).drawString(timeStr, x, y);
  // Show date and day of week
  var dateStr = require("locale").date(date, 0).toUpperCase()+"\n"+
                require("locale").dow(date, 0).toUpperCase();
  g.setFontAlign(0, 0).setFont("6x8", 2).drawString(dateStr, x, y+48);

  // queue next draw
  if (drawTimeout) clearTimeout(drawTimeout);
  drawTimeout = setTimeout(function() {
    drawTimeout = undefined;
    draw();
  }, 60000 - (Date.now() % 60000));
};

// Show launcher when middle button pressed
Bangle.setUI({
  mode : "clock",
  remove : function() {
    // Called to unload all of the clock app
    if (drawTimeout) clearTimeout(drawTimeout);
    drawTimeout = undefined;
    delete Graphics.prototype.setFontAnton;
  }});
// Load widgets
Bangle.loadWidgets();
draw();
setTimeout(Bangle.drawWidgets,0);
}