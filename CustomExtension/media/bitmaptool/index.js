const vscode = acquireVsCodeApi();

let mainGraphRowPoints = [];
let mainGraphColumnPoints = [];
let mainGraphDataPoints = [];

let cursorGraphRowPoints = [];
let cursorGraphColumnPoints = [];
let cursorGraphDataPoints = [];

function plotMainGraph() {
  Plotly.newPlot(
    "main-graph",
    [
      {
        x: mainGraphRowPoints,
        y: mainGraphColumnPoints,
        z: mainGraphDataPoints,
        colorscale: [
          [0, "#FF0000"],
          [1, "#00FF00"],
        ],
        type: "heatmap",
        showscale: false,
        hoverinfo: "x+y",
      },
    ],
    {
      autosize: true,
      paper_bgcolor: "rgba(0,0,0,0)",
      plot_bgcolor: "rgba(0,0,0,0)",
      title: "",
      showlegend: false,
      margin: {
        l: 40,
        r: 10,
        t: 0,
        b: 40,
      },
      xaxis: {
        showgrid: false,
        zeroline: false,
        visible: true,
        ticks: "",
        ticksuffix: " ",
      },
      yaxis: {
        showgrid: false,
        zeroline: false,
        visible: true,
        ticks: "",
        ticksuffix: " ",
      },
    }
  );
}

function plotCursorGraph(bitMapToolGraphData) {
  Plotly.newPlot(
    "cursor-graph",
    [
      {
        x: cursorGraphRowPoints,
        y: cursorGraphColumnPoints,
        z: cursorGraphDataPoints,
        colorscale: [
          [0, "#FF0000"],
          [1, "#00FF00"],
        ],
        type: "heatmap",
        showscale: false,
        hoverinfo: "none",
      },
    ],
    {
      autosize: true,
      paper_bgcolor: "rgba(0,0,0,0)",
      plot_bgcolor: "rgba(0,0,0,0)",
      title: "",
      showlegend: false,
      margin: {
        l: 40,
        r: 10,
        t: 0,
        b: 40,
      },
      xaxis: {
        showgrid: false,
        zeroline: false,
        visible: false,
      },
      yaxis: {
        showgrid: false,
        zeroline: false,
        visible: false,
      },
    },
    { displayModeBar: false }
  );

  var myPlot = document.getElementById("cursor-graph");
  myPlot.on("plotly_click", function (data) {
    vscode.postMessage({
      command: "loadMainGraphData",
      x: data.points[0].x,
      y: data.points[0].y,
    });
  });

  dragLayer = myPlot.getElementsByClassName("nsewdrag")[0];

  myPlot.on("plotly_hover", function (data) {
    dragLayer.style.cursor = "pointer";
  });

  myPlot.on("plotly_unhover", function (data) {
    dragLayer.style.cursor = "";
  });

  myPlot.on("plotly_relayout", function (data) {
    console.log("relayout DATA ", data);
  });
}

function updateMainGraphDataWithString(stringData) {
  var rowLines = stringData.split("\n");
  rowLines.forEach((row, index) => {
    if (row.trim() === "") {
      return;
    }
    mainGraphDataPoints[index] = row.split(",");
  });
}

function execute() {
  vscode.postMessage({
    command: "execute",
  });
}

window.addEventListener("message", (event) => {
  switch (event.data.command) {
    case "updateMainGraphRowPoints":
      mainGraphRowPoints = event.data.mainGraphRowPoints;
      break;
    case "updateMainGraphColumnPoints":
      mainGraphColumnPoints = event.data.mainGraphColumnPoints;
      break;
    case "plotMainGraph":
      mainGraphDataPoints = event.data.mainGraphDataPoints;
      plotMainGraph();
      break;
    case "plotMainGraphWithStringData":
      updateMainGraphDataWithString(event.data.mainGraphDataPointsInString);
      plotMainGraph();
      break;
    case "updateCursorGraphRowPoints":
      cursorGraphRowPoints = event.data.cursorGraphRowPoints;
      break;
    case "updateCursorGraphColumnPoints":
      cursorGraphColumnPoints = event.data.cursorGraphColumnPoints;
      break;
    case "plotCursorGraph":
      cursorGraphDataPoints = event.data.cursorGraphDataPoints;
      plotCursorGraph();
      break;
    case "syncData":
      mainGraphRowPoints = event.data.mainGraphRowPoints;
      mainGraphColumnPoints = event.data.mainGraphColumnPoints;
      mainGraphDataPoints = event.data.mainGraphDataPoints;
      cursorGraphRowPoints = event.data.cursorGraphRowPoints;
      cursorGraphColumnPoints = event.data.cursorGraphColumnPoints;
      cursorGraphDataPoints = event.data.cursorGraphDataPoints;
      plotCursorGraph();
      plotMainGraph();
    case "stringData":
      let stringData = event.data.receivedData;
      console.log(stringData);
      break;
    case "arrayData":
      break;
  }
});

vscode.postMessage({
  command: "syncData",
});
