const vscode = acquireVsCodeApi();

var annotations=[];
var axisValAnnotations=[];
var tracesAnnotations=[];
var currentState = "lines";
var pins = {
  group: {
    name: "All Pins",
    checked: false
  },
  list: [
    {name: 'Cycle',
     checked: true},
     {name: 'Vector',
     checked: false},
     {name: 'Opcode',
     checked: false},
     {name: 'TimingSet',
     checked: false},
     {name: 'FUNC_SEL_',
     checked: false},
     {name: 'GPIO_6',
     checked: false},
     {name: 'GPIO_7',
     checked: false},
     {name: 'GPIO_8',
     checked: false}
  ]
}

for(let z=9; z<=512; z++){
  pins.list.push({
    name: `GPIO_${z}`,
    checked: false
  })
}

var globalX = [];
var globalY = [];
var cursors = [];
var annotationsArrayToDisplayValue = [];
var hoverMode = 'Disabled';
var cursorClicked;
var attachListenersFirstTime = true;
var config = {
  modeBarButtonsToAdd: [
    {
      name: 'marker',
      icon: Plotly.Icons.pencil,
      direction: 'up',
      click: function(gd) {
         if(currentState=="lines"){
          Plotly.restyle(gd, 'mode', 'lines+markers');
          currentState="markers"
        }
        else{
          Plotly.restyle(gd, 'mode', 'lines');
          currentState = "lines"
        }
    }
  }
],
  edits: {
    //shapePosition: true ,
  }
};
var layout ={
  width: 1000,
  autosize:true,
  hovermode: false,
  dragmode: false,
  paper_bgcolor: "rgba(0,0,0,0)",
  plot_bgcolor: "rgba(0,0,0,0)",
  xaxis: {
     type: 'linear',
     domain: [0, 1],
     ticksuffix: "ns",
     gridcolor: "rgba(0,0,0,0)"
   },
  yaxis:{
    showticklabels: false,
    gridcolor: "rgba(0,0,0,0)"
  },
  showlegend: false,
};

var plotHandle = document.getElementById('plot');
var cursorSelection = document.getElementById("cursorType");
var minimum = document.getElementById("min");
var maximum = document.getElementById("max");

maximum.addEventListener('change',scaleXaxis);
minimum.addEventListener('change',scaleXaxis);

//Pin list check box tree related functions
function renderTable() {

  let tableContainer = document.getElementById("pinList");
  tableContainer.innerHTML = `
      <input type="checkbox" id="checkbox-allpins" 
      class="checkbox-toplevel" ${pins.group.checked? 'checked':''}
      name=${pins.group.name} onchange="selectAllPins(this)">
    <label for=${pins.group.name}>${pins.group.name}</label><br>`;
  pins.list.forEach((pinName, index) => {
    tableContainer.innerHTML += `
        <div class="checkboxdiv-names">
        <input type="checkbox" id="checkbox-${index}" 
          class="checkbox-names" ${pinName.checked? 'checked':''}
          name=${pinName.name} onchange="processPinSelection(this)">
        <label for=${pinName.name}>${pinName.name}</label><br>
        </div>
      `
  })
  drawGraphs();
}

function selectAllPins(obj){
  pins.group.checked = obj.checked
  pins.list.forEach((pin, index)=>{
      pins.list[index].checked = obj.checked;
  })
  
  renderTable();
  
}

function processPinSelection(obj){
   pins.list.forEach((pin, index)=>{
     if(pins.list[index].name === obj.name){
       pins.list[index].checked = obj.checked;
     }
   })

  renderTable();
}

//graph drawing related functions
function generateSquare(min,max){
  
  var x =[];
  var y=[];
  
  axisValAnnotations.push({
    xref: 'paper',
    yref: 'y',
    x: 0,
    y: parseFloat(max),
    xanchor: 'right',
    yanchor: 'center',
    text: `1`,
    font:{
      family: 'Arial',
      size: 12,
      color: 'white'
    },
    showarrow: false
  });
  axisValAnnotations.push({
    xref: 'paper',
    yref: 'y',
    x: 0,
    y: parseFloat(min),
    xanchor: 'right',
    yanchor: 'center',
    text: `0`,
    font:{
      family: 'Arial',
      size: 12,
      color: 'white'
    },
    showarrow: false
  });

  for(let i=1;i<=262144;i++){
      x.push(i);
  }

  for(let i=1;i<=2048;i++){
    for(let j=1;j<=64;j++){
        y.push(max);
        
    }
    for(let j=1;j<=64;j++){
       y.push(min);
    }
  }
  return {
      x:x,
      y:y
  }
}

function drawGraphs(){
  var data=[];
  tracesAnnotations=[];
  axisValAnnotations = [];
  var min=0;
  var max=1;
  
  var trace ={};
  layout.height = Math.max(100*pins.list.length,300);
  pins.list.filter(e => {return (e.checked===true)}).forEach((pinName) => {
    trace ={};
     trace ={
      name: pinName.name,
      x: generateSquare(min,max).x,
      y: generateSquare(min,max).y,
      mode: 'lines',
      marker:{
        size:5
      },
      hovertemplate:'<b>Voltage(V)</b>: %{y}V' +
        '<br><b>Time(ns)</b>: %{x}<br>',
      type: 'scatter',
      line: {
        color: 'green',
      }
    }
    tracesAnnotations.push({
      xref: 'paper',
      yref: 'paper',
      x: 0.5,
      y: 0,
      xanchor: 'right',
      yanchor: 'center',
      text: `<---Time(ns)--->`,
      font:{
        family: 'Arial',
        size: 12,
        color: 'white'
      },
      showarrow: false
    });
    tracesAnnotations.push({
      xref: 'paper',
      yref: 'y',
      x: 1,
      y: parseFloat(max-0.3),
      xanchor: 'left',
      yanchor: 'center',
      text: pinName.name,
      font:{
        family: 'Arial',
        size: 12,
        color: 'white'
      },
      showarrow: false
    });
    min = min +2;
    max = max +2;
    data.push(trace);
  })

  updateAnnotations();
  if(attachListenersFirstTime){
    Plotly.newPlot(plotHandle, data, layout, config).then(attachGraphListeners);
    attachListenersFirstTime = false;
  }
  else{
    Plotly.newPlot(plotHandle, data, layout, config);  
  }
}

function scaleXaxis(){
  let lowRange = parseInt(minimum.value);
  let highRange = parseInt(maximum.value);
  layout.xaxis.autorange = false;
  layout.xaxis.range = [lowRange,highRange];
  Plotly.relayout(plotHandle, layout);
}

//cursor related functions
cursorSelection.onchange = function() {
  hoverMode = (this.value == 'Horizontal')? this.value:((this.value == 'Vertical')? this.value: 'Disabled');
  layout.hovermode = hoverMode;
  Plotly.relayout(plotHandle,layout);
}

function attachGraphListeners() {
  plotHandle.addEventListener('mousedown', function(evt) {
    var bb = evt.target.getBoundingClientRect();
    var x = plotHandle._fullLayout.xaxis.p2d(evt.clientX - bb.left).toFixed(1);
    var y = plotHandle._fullLayout.yaxis.p2d(evt.clientY - bb.top).toFixed(1);
    if(globalX.includes(x) && hoverMode == 'Vertical'){
        for(let i=0;i<cursors.length;i++){
          if(cursors[i].x0 == x){
              if(evt.button === 2){
                cursors.splice(i,1);
                globalX.splice(i,1);
                annotationsArrayToDisplayValue.splice(i,1);
              }
              else{
                cursorClicked = i;
                cursors[i].opacity = 0.3;
                annotationsArrayToDisplayValue[i].opacity = 0.3;
              }
          }
        }
      }
    else if (globalY.includes(y) && hoverMode == 'Horizontal'){
      for(let i=0;i<cursors.length;i++){
          if(cursors[i].y0 == y){
            if(evt.button === 2){
              cursors.splice(i,1);
              globalX.splice(i,1);
              annotationsArrayToDisplayValue.splice(i,1);
            }
            else{
              cursorClicked = i;
              cursors[i].opacity = 0.3;
              annotationsArrayToDisplayValue[i].opacity = 0.3;
            }
          }
        }
      }
    layout.shapes = cursors;
    updateAnnotations();    
    Plotly.relayout(plotHandle,layout);
  });

  plotHandle.addEventListener('click', function(evt) {
    if(evt.pointerId == undefined && hoverMode != 'Disabled'){
      if(cursorClicked < cursors.length){
        cursors.splice(cursorClicked,1);
        globalX.splice(cursorClicked,1);
        annotationsArrayToDisplayValue.splice(cursorClicked,1);
        cursorClicked = undefined;
      }
      var bb = evt.target.getBoundingClientRect();
      var xCoordinate = plotHandle._fullLayout.xaxis.p2d(evt.clientX - bb.left).toFixed(1);
      var yCoordinate = plotHandle._fullLayout.yaxis.p2d(evt.clientY - bb.top).toFixed(1);
      if(hoverMode == 'Vertical' && !globalX.includes(xCoordinate)){
        globalX[globalX.length] = xCoordinate;
      }
      else if(hoverMode == 'Horizontal' && !globalY.includes(yCoordinate)){
        globalY[globalY.length] = yCoordinate;
      }
      DrawYellowLine();
    }
  });

}

function DrawYellowLine(){
  if(hoverMode == 'Horizontal'){
    cursors.push({
      opacity: 1,
      type: 'line',
      x0: 0,
      y0: globalY[globalY.length-1],
      x1: 1,
      xref: 'paper',
      y1: globalY[globalY.length-1],
      line: {
        color: 'yellow',
        width: 1.5,
        dash: 'solid',
      },
    });
    annotationsArrayToDisplayValue.push({
      opacity: 1,
      y: globalY[globalY.length-1],
      xref: 'paper',
      x: 0,
      text: globalY[globalY.length-1],
      showarrow: false,
      font: {
        size: 12
      },
      bgcolor: 'yellow'
    });
  }
  else{
    cursors.push({
      opacity: 1,
      type: 'line',
      x0: globalX[globalX.length-1],
      y0: 0,
      x1: globalX[globalX.length-1],
      yref: 'paper',
      y1: 1,
      line: {
        color: 'yellow',
        width: 1.5,
        dash: 'solid',
      },
    });
    annotationsArrayToDisplayValue.push({
      opacity: 1,
      x: globalX[globalX.length-1],
      yref: 'paper',
      y: 0,
      text: globalX[globalX.length-1],
      showarrow: false,
      font: {
        size: 12,
      },
      bgcolor: 'yellow'
    });
}

layout.hovermode = hoverMode;
layout.shapes = cursors;
updateAnnotations();
Plotly.relayout(plotHandle,layout);
}

//updating annotations for all the operations
function updateAnnotations(){
  layout.annotations = [];
  layout.annotations = axisValAnnotations.concat(tracesAnnotations,annotationsArrayToDisplayValue);
}
renderTable();

window.addEventListener("message", (event) => {
  debugger;
  switch (event.data.command) {
  }
});
