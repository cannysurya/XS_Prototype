const vscode = acquireVsCodeApi();

console.log("Digital Scope is loaded");

var trace1 = {
  x: [1, 2, 3, 4],
  y: [10, 15, 13, 17],
  type: "scatter",
};

var trace2 = {
  x: [1, 2, 3, 4],
  y: [16, 5, 11, 9],
  type: "scatter",
};

var mainGraphData = [trace1, trace2];

Plotly.newPlot("myDiv", mainGraphData);

window.addEventListener("message", (event) => {
  debugger;
  switch (event.data.command) {
  }
});
