const vscode = acquireVsCodeApi();

function plotMainGraph(bitMapToolGraphData) {
  Plotly.newPlot(
    "main-graph",
    [
      {
        x: bitMapToolGraphData.mainGraphRowPoints,
        y: bitMapToolGraphData.mainGraphColumnPoints,
        z: bitMapToolGraphData.mainGraphDataPoints,
        colorscale: [
          [0, "#FF0000"],
          [1, "#00FF00"],
        ],
        type: "heatmap",
        showscale: false,
      },
    ],
    {
      title: "",
      showlegend: false,
    }
  );
}

function plotCursorGraph(bitMapToolGraphData) {
  Plotly.newPlot(
    "cursor-graph",
    [
      {
        x: bitMapToolGraphData.cursorGraphRowPoints,
        y: bitMapToolGraphData.cursorGraphColumnPoints,
        z: bitMapToolGraphData.cursorGraphDataPoints,
        colorscale: [
          [0, "#FF0000"],
          [1, "#00FF00"],
        ],
        type: "heatmap",
        showscale: false,
      },
    ],
    {
      title: "",
      showlegend: false,
    }
  );

  var myPlot = document.getElementById("cursor-graph");
  myPlot.on("plotly_click", function (data) {
    debugger;
  });
}

function execute() {
  vscode.postMessage({
    command: "execute",
  });
}

window.addEventListener("message", (event) => {
  switch (event.data.command) {
    case "plotCursorGraph":
      plotCursorGraph(event.data.bitMapToolGraphData);
      break;
    case "plotMainGraph":
      plotMainGraph(event.data.bitMapToolGraphData);
      break;
    case "updateGraphs":
      plotCursorGraph(event.data.bitMapToolGraphData);
      plotMainGraph(event.data.bitMapToolGraphData);
  }
});

vscode.postMessage({
  command: "syncData",
});
