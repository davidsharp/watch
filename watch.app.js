{ // must be inside our own scope here so that when we are unloaded everything disappears
  // we also define functions using 'let fn = function() {..}' for the same reason. function decls are global
let drawTimeout;

const DEBUG = !true;

require("Font5x9Numeric7Seg").add(Graphics);

// return false if unconfident so we can handle the fallback separately
const bpmConfidenceCheck = (status) => {
  const conf = status.bpmConfidence || status.confidence
  return conf > 75 ? status.bpm : false
}
let bpm = bpmConfidenceCheck(Bangle.getHealthStatus()) || '--'
let bpmConfidenceStrikes = 0

let batteryReadings = new Int8Array(50)
let bReadingIndex = 0
let brActualLength = 0

let day

let dirty = true // for forcing a redraw

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
  g.reset();
  const date = new Date()
  drawTime(date,x,y)
  if(dirty || day != date.getDay()){
    day = date.getDay()
    drawDate(date,(x/2)+8,y-40)
    drawDayKanji(day,x/2,y+48+((66-48)/2))
  }
  drawSeconds(date,x,y+32,2.5)

  batteryReadings[bReadingIndex] = E.getBattery()
  if(brActualLength<50) brActualLength++
  const batteryPercentage = batteryReadings.reduce((a,b)=>a+b)/brActualLength
  bReadingIndex = (bReadingIndex + 1) % 50

  drawSteps((x*2)-20,y+48,dirty) // using dirty for first draw
  drawHeartRate((x*2)-20,y+66,dirty) // could track proper first

  if(Bangle.isLocked()){
    g.clearRect(0,0,x*2,25)
    debugRect(0,0,x*2,25)
    debugX((x*2)-15,5)
    drawBattery((x*2)-17,10,batteryPercentage)
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

  dirty = false

  // queue next draw
  if (drawTimeout) clearTimeout(drawTimeout);
  drawTimeout = setTimeout(() => {
    drawTimeout = undefined;
    draw();
  }, 1000 - (Date.now() % 1000));
};

const drawTime = (date,x,y) => {
  const size = 6
  // drawing 88:88 means we don't need to redraw here
  g.setColor(g.theme.dark?0x222222:0xdddddd);
  g.setFontAlign(1, 0).setFont("5x9Numeric7Seg",size).drawString(88, x-(size/2), y);
  g.setFontAlign(-1, 0).setFont("5x9Numeric7Seg",size).drawString(88, x+(size*1.5), y);
  g.setColor(g.theme.fg);
  g.setFontAlign(1, 0).setFont("5x9Numeric7Seg",size).drawString(date.getHours().toString().padStart(2,'0'), x-(size/2), y);
  g.setFontAlign(0, 0).setFont("5x9Numeric7Seg",size).drawString(':', x+(size/2), y);
  g.setFontAlign(-1, 0).setFont("5x9Numeric7Seg",size).drawString(date.getMinutes().toString().padStart(2,'0'), x+(size*1.5), y);
  debugX(x,y)
}
const drawSeconds = (date,x,y,scale) => {
  scale = scale || 1
  g.clearRect(x-(30*scale),y,x-(30*scale)+(60*scale),y+scale-1)
  debugRect(x-(30*scale),y,x-(30*scale)+(60*scale),y+scale-1)
  if(date.getSeconds()>0)g.fillRect(x-(30*scale),y,x-(30*scale)+(date.getSeconds()*scale),y+scale-1);
  g.drawLine(x-(32*scale),y+(2*scale),x+(32*scale),y+(2*scale))
  g.drawLine(x,y+1,x,y+(2*scale))
  g.drawLine(x-(32*scale),y,x-(32*scale),y+(2*scale))
  g.drawLine(x+(32*scale),y,x+(32*scale),y+(2*scale))
  debugX(x,y)
}
const drawDayKanji = (day,x,y) => {
  const scale = 3
  //g.clearRect(x-(5*scale),y-(5*scale),x+(5*scale),y+(5*scale));
  //debugRect(x-(5*scale),y-(5*scale),x+(5*scale),y+(5*scale));
  g.drawImage(kanjiDays[day],x-(5*scale),y-(5*scale),{scale:scale});
  debugX(x,y)
}
const drawDate = (date,x,y) => {
  g.clearRect(x-(6*6),y-8,x+(6*6),y+8)
  debugRect(x-(6*6),y-8,x+(6*6),y+8)
  const dateStr = (date.getDate()+' '+require("date_utils").months(1)[date.getMonth()].toUpperCase()).padStart(6,'0')
  // TODO - move easter eggs (and maybe make them optional)
  if(dateStr == '14 FEB'){
    g.drawImage({width:10,height:10,buffer:atob("Ybz///////f4/B4DAA==")},x+38,y-5,{scale:1})
  }
  g.setFontAlign(0, 0).setFont("6x8", 2).drawString(dateStr, x, y);
  debugX(x,y)
}
const drawSteps = (x,y,first) => {
  const steps = (Bangle.getHealthStatus("day").steps/1000).toFixed(1)+'k'
  g.clearRect(x,y-8,x-(12*5),y+8) //XX.Xk
  debugRect(x,y-8,x-(12*5),y+8)
  g.setFontAlign(1, 0).setFont("6x8", 2).drawString(steps, x, y);
  if(first)g.drawImage({width:10,height:10,buffer:atob("A8Px/H8/h+TzkPA4AA==")},x+5,y-5,{scale:1});
  debugX(x,y)
}
const drawBattery = (x,y,batteryPercentage) => {
  const battery = batteryPercentage.toFixed(0)+'%';
  if(!Bangle.isCharging()) g.setFontAlign(1, 0).setFont("6x8", 2).drawString(battery, x, y);
  else g.drawImage({width:10,height:10,buffer:atob("AwHA4HA/n8DgcDgMAA==")},x-10,y-5,{scale:1});
  debugX(x,y)
}
const drawHeartRate = (x,y,first) => {
  g.clearRect(x,y-8,x-(12*3),y+8)
  debugRect(x,y-8,x-(12*3),y+8)
  g.setFontAlign(1, 0).setFont("6x8", 2).drawString(bpm, x, y);
  if(first)g.drawImage({width:10,height:10,buffer:atob("Ybz///////f4/B4DAA==")},x+5,y-5,{scale:1});
  debugX(x,y)
}
const debugX = (x,y) => {
  if(!DEBUG) return;
  const c = g.getColor()
  g.setColor(1,0,0)
  g.drawLine(x,y-5,x,y+5)
  g.drawLine(x-5,y,x+5,y)
  g.setColor(c)
}
const debugRect = (x1,y1,x2,y2) => {
  if(!DEBUG) return;
  const c = g.getColor()
  g.setColor(1,0,0)
  g.fillRect(x1,y1,x2,y2)
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
Bangle.on('HRM',status => {
  // if we're not confident 3 times, display '--'
  // consider reporting less confident ('?' or grey)
  const confidence = bpmConfidenceCheck(status)
  if(confidence) bpmConfidenceStrikes = 0
  else bpmConfidenceStrikes++
  bpm = confidence || bpmConfidenceStrikes>=3 ? '--' : bpm
})
Bangle.on('lock',() => dirty = true)
// suppress error messages by redrawing voer them
E.on('errorFlag', () => {
  // disable if DEBUG?
  E.getErrorFlags();
  g.clear();
  dirty = true;
  draw();
});
// Load widgets
Bangle.loadWidgets();
g.clear();
draw();
setTimeout(Bangle.drawWidgets,0);
}