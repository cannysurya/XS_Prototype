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
        l: 0,
        r: 10,
        t: 0,
        b: 0,
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
        l: 0,
        r: 0,
        t: 0,
        b: 0,
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
