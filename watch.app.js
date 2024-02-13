{ // must be inside our own scope here so that when we are unloaded everything disappears
  // we also define functions using 'let fn = function() {..}' for the same reason. function decls are global
let drawTimeout;

// return false if unconfident so we can handle the fallback separately
const bpmConfidenceCheck = (status) => {
  const conf = status.bpmConfidence || status.confidence
  return conf > 75 ? status.bpm : false
}
let bpm = bpmConfidenceCheck(Bangle.getHealthStatus('last')) || '?'
Bangle.setHRMPower(1)

const kanjiDays = [
  {
    width : 10, height : 10,
    buffer : atob("AA/iCIIgj+IIgiCP4A")
  },
  {
    width : 10, height : 10,
    buffer : atob("AAfhCH4QhCH4QiCIYA")
  },
  {
    width : 10, height : 10,
    buffer : atob("BAEARJJFAQBgJBCYEA")
  },
  {
    width : 10, height : 10,
    buffer : atob("BAEARdIVBUJIkURDAA")
  },
  {
    width : 10, height : 10,
    buffer : atob("BAEAQf8EA4FQkkRBAA")
  },
  {
    width : 10, height : 10,
    buffer : atob("AAOBEP5ET+BAkhUf8A")
  },
  {
    width : 10, height : 10,
    buffer : atob("BAEAQP4EAQBAEAQf8A")
  },
]

//console.log(Bangle.getHealthStatus('last'))

// Actually draw the watch face
const draw = () => {
  const x = g.getWidth() / 2;
  const y = g.getHeight() / 2;
  g.reset().clearRect(Bangle.appRect); // clear whole background (w/o widgets)
  g.setBgColor(g.theme.bg);
  g.setColor(g.theme.fg);
  const date = new Date();
  const timeStr = date.getHours().toString().padStart(2,'0')+':'+date.getMinutes().toString().padStart(2,'0');
  g.setFontAlign(0, 0).setFont("6x8",4).drawString(timeStr, x, y);
  // Show date and day of week
  const dateStr = date.getDate()+' '+require("date_utils").months(1)[date.getMonth()].toUpperCase()
  g.setFontAlign(0, 0).setFont("6x8", 2).drawString(dateStr, x, y+48);

  g.setFontAlign(0, 0).setFont("6x8", 2).drawString(bpm, x, y+66);

  g.drawImage(kanjiDays[date.getDay()],x-15,y-60,{scale:3});
  if(date.getSeconds()>0)g.drawLine(x-30,y+20,x-30+date.getSeconds(),y+20);
  g.drawLine(x-32,y+20+2,x+32,y+20+2)
  g.drawLine(x,y+20+1,x,y+20+2)
  g.drawLine(x-32,y+20,x-32,y+20+2)
  g.drawLine(x+32,y+20,x+32,y+20+2)

  // queue next draw
  if (drawTimeout) clearTimeout(drawTimeout);
  drawTimeout = setTimeout(() => {
    drawTimeout = undefined;
    draw();
  }, 1000 - (Date.now() % 1000));
};

// Show launcher when middle button pressed
Bangle.setUI({
  mode : "clock",
  remove : () => {
    // Called to unload all of the clock app
    if (drawTimeout) clearTimeout(drawTimeout);
    drawTimeout = undefined;
  }});
Bangle.on('HRM',status => {
  // use last one if we're not confident
  bpm = bpmConfidenceCheck(status) || bpm
  console.log('hrm event: ',status)
})
// Load widgets
Bangle.loadWidgets();
draw();
setTimeout(Bangle.drawWidgets,0);
}