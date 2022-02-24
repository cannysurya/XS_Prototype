const vscode = acquireVsCodeApi();

let scrollCounter = 0;
let minScrollCounter = 0;
let maxScrollCounter = 0;
let data = [];


var globalX = [];
var globalY = [];
var cursors = [];
var cursorMode = "Disabled";
var axisValAnnotations = [];
var tracesAnnotations = [];
var cursorAnnotations = [];
var annotations;

var cursorClicked;
var cursorMovementDecision;
var attachListenersFirstTime = true;
let layout = {
  autosize: true,
  paper_bgcolor: "rgba(0,0,0,0)",
  plot_bgcolor: "rgba(0,0,0,0)",
  title: "",
  showlegend: false,
  margin: {
    l: 40,
    r: 0,
    t: 20,
    b: 40,
  },
  xaxis: {
    title: "Time (microsecond)",
    type: "linear",
    domain: [0, 1],
    ticksuffix: "us",
    gridcolor: "rgba(0,0,0,0)",
  },
  yaxis: {
    title: "Voltage (v)",
    showticklabels: false,
    gridcolor: "rgba(0,0,0,0)",
  },
};
let configuration = {
  displaylogo: false,
  displayModeBar: true,
  modeBarButtons: [
    [
      {
        name: "Snapshot",
        icon: Plotly.Icons.camera,
        click: () => {
          vscode.postMessage({
            command: "postMessage",
            message: "Saving Snapshot...",
          });
          vscode.postMessage({
            command: "saveGraphData",
          });
        },
      },
    ],
    ["zoom2d"],
    ["zoomIn2d"],
    ["zoomOut2d"],
    ["autoScale2d"],
    ["select2d"],
    ["pan2d"]
  ],
};

function execute() {
  vscode.postMessage({
    command: "execute",
  });
}

var plotHandle = document.getElementById("graph");
var cursorSelection = document.getElementById("cursorType");

function generateTraces(dataPoints) {
  dataPoints.reverse();
  data = [];
  let factor = 1 / dataPoints.length;
  let minValue = 0;
  let maxValue = factor;
  let margin = (maxValue - minValue) / 4;
  for (let i = 0; i < dataPoints.length; i++) {
    let yPoints = dataPoints[i].split("").map((x) => {
      return x === "0" ? minValue + margin : maxValue - margin;
    });
    data.push({
      x: [...Array(dataPoints[i].length).keys()],
      y: yPoints,
      type: "scatter",
      mode: "lines",
      marker: {
        size: 5,
      },
      hovertemplate: "<b>Voltage(V)</b>: %{%{y}+2}V" + "<br><b>Time(us)</b>: %{x}<br>",
      line: {
        color: "green",
      },
    });
    axisValAnnotations.push({
      xref: 'paper',
      yref: 'y',
      x: 0,
      y: parseFloat(maxValue - margin),
      xanchor: 'right',
      yanchor: 'center',
      text: `1`,
      font:{
        family: 'Arial',
        size: 10,
        color: 'white'
      },
      showarrow: false
    });
    axisValAnnotations.push({
      xref: 'paper',
      yref: 'y',
      x: 0,
      y: parseFloat(minValue + margin),
      xanchor: 'right',
      yanchor: 'center',
      text: `0`,
      font:{
        family: 'Arial',
        size: 10,
        color: 'white'
      },
      showarrow: false
    });
    tracesAnnotations.push({
      xref: "paper",
      yref: "y",
      x: 1,
      y: parseFloat(maxValue),
      xanchor: "left",
      yanchor: "center",
      text: `Line ${i}`,
      font: {
        family: "Arial",
        size: 10,
        color: "white",
      },
      showarrow: false,
    });
      
    minValue = maxValue;
    maxValue = maxValue + factor;
  }
}

function plotGraph() {
  
  if (attachListenersFirstTime) {
    Plotly.newPlot("graph", data, layout, configuration).then(attachGraphListeners);
    attachListenersFirstTime = false;
    // scaleXaxis();
  } else {
    Plotly.newPlot("graph", data, layout, configuration);
    // scaleXaxis();
  }
}

function scrollUp() {
  let value = scrollCounter > minScrollCounter ? scrollCounter - 1 : minScrollCounter;
  if (value !== scrollCounter) {
    scrollCounter = value;
    vscode.postMessage({
      command: "updateScrollCounter",
      value: scrollCounter,
    });
  }
}

function scrollDown() {
  let value = scrollCounter < maxScrollCounter ? scrollCounter + 1 : maxScrollCounter;
  if (value !== scrollCounter) {
    scrollCounter = value;
    vscode.postMessage({
      command: "updateScrollCounter",
      value: scrollCounter,
    });
  }
}

function setMaxScrollCounter(activeChannelCount) {
  maxScrollCounter = activeChannelCount;
  if (maxScrollCounter < scrollCounter) {
    scrollCounter = maxScrollCounter;
    vscode.postMessage({
      command: "updateScrollCounter",
      value: scrollCounter,
    });
  }
}

window.addEventListener("message", (event) => {
  switch (event.data.command) {
    case "updateGraph":
      generateTraces(event.data.dataPoints);
      setMaxScrollCounter(event.data.maxScrollCounter);
      updateAnnotations();
      plotGraph();
      break;
    case "syncData":
      debugger;
      generateTraces(event.data.dataPoints);
      scrollCounter = event.data.scrollCounter;
      setMaxScrollCounter(event.data.maxScrollCounter);
      annotations = event.data.annotations;
      cursorMode = event.data.cursorMode;
      cursors = event.data.cursors;
      updateLocals();
      plotGraph();
      break;
  }
});

vscode.postMessage({
  command: "syncData",
});



cursorSelection.onchange = function () {
  cursorMode = this.value == "Horizontal" ? this.value : this.value == "Vertical" ? this.value : "Disabled";
  vscode.postMessage({
    command: "cursorModeChanged",
    value: cursorMode,
  });
  
};

function updateLocals(){
  layout.dragmode = (cursorMode == "Disabled") ? true : false;
  cursorSelection.value = cursorMode;
  layout.shapes = cursors;
  axisValAnnotations = annotations.axisValAnnotations;
  tracesAnnotations = annotations.tracesAnnotations;
  cursorAnnotations = annotations.cursorAnnotations;
  layout.annotations = axisValAnnotations.concat(tracesAnnotations, cursorAnnotations);
}

function attachGraphListeners() {
  plotHandle.addEventListener("mousedown", function (evt) {
    var bb = evt.target.getBoundingClientRect();
    var x = plotHandle._fullLayout.xaxis.p2d(evt.clientX - bb.left).toFixed();
    var y = plotHandle._fullLayout.yaxis.p2d(evt.clientY - bb.top).toFixed(2);
    if (cursorMode == "Vertical") {
      for (let i = 0; i < cursors.length; i++) {
        if (cursors[i].x0 == x || (cursors[i].x0 <= x + cursorMovementDecision && cursors[i].x0 >= x - cursorMovementDecision)) {
          if (evt.button === 2) {
            cursors.splice(i, 1);
            globalX.splice(i, 1);
            cursorAnnotations.splice(i, 1);
          } else {
            cursorClicked = i;
            cursors[i].opacity = 0.3;
            cursorAnnotations[i].opacity = 0.3;
          }
          layout.shapes = cursors;
          updateAnnotations();
          Plotly.relayout(plotHandle, layout);
          break;
        }
      }
    } else if (globalY.includes(y) && cursorMode == "Horizontal") {
      for (let i = 0; i < cursors.length; i++) {
        if (cursors[i].y0 == y) {
          if (evt.button === 2) {
            cursors.splice(i, 1);
            globalY.splice(i, 1);
            cursorAnnotations.splice(i, 1);
          } else {
            cursorClicked = i;
            cursors[i].opacity = 0.3;
            cursorAnnotations[i].opacity = 0.3;
          }
          layout.shapes = cursors;
          updateAnnotations();
          Plotly.relayout(plotHandle, layout);
        }
      }
    }
  });

  plotHandle.addEventListener("click", function (evt) {
    if (evt.toElement.localName == "rect" && cursorMode != "Disabled") {
      if (cursorClicked < cursors.length) {
        cursors.splice(cursorClicked, 1);
        if(cursorMode == 'Vertical'){
          globalX.splice(cursorClicked, 1);
        }
        else if(cursorMode == 'Horizontal'){
          globalY.splice(cursorClicked, 1);
        }
        
        cursorAnnotations.splice(cursorClicked, 1);
        cursorClicked = undefined;
      }
      var bb = evt.target.getBoundingClientRect();
      var xCoordinate = plotHandle._fullLayout.xaxis.p2d(evt.clientX - bb.left).toFixed();
      var yCoordinate = plotHandle._fullLayout.yaxis.p2d(evt.clientY - bb.top).toFixed(2);
      if (cursorMode == "Vertical" && !globalX.includes(xCoordinate)) {
        globalX[globalX.length] = xCoordinate;
      } else if (cursorMode == "Horizontal" && !globalY.includes(yCoordinate)) {
        globalY[globalY.length] = yCoordinate;
      }
      drawYellowLine();
    }
  });
}

function drawYellowLine() {
  if (cursorMode == "Horizontal") {
    cursors.push({
      opacity: 1,
      type: "line",
      x0: 0,
      y0: globalY[globalY.length - 1],
      x1: 1,
      xref: "paper",
      y1: globalY[globalY.length - 1],
      line: {
        color: "yellow",
        width: 1.5,
        dash: "solid",
      },
    });
    cursorAnnotations.push({
      opacity: 1,
      y: globalY[globalY.length - 1],
      xref: "paper",
      x: 0,
      text: globalY[globalY.length - 1],
      showarrow: false,
      font: {
        size: 12,
      },
      bgcolor: "yellow",
    });
  } else {
    cursors.push({
      opacity: 1,
      type: "line",
      x0: globalX[globalX.length - 1],
      y0: 0,
      x1: globalX[globalX.length - 1],
      yref: "paper",
      y1: 1,
      line: {
        color: "yellow",
        width: 1.5,
        dash: "solid",
      },
    });
    cursorAnnotations.push({
      opacity: 1,
      x: globalX[globalX.length - 1],
      yref: "paper",
      y: 0,
      text: globalX[globalX.length - 1],
      showarrow: false,
      font: {
        size: 12,
      },
      bgcolor: "yellow",
    });
  }

  vscode.postMessage({
    command: "cursorsUpdated",
    value: cursors,
  });
  layout.shapes = cursors;
  updateAnnotations();
  Plotly.relayout(plotHandle, layout);
}

function updateAnnotations() {
    layout.annotations = [];
    layout.annotations = axisValAnnotations.concat(tracesAnnotations, cursorAnnotations);
    annotations = { axisValAnnotations, tracesAnnotations, cursorAnnotations}
    vscode.postMessage({
      command: "annotationsUpdated",
      value: annotations,
    });
  }

// var pins = {
//   group: {
//     name: "All Pins",
//     checked: false,
//   },
//   list: [
//     { name: "Cycle", checked: true },
//     { name: "Vector", checked: true },
//     { name: "Opcode", checked: true },
//     { name: "TimingSet", checked: true },
//     { name: "FUNC_SEL_", checked: true },
//     { name: "GPIO_6", checked: true },
//     { name: "GPIO_7", checked: false },
//     { name: "GPIO_8", checked: false },
//   ],
// };

// //Generate 512pins * 262144data
// for (let z = 9; z <= 512; z++) {
//   pins.list.push({
//     name: `GPIO_${z}`,
//     checked: false,
//   });
// }

// var annotations = [];
// var axisValAnnotations = [];
// var tracesAnnotations = [];
// var currentState = "lines";
// var data = [];

// var attachListenersFirstTime = true;
// var graphsToDisplay = 0;
// var startIndexOfChunk = 0;
// var endIndexOfChunk = 0;

// var lowPinValue = 0;
// var highPinValue = 1;
// var config = {
//   modeBarButtonsToRemove: ["toImage", "resetScale2d", "hoverCompareCartesian", "toggleSpikelines"],
//   modeBarButtonsToAdd: ["hoverClosestCartesian"],
//   displaylogo: false,
// };
// var layout = {
//   autosize: true,
//   hovermode: "closest",
//   dragmode: true,
//   paper_bgcolor: "rgba(0,0,0,0)",
//   plot_bgcolor: "rgba(0,0,0,0)",
//   xaxis: {
//     title: "Time (microsecond)",
//     type: "linear",
//     domain: [0, 1],
//     ticksuffix: "us",
//     gridcolor: "rgba(0,0,0,0)",
//   },
//   yaxis: {
//     title: "Voltage (v)",
//     showticklabels: true,
//     gridcolor: "rgba(0,0,0,0)",
//   },
//   margin: {
//     l: 40,
//     r: 60,
//     t: 5,
//     b: 40,
//   },
//   showlegend: false,
// };

// var plotHandle = document.getElementById("plot");
// var cursorSelection = document.getElementById("cursorType");
// var minimum = document.getElementById("min");
// var maximum = document.getElementById("max");
// var noOfGraphs = document.getElementById("graphs");
// var nextButton = document.getElementById("next");
// var previousButton = document.getElementById("previous");

// maximum.addEventListener("change", scaleXaxis);
// minimum.addEventListener("change", scaleXaxis);
// noOfGraphs.addEventListener("change", updateGraphsToDisplay);
// nextButton.addEventListener("click", showNextGraphs);
// previousButton.addEventListener("click", showPreviousGraphs);

// //Pin list check box tree related functions
// function renderTable() {
//   let tableContainer = document.getElementById("pinList");
//   tableContainer.innerHTML = `
//       <input type="checkbox" id="checkbox-allpins"
//       class="checkbox-toplevel" ${pins.group.checked ? "checked" : ""}
//       name=${pins.group.name} onchange="selectAllPins(this)">
//     <label for=${pins.group.name}>${pins.group.name}</label><br>`;
//   pins.list.forEach((pinName, index) => {
//     tableContainer.innerHTML += `
//         <div class="checkboxdiv-names">
//         <input type="checkbox" id="checkbox-${index}"
//           class="checkbox-names" ${pinName.checked ? "checked" : ""}
//           name=${pinName.name} onchange="processPinSelection(this)">
//         <label for=${pinName.name}>${pinName.name}</label><br>
//         </div>
//       `;
//   });
//   prepareData();
// }

// function selectAllPins(obj) {
//   pins.group.checked = obj.checked;
//   pins.list.forEach((pin, index) => {
//     pins.list[index].checked = obj.checked;
//   });

//   renderTable();
// }

// function processPinSelection(obj) {
//   pins.list.forEach((pin, index) => {
//     if (pins.list[index].name === obj.name) {
//       pins.list[index].checked = obj.checked;
//     }
//   });

//   renderTable();
// }

// //graph drawing related functions
// function generateSquare(lowPin, highPin) {
//   var x = [];
//   var y = [];
//   var us = 0.0296875; //time taken for acquiring one sample
//   for (let i = 1; i <= 262144; i++) {
//     x.push(us * i);
//   }

//   for (let i = 1; i <= 2048; i++) {
//     for (let j = 1; j <= 64; j++) {
//       y.push(lowPin);
//     }
//     for (let j = 1; j <= 64; j++) {
//       y.push(highPin);
//     }
//   }
//   return {
//     x: x,
//     y: y,
//   };
// }

// function prepareData() {
//   data = [];
//   var trace = {};
//   let checkedPins = pins.list.filter((e) => {
//     return e.checked === true;
//   });
//   checkedPins.forEach((pinName) => {
//     trace = {};
//     trace = {
//       name: pinName.name,
//       //below two lines is the data we need to fetch from the file and update
//       x: generateSquare(lowPinValue, highPinValue).x,
//       y: generateSquare(lowPinValue, highPinValue).y,
//       mode: "lines",
//       marker: {
//         size: 5,
//       },
//       hovertemplate: "<b>Voltage(V)</b>: %{%{y}+2}V" + "<br><b>Time(us)</b>: %{x}<br>",
//       type: "scatter",
//       line: {
//         color: "green",
//       },
//     };
//     // min = min +2;
//     // max = max +2;
//     data.push(trace);
//   });

//   updateGraphsToDisplay();
// }

// function factorYAxisData(yData, lowFactor, highFactor) {
//   yData.forEach((el, index) => {
//     if (el == lowPinValue) {
//       yData[index] = el + lowFactor;
//     } else if (el == highPinValue) {
//       yData[index] = el + highFactor;
//     }
//   });

//   return yData;
// }

// function scaleXaxis() {
//   let lowRange = parseInt(minimum.value);
//   let highRange = parseInt(maximum.value);
//   layout.xaxis.autorange = false;
//   layout.xaxis.range = [lowRange, highRange];
//   Plotly.relayout(plotHandle, layout);
// }

// function updateSelectedChunk(startIndex, endIndex) {
//   var dataNew = [];
//   axisValAnnotations = [];
//   tracesAnnotations = [];
//   for (let i = startIndex; i <= endIndex; i++) {
//     if (data[i] != undefined) {
//       dataNew.push(data[i]);
//     }
//   }
//   let mini = 0;
//   let maxi = 0;

//   dataNew.forEach((element) => {
//     // element.x=generateSquare(mini,maxi).x;
//     element.y = factorYAxisData(element.y, mini, maxi);

//     //  axisValAnnotations.push({
//     //   xref: 'paper',
//     //   yref: 'y',
//     //   x: 0,
//     //   y: parseFloat(maxi),
//     //   xanchor: 'right',
//     //   yanchor: 'center',
//     //   text: `1`,
//     //   font:{
//     //     family: 'Arial',
//     //     size: 12,
//     //     color: 'white'
//     //   },
//     //   showarrow: false
//     // });
//     // axisValAnnotations.push({
//     //   xref: 'paper',
//     //   yref: 'y',
//     //   x: 0,
//     //   y: parseFloat(mini),
//     //   xanchor: 'right',
//     //   yanchor: 'center',
//     //   text: `0`,
//     //   font:{
//     //     family: 'Arial',
//     //     size: 12,
//     //     color: 'white'
//     //   },
//     //   showarrow: false
//     // });
//     tracesAnnotations.push({
//       xref: "paper",
//       yref: "y",
//       x: 1,
//       y: parseFloat(maxi - 0.3),
//       xanchor: "left",
//       yanchor: "center",
//       text: `${element.name}`,
//       font: {
//         family: "Arial",
//         size: 12,
//         color: "white",
//       },
//       showarrow: false,
//     });

//     mini = mini + 2;
//     maxi = maxi + 2;
//   });

//   updateAnnotations();
//   if (attachListenersFirstTime) {
//     Plotly.newPlot(plotHandle, dataNew, layout, config).then(attachGraphListeners);
//     attachListenersFirstTime = false;
//     scaleXaxis();
//   } else {
//     Plotly.newPlot(plotHandle, dataNew, layout, config);
//     scaleXaxis();
//   }

//   plotHandle.on("plotly_relayout", function (evt) {
//     minimum.value = parseInt(layout.xaxis.range[0]);
//     maximum.value = parseInt(layout.xaxis.range[1]);

//     var difference = maximum.value - minimum.value;
//     if (difference < 8000) {
//       cursorMovementDecision = parseInt(difference / 1000);
//     } else {
//       cursorMovementDecision = 10 + parseInt(difference / 1000);
//     }
//   });
// }

// function showNextGraphs() {
//   if (startIndexOfChunk + 1 + Math.max(0, graphsToDisplay - 1) < data.length) {
//     startIndexOfChunk = startIndexOfChunk + 1;
//     endIndexOfChunk = startIndexOfChunk + Math.max(0, graphsToDisplay - 1);
//     updateSelectedChunk(startIndexOfChunk, endIndexOfChunk);
//   }
// }

// function updateGraphsToDisplay() {
//   startIndexOfChunk = 0;
//   graphsToDisplay = parseInt(noOfGraphs.value);
//   endIndexOfChunk = Math.max(0, graphsToDisplay - 1);
//   updateSelectedChunk(startIndexOfChunk, endIndexOfChunk);
// }

// function showPreviousGraphs() {
//   if (startIndexOfChunk > 0) {
//     endIndexOfChunk = Math.max(0, endIndexOfChunk - 1);
//     startIndexOfChunk = Math.max(0, startIndexOfChunk - 1);
//     updateSelectedChunk(startIndexOfChunk, endIndexOfChunk);
//   }
// }


// //updating annotations for all the operations
// function updateAnnotations() {
//   layout.annotations = [];
//   layout.annotations = axisValAnnotations.concat(tracesAnnotations, cursorAnnotations);
// }
// renderTable();
