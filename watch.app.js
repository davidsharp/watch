{ // must be inside our own scope here so that when we are unloaded everything disappears
  // we also define functions using 'let fn = function() {..}' for the same reason. function decls are global
let drawTimeout;

const kanji = {
  width : 70, height : 10, bpp : 1,
  buffer : atob("AAAAQBAEAABA/h+BAEAQDgECCEIEQRBARAQIIfiSdJ/z+P4ghCRQVAQREED+EIEBUDg/gQIIfgYJIVAQBAghCCQkSSJIECCIIQkRREVAQP4hmBDAEH/f8A==")
}

// Actually draw the watch face
const draw = () => {
  const x = g.getWidth() / 2;
  const y = g.getHeight() / 2;
  g.reset().clearRect(Bangle.appRect); // clear whole background (w/o widgets)
  g.setBgColor(g.theme.bg);
  g.setColor(g.theme.fg);
  const date = new Date();
  const timeStr = date.getHours()+':'+date.getMinutes().toString().padStart(2,'0');
  g.setFontAlign(0, 0).setFont("6x8",4).drawString(timeStr, x, y);
  // Show date and day of week
  const dateStr = require("locale").date(date, 0).toUpperCase()+"\n"+
                date.getDay();
  g.setFontAlign(0, 0).setFont("6x8", 2).drawString(dateStr, x, y+48);

  g.drawImage(kanji,20,50,{scale:2});

  // queue next draw
  if (drawTimeout) clearTimeout(drawTimeout);
  drawTimeout = setTimeout(() => {
    drawTimeout = undefined;
    draw();
  }, 60000 - (Date.now() % 60000));
};

// Show launcher when middle button pressed
Bangle.setUI({
  mode : "clock",
  remove : () => {
    // Called to unload all of the clock app
    if (drawTimeout) clearTimeout(drawTimeout);
    drawTimeout = undefined;
  }});
// Load widgets
Bangle.loadWidgets();
draw();
setTimeout(Bangle.drawWidgets,0);
}