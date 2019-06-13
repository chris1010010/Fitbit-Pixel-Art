import clock from "clock";
import document from "document";
import { preferences } from "user-settings";
import * as util from "../common/utils";
import { today } from "user-activity";
import { goals } from "user-activity";
import * as fs from "fs";
import { vibration } from "haptics";

// Update the clock every minute
clock.granularity = "seconds";

const pixels = [[document.getElementById("pix00"),
                 document.getElementById("pix01"),
                 document.getElementById("pix02"),
                 document.getElementById("pix03"),
                 document.getElementById("pix04")],
                [document.getElementById("pix10"),
                 document.getElementById("pix11"),
                 document.getElementById("pix12"),
                 document.getElementById("pix13"),
                 document.getElementById("pix14")],
                [document.getElementById("pix20"),
                 document.getElementById("pix21"),
                 document.getElementById("pix22"),
                 document.getElementById("pix23"),
                 document.getElementById("pix24")],
                [document.getElementById("pix30"),
                 document.getElementById("pix31"),
                 document.getElementById("pix32"),
                 document.getElementById("pix33"),
                 document.getElementById("pix34")],
                [document.getElementById("pix40"),
                 document.getElementById("pix41"),
                 document.getElementById("pix42"),
                 document.getElementById("pix43"),
                 document.getElementById("pix44")],
               ];

const pixCol = [[1,2,1,2,1],
                [1,2,1,2,1],
                [1,2,1,2,1],
                [1,2,1,2,1],
                [1,2,1,2,1]];
const colors = ["white","grey","dimgrey","black","red","green","blue","yellow","cyan","magenta"];
let changed = 1;

let easterEggTrigger = [0,0,0,0,0];
let easterEggOldColor1 = 0;
let easterEggOldColor2 = 0;
let defaultCol = 0;
let randomChangeActive = 0;
let opacity = 0.8;

let stepsIcon = document.getElementById("stepsIcon");

const STATUS_FILE = "status.cbor";
let tenSecCountDown = 2;
loadStatus();

pixels[0][0].onclick = function(e) { handlePixelTap(0,0); }
pixels[0][1].onclick = function(e) { handlePixelTap(0,1); }
pixels[0][2].onclick = function(e) { handlePixelTap(0,2); }
pixels[0][3].onclick = function(e) { handlePixelTap(0,3); }
pixels[0][4].onclick = function(e) { handlePixelTap(0,4); }

pixels[1][0].onclick = function(e) { handlePixelTap(1,0); }
pixels[1][1].onclick = function(e) { handlePixelTap(1,1); }
pixels[1][2].onclick = function(e) { handlePixelTap(1,2); }
pixels[1][3].onclick = function(e) { handlePixelTap(1,3); }
pixels[1][4].onclick = function(e) { handlePixelTap(1,4); }

pixels[2][0].onclick = function(e) { handlePixelTap(2,0); }
pixels[2][1].onclick = function(e) { handlePixelTap(2,1); }
pixels[2][2].onclick = function(e) { handlePixelTap(2,2); }
pixels[2][3].onclick = function(e) { handlePixelTap(2,3); }
pixels[2][4].onclick = function(e) { handlePixelTap(2,4); }

pixels[3][0].onclick = function(e) { handlePixelTap(3,0); }
pixels[3][1].onclick = function(e) { handlePixelTap(3,1); }
pixels[3][2].onclick = function(e) { handlePixelTap(3,2); }
pixels[3][3].onclick = function(e) { handlePixelTap(3,3); }
pixels[3][4].onclick = function(e) { handlePixelTap(3,4); }

pixels[4][0].onclick = function(e) { handlePixelTap(4,0); }
pixels[4][1].onclick = function(e) { handlePixelTap(4,1); }
pixels[4][2].onclick = function(e) { handlePixelTap(4,2); }
pixels[4][3].onclick = function(e) { handlePixelTap(4,3); }
pixels[4][4].onclick = function(e) { handlePixelTap(4,4); }

function handlePixelTap(row,col) {
  vibration.start("bump");
  
  //Easter eggs
  let i=0
  if (col == 0) {
    for (i=0; i<5; i++) {
      if (i != row)
        easterEggTrigger[i] = 0;
    }      
      
    if (easterEggTrigger[row] == 0) {
      easterEggTrigger[row] = 1;
      easterEggOldColor1 = pixCol[row][0];
      easterEggOldColor2 = pixCol[row][1];
    }
    else if (easterEggTrigger[row] == 2) {
      triggerEasterEgg(row);
      return;
    } else
      easterEggTrigger[row] = 1;
  } else if (col == 1) {
    for (i=0; i<5; i++) {
      if (i != row)
        easterEggTrigger[i] = 0;
    }      

    if (easterEggTrigger[row] == 1)
      easterEggTrigger[row]++;
    else
      easterEggTrigger[row] = 0;
  } else {
    easterEggTrigger[row] = 0;
  }
  
  //Change colour
  pixCol[row][col]++;
  if (pixCol[row][col] >= colors.length)
    pixCol[row][col] = 0;
  pixels[row][col].style.fill = colors[pixCol[row][col]];
  changed = 1;
}

function triggerEasterEgg(index) {
  //Resore colours
  setColor(index, 0, easterEggOldColor1);
  setColor(index, 1, easterEggOldColor2);
  
  easterEggTrigger[index] = 0;
  if (index == 0)
    randomise();
  else if (index == 1)
    clear();
  else if (index == 2)
    randomChangeActive = 1 - randomChangeActive;
  else if (index == 3)
    changeOpacity();
  else if (index == 4)
    shift();
}

function setColor(row,col,colorIndex) {
  pixCol[row][col] = colorIndex;
  pixels[row][col].style.fill = colors[colorIndex];
  changed = 1;
}

function randomise() {
  let i=0;
  let j=0;
  for (i=0; i<5; i++) {
    for (j=0; j<5; j++) {
      setColor(i, j, Math.floor(Math.random() * colors.length));
    }
  }
}

function randomChange() {
  setColor(Math.floor(Math.random() * 5), 
           Math.floor(Math.random() * 5), 
           Math.floor(Math.random() * colors.length));
}

function clear() {
  let i=0;
  let j=0;
  for (i=0; i<5; i++) {
    for (j=0; j<5; j++) {
      setColor(i, j, defaultCol);
    }
  }
  defaultCol++;
  if (defaultCol >= colors.length)
    defaultCol = 0;
}

function changeOpacity() {
  opacity -= 0.2;
  if (opacity < 0.2)
    opacity = 0.8;
  
  let objects = document.getElementsByClassName("pix");
  objects.forEach(function(object, index) {
    object.style.opacity = opacity;
  });
}

function shift() {
  let i=0;
  let j=0;
  for (i=0; i<5; i++) {
    let temp = pixCol[i][0];
    pixCol[i].shift();
    pixCol[i].push(temp);
  }
  for (i=0; i<5; i++) {
    for (j=0; j<5; j++) {
      setColor(i, j, pixCol[i][j]);
    }
  }
}

let hourHand = document.getElementById("hours");
let minHand = document.getElementById("mins");
let secHand = document.getElementById("secs");

// Returns an angle (0-360) for the current hour in the day, including minutes
function hoursToAngle(hours, minutes) {
  let hourAngle = (360 / 12) * hours;
  let minAngle = (360 / 12 / 60) * minutes;
  return hourAngle + minAngle;
}

// Returns an angle (0-360) for minutes
function minutesToAngle(minutes) {
  return (360 / 60) * minutes;
}

// Returns an angle (0-360) for seconds
function secondsToAngle(seconds) {
  return (360 / 60) * seconds;
}

// Rotate the hands every tick
function updateClock() {
  tenSecCountDown--;
  let today = new Date();
  let hours = today.getHours() % 12;
  let mins = today.getMinutes();
  let secs = today.getSeconds();

  hourHand.groupTransform.rotate.angle = hoursToAngle(hours, mins);
  minHand.groupTransform.rotate.angle = minutesToAngle(mins);
  secHand.groupTransform.rotate.angle = secondsToAngle(secs);
 
  updateStepsIconPos();
  
  if (randomChangeActive == 1)
    randomChange();
  
  //Save every 60 seconds
  if (tenSecCountDown <= 0)
    saveStatus();
  
  if (tenSecCountDown <= 0)
    tenSecCountDown = 10;
}


function updateStepsIconPos() {
  //console.log("steps");
  try {
    let steps = today.adjusted.steps || 0;
    let goal = goals.steps || 10000;
    let complete = steps / goal;
    //console.log("steps: "+steps+", goal: "+goal);
    stepsIcon.y = 245 - complete * 240;
  } catch (ex) {
    console.log(ex);
  }
}

// Update the clock every tick event
clock.ontick = () => updateClock();

function loadStatus() {
  try {
    let status = fs.readFileSync(STATUS_FILE, "cbor");
    pixCol[0] = status.row0;
    pixCol[1] = status.row1;
    pixCol[2] = status.row2;
    pixCol[3] = status.row3;
    pixCol[4] = status.row4;
    
    let i=0;
    let j=0;
    for (i=0; i<5; i++) {
      for (j=0; j<5; j++) {
        pixels[i][j].style.fill = colors[pixCol[i][j]];
      }
    }
  } catch (ex) {
  }
}

function saveStatus() {
  if (changed == 0)
    return;
  //console.log("saving");
  try {
    let status = {"row0":pixCol[0],
                  "row1":pixCol[1],
                  "row2":pixCol[2],
                  "row3":pixCol[3],
                  "row4":pixCol[4]
                 };
    fs.writeFileSync(STATUS_FILE, status, "cbor");
    changed = 0;
  } catch (ex) {
  }
}