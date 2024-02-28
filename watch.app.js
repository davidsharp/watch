{ // must be inside our own scope here so that when we are unloaded everything disappears
  // we also define functions using 'let fn = function() {..}' for the same reason. function decls are global
let drawTimeout;

const DEBUG = true;

require("Font5x9Numeric7Seg").add(Graphics);

// return false if unconfident so we can handle the fallback separately
const bpmConfidenceCheck = (status) => {
  const conf = status.bpmConfidence || status.confidence
  return conf > 75 ? status.bpm : false
}
let bpm = bpmConfidenceCheck(Bangle.getHealthStatus()) || '?'

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

// Actually draw the watch face
const draw = () => {
  const x = g.getWidth() / 2;
  const y = g.getHeight() / 2;
  g.reset().clear();//Rect(Bangle.appRect); // clear whole background (w/o widgets)
  g.setBgColor(g.theme.bg);
  g.setColor(g.theme.fg);
  const date = new Date()
  drawTime(date,x,y)
  drawDate(date,x,y+48)
  drawDateKanji(date,x,y-60)
  drawSeconds(date,x,y+32)

  batteryReadings.push(E.getBattery())
  if(batteryReadings.length>50) batteryReadings.shift()
  const batteryPercentage = batteryReadings.reduce((a,b)=>a+b)/batteryReadings.length
  const battery = batteryPercentage.toFixed(0)+'%';

  const steps = (Bangle.getHealthStatus("day").steps/1000).toFixed(1)+'k'

  //g.setFontAlign(0, 0).setFont("6x8", 2).drawString(bpm+'|'+steps+'|'+battery, x, y+66);
  drawHeartRate(x,y+66)

  if(Bangle.isLocked()){
    g.setColor(batteryPercentage<50?1:0,batteryPercentage>25?1:0,0).drawImage(
      {
        width : 10, height : 10,
        buffer : atob("Hg/H+//////9/j8HgA==")
      },
      (x*2)-15,5
    )
  }
  else {
    Bangle.drawWidgets()
  }

  // queue next draw
  if (drawTimeout) clearTimeout(drawTimeout);
  drawTimeout = setTimeout(() => {
    drawTimeout = undefined;
    draw();
  }, 1000 - (Date.now() % 1000));
};

const drawTime = (date,x,y) => {
  const size = 6
  g.setColor(g.theme.dark?0x222222:0xdddddd);
  g.setFontAlign(1, 0).setFont("5x9Numeric7Seg",size).drawString(88, x-(size/2), y);
  g.setFontAlign(-1, 0).setFont("5x9Numeric7Seg",size).drawString(88, x+(size*1.5), y);
  g.setColor(g.theme.fg);
  g.setFontAlign(1, 0).setFont("5x9Numeric7Seg",size).drawString(date.getHours().toString().padStart(2,'0'), x-(size/2), y);
  g.setFontAlign(0, 0).setFont("5x9Numeric7Seg",size).drawString(':', x+(size/2), y);
  g.setFontAlign(-1, 0).setFont("5x9Numeric7Seg",size).drawString(date.getMinutes().toString().padStart(2,'0'), x+(size*1.5), y);
}
const drawSeconds = (date,x,y) => {
  if(date.getSeconds()>0)g.drawLine(x-30,y,x-30+date.getSeconds(),y);
  g.drawLine(x-32,y+2,x+32,y+2)
  g.drawLine(x,y+1,x,y+2)
  g.drawLine(x-32,y,x-32,y+2)
  g.drawLine(x+32,y,x+32,y+2)
}
const drawDateKanji = (date,x,y) => {
  const scale = 3
  g.drawImage(kanjiDays[date.getDay()],x-(5*scale),y,{scale:scale});
}
const drawDate = (date,x,y) => {
  const dateStr = date.getDate()+' '+require("date_utils").months(1)[date.getMonth()].toUpperCase()
  // TODO - move easter eggs (and maybe make them optional)
  if(dateStr == '14 FEB'){
    g.drawImage({width:10,height:10,buffer:atob("Ybz///////f4/B4DAA==")},x+38,y-5,{scale:1})
  }
  g.setFontAlign(0, 0).setFont("6x8", 2).drawString(dateStr, x, y);
}
const drawSteps = (x,y) => {}
const drawBattery = (x,y) => {}
const drawHeartRate = (x,y) => {
  debugX(x,y)
  g.setFontAlign(1, 0).setFont("6x8", 2).drawString(bpm, x, y);
  g.drawImage({width:10,height:10,buffer:atob("Ybz///////f4/B4DAA==")},x+5,y-5,{scale:1});
}
const debugX = (x,y) => {
  if(!DEBUG) return;
  const c = g.getColor()
  g.setColor(1,0,0)
  g.drawLine(x,y-5,x,y+5)
  g.drawLine(x-5,y,x+5,y)
  g.setColor(c)
}

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
})
// Load widgets
Bangle.loadWidgets();
draw();
setTimeout(Bangle.drawWidgets,0);
}