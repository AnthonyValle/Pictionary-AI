// Prompt users to start drawing
document.getElementById("prediction").innerText = 'Start drawing!';

// Grab random class name to set as final
var classes = ["cup", "flower", "happy face", "leaf", "star"]
var index = Math.floor(Math.random() * classes.length)
var className = classes[index]

// Store the previous final
var prevFinal = null

// function which changes the current class of what must be drawn
// The parameter "bool" determines whether the canvas should be added to the model's training set
function start(bool) {
    if (bool == true) {
        update()
    }

    index = Math.floor(Math.random() * classes.length)
    var choice = classes[index]

    while (choice == className){
        index = Math.floor(Math.random() * classes.length)
        choice = classes[index]
    }

    className = choice
    document.getElementById("choice").innerText = "The word is " + choice;
    clearCanvas()
}




// Auto guess feature which is toggled using a checkbox
let auto = false

setInterval(checkCheckBox, 100)
function checkCheckBox() {
  var checkBox = document.getElementById("check")
  if (checkBox.checked == true) {
    auto = true
  } else {
    auto = false
  }
}




// Feeds the model the currently drawn canvas to make a prediction
function guess() {

  // Grabs canvas' image data to alter
  var imgData=ctx.getImageData(0,0,canvas.width,canvas.height);
  var OldImgData=ctx.getImageData(0,0,canvas.width,canvas.height);
  var data=imgData.data;
  for(var i=0;i<data.length;i+=4){
      if(data[i+3]<255){
          data[i] = 255 - data[i];
          data[i+1] = 255 - data[i+1];
          data[i+2] = 255 - data[i+2];
          data[i+3] = 255 - data[i+3];
      }
  }
  ctx.putImageData(imgData,0,0);

  // Grabs base64 encoding of the canvas
  let base64 = canvas.toDataURL('image/jpeg');

  // Sends base64 encoding to a backend round that will make a prediction
  $.ajax({ 
    url: '/prediction', 
    type: 'POST', 
    data: { 'data': base64 }, 
    success: function(response) { 
        console.log('Success')
        getPrediction()
    }, 
    error: function(error) { 
        console.log(error); 
    } 
  });

    // Restore image back to its original form
    ctx.putImageData(OldImgData,0,0);
}



// Grabs the prediction
function getPrediction() {

  // Retrieves AI's prediction
  var url = "/fetch"
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.open( "GET", url, false ); // false for synchronous request
  xmlHttp.send( null );

  // Parse response
  final = JSON.parse(xmlHttp.responseText).result

  // If a new prediction appears, the AI will give a new response
  if (final != prevFinal) {
      document.getElementById("prediction").innerText = 'Hmmmm...';
      console.log(final)
      var output =  null;
      ranNum = Math.floor(Math.random() * 3)
      if (ranNum == 0) {
        output = "I know you drew a " + final
      } else if (ranNum == 1) {
        output = "I believe you drew a " + final
      } else {
        output = "It's cleary a " + final
      }

      document.getElementById("prediction").innerText = output;
      prevFinal = final
    }

}

// Image pipeline function
function update() {

  // Store olf image data
  var OldImgData=ctx.getImageData(0,0,canvas.width,canvas.height);

  // Grab canvas' pixel data to be altered
  var imgData=ctx.getImageData(0,0,canvas.width,canvas.height);
  var data=imgData.data;
  for(var i=0;i<data.length;i+=4){
      if(data[i+3]<255){
          data[i] = 255 - data[i];
          data[i+1] = 255 - data[i+1];
          data[i+2] = 255 - data[i+2];
          data[i+3] = 255 - data[i+3];
      }
  }
  ctx.putImageData(imgData,0,0);

  // Grabs the canvas' base 64 encoding
  let base64 = canvas.toDataURL('image/jpeg');

  // Send data to /process with a class name parameter
   var string = "/process/" + className
  $.ajax({ 
    url: string,
    type: 'POST', 
    data: { 'data': base64 }, 
    success: function(response) { 
        console.log('Success')
    }, 
    error: function(error) { 
        console.log(error); 
        }
    });

    // Restore image back to its original form
    ctx.putImageData(OldImgData,0,0);
}



// Clear canvas
function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  document.getElementById("prediction").innerText = 'Start drawing!';
  prevFinal = null
}
  


// Code to draw on the canvas
const canvas = document.getElementById("canvas")
canvas.height = 350
canvas.width = 350

const ctx = canvas.getContext("2d")
var prevX = null
var prevY = null
var draw = false
ctx.strokeStyle = "black"
var rect = canvas.getBoundingClientRect();
window.addEventListener("mousedown", (e) => draw = true)
window.addEventListener("mouseup", (e) => {
    draw = false
      if (auto){
        guess()
      }
    })

window.addEventListener("mousemove", (e) => {
  ctx.lineWidth = 10;
  rect = canvas.getBoundingClientRect();

  if (prevX == null || prevY == null || !draw) {
    prevX = e.clientX - rect.left
    prevY = e.clientY - rect.top
    return
  }

  let currentX = e.clientX - rect.left
  let currentY = e.clientY - rect.top

  ctx.beginPath()
  ctx.moveTo(prevX, prevY)
  ctx.lineTo(currentX, currentY)
  ctx.stroke()

  prevX = currentX
  prevY = currentY
})



// Drawing on touch screen devices
canvas.addEventListener('touchstart', startDrawTouch);
canvas.addEventListener('touchmove', drawTouch);
canvas.addEventListener('touchend', (e) => {
         if (auto){
        guess()
      }
});

var lastX = 0;
var lastY = 0;


function startDrawTouch(e) {
  isDrawing = true;
  var touch = e.touches[0];
  var rect = canvas.getBoundingClientRect();
  lastX = touch.clientX - rect.left;
  lastY = touch.clientY - rect.top;


}
function drawTouch(e) {
  ctx.lineWidth = 10;
  if (!isDrawing) return;
  var touch = e.touches[0];
  var rect = canvas.getBoundingClientRect(); // Get the canvas bounding rectangle
  var x = touch.clientX - rect.left; // Calculate x coordinate relative to canvas
  var y = touch.clientY - rect.top; // Calculate y coordinate relative to canvas
  
  ctx.beginPath();
  ctx.moveTo(lastX, lastY);
  ctx.lineTo(x, y);
  ctx.stroke();
  
  lastX = x;
  lastY = y;
}



// Set size of canvas based on window's size
const height = window.innerHeight;
const width = window.innerWidth;
canvas.width = width;
canvas.height = height/1.35 - 100;

// run start function
start(false)


// Code for RGB theme
setInterval(changeBGColor, 10)

var transition = 1 //1-6
var r = 245
var g = 66
var b = 66
function changeBGColor() {
console.log(transition)
    if (transition == 1) {
        g += 1
        if (g > 245) {transition = 2}

        document.body.style.background = "rgb("+r.toString()+","+g.toString()+","+b.toString()+")"
    } else if (transition == 2) {
        r -= 1
        if (r < 66) {transition = 3}

        document.body.style.background = "rgb("+r.toString()+","+g.toString()+","+b.toString()+")"
    } else if (transition == 3) {
        b += 1
        if (b > 245) {transition = 4}

        document.body.style.background = "rgb("+r.toString()+","+g.toString()+","+b.toString()+")"
    } else if (transition == 4) {
        g -= 1
        if (g < 66) {transition = 5}

        document.body.style.background = "rgb("+r.toString()+","+g.toString()+","+b.toString()+")"
    } else if (transition ==5) {
        r += 1
        if (r > 245) {transition = 6}

        document.body.style.background = "rgb("+r.toString()+","+g.toString()+","+b.toString()+")"
    } else if (transition == 6) {
        b -= 1
        if (b < 66){transition = 1}

        document.body.style.background = "rgb("+r.toString()+","+g.toString()+","+b.toString()+")"
    }
}
