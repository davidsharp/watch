{ // must be inside our own scope here so that when we are unloaded everything disappears
  // we also define functions using 'let fn = function() {..}' for the same reason. function decls are global
let drawTimeout;

require("Font5x9Numeric7Seg").add(Graphics);

// return false if unconfident so we can handle the fallback separately
const bpmConfidenceCheck = (status) => {
  const conf = status.bpmConfidence || status.confidence
  return conf > 75 ? status.bpm : false
}
let bpm = bpmConfidenceCheck(Bangle.getHealthStatus()) || '?'
//Bangle.setHRMPower(1)

let batteryReadings = []

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
  g.setColor(g.theme.dark?0x222222:0xdddddd);
  g.setFontAlign(1, 0).setFont("5x9Numeric7Seg",4).drawString(88, x-2, y);
  g.setFontAlign(-1, 0).setFont("5x9Numeric7Seg",4).drawString(88, x+6, y);
  g.setColor(g.theme.fg);
  g.setFontAlign(1, 0).setFont("5x9Numeric7Seg",4).drawString(date.getHours().toString().padStart(2,'0'), x-2, y);
  g.setFontAlign(0, 0).setFont("5x9Numeric7Seg",4).drawString(':', x+2, y);
  g.setFontAlign(-1, 0).setFont("5x9Numeric7Seg",4).drawString(date.getMinutes().toString().padStart(2,'0'), x+6, y);
  // Show date and day of week
  const dateStr = date.getDate()+' '+require("date_utils").months(1)[date.getMonth()].toUpperCase()
  g.setFontAlign(0, 0).setFont("6x8", 2).drawString(dateStr, x, y+48);

  batteryReadings.push(E.getBattery())
  if(batteryReadings.length>50) batteryReadings.shift()
  const battery = (batteryReadings.reduce((a,b)=>a+b)/batteryReadings.length).toFixed(0)+'%';

  const steps = (Bangle.getHealthStatus("day").steps/1000).toFixed(1)+'k'

  g.setFontAlign(0, 0).setFont("6x8", 2).drawString(bpm+'|'+steps+'|'+battery, x, y+66);

  g.drawImage(kanjiDays[date.getDay()],x-15,y-60,{scale:3});
  if(date.getSeconds()>0)g.drawLine(x-30,y+24,x-30+date.getSeconds(),y+24);
  g.drawLine(x-32,y+24+2,x+32,y+24+2)
  g.drawLine(x,y+24+1,x,y+24+2)
  g.drawLine(x-32,y+24,x-32,y+24+2)
  g.drawLine(x+32,y+24,x+32,y+24+2)

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
Bangle.on('health',status => {
  // use last one if we're not confident
  bpm = bpmConfidenceCheck(status) || bpm
  console.log('hrm event: ',status)
})
// Load widgets
Bangle.loadWidgets();
draw();
setTimeout(Bangle.drawWidgets,0);
}