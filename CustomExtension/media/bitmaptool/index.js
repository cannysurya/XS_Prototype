var mainGraphRowCount = 2160;
var mainGraphColumnCount = 3840;

var mainGraphRowPoints = [];
var mainGraphColumnPoints = [];
var mainGraphDataPoints = [];

var cursorGraphRowSamples = 100;
var cursorGraphColumnSamples = 2;
var cursorGraphRowScale = 1000;
var cursorGraphColumnScale = 1000;
var cursorGraphRowRange = Math.ceil(mainGraphRowCount / cursorGraphRowScale) * cursorGraphRowSamples;
var cursorGraphColumnRange = Math.ceil(mainGraphColumnCount / cursorGraphColumnScale) * cursorGraphColumnSamples;

var cursorGraphRowReference = 0;
var cursorGraphColumnReference = 0;

var cursorGraphRowPoints = [];
var cursorGraphColumnPoints = [];
var cursorGraphDataPoints = [];

var patternType = 0;
var skipCursorGraph = false;

function updateCursorGraphData(cursorGraphData) {
  var rowReferenceOfSample = Math.ceil(mainGraphRowCount / cursorGraphRowScale);
  var columnReferenceOfSample = Math.ceil(mainGraphColumnCount / cursorGraphColumnScale);
  for (let rowNumber = 0; rowNumber < cursorGraphData.length; rowNumber++) {
    for (let columnNumber = 0; columnNumber < cursorGraphData[rowNumber].length; columnNumber++) {
      cursorGraphDataPoints[cursorGraphRowReference * rowReferenceOfSample + rowNumber][cursorGraphColumnReference * columnReferenceOfSample + columnNumber] = cursorGraphData[rowNumber][columnNumber];
    }
  }
  cursorGraphColumnReference++;

  if (cursorGraphColumnReference >= cursorGraphColumnSamples) {
    cursorGraphColumnReference = 0;
    cursorGraphRowReference++;
  }
  if (cursorGraphRowReference >= cursorGraphRowSamples) {
    return true;
  }
  return false;
}

function updateMainGraphData(mainGraphData) {
  for (let rowNumber = 0; rowNumber < mainGraphRowCount; rowNumber++) {
    for (let columnNumber = 0; columnNumber < mainGraphColumnCount; columnNumber++) {
      mainGraphDataPoints[rowNumber][columnNumber] = mainGraphData[rowNumber][columnNumber];
    }
  }
}

function initiateGraphSimulation() {
  var pattern = {};
  var stopSimulation = false;
  switch (patternType) {
    case 0:
      pattern = getCheckerPattern();
      break;
    case 1:
      pattern = getRandomPattern();
      break;
    case 2:
      pattern = getDominantPassPattern();
      break;
    case 3:
      pattern = getDominantFailPattern();
      break;
  }

  stopSimulation = updateCursorGraphData(pattern.cursorGraphPattern);

  updateMainGraphData(pattern.mainGraphPattern);
  plotGraphs();
  if (!stopSimulation) {
    patternType = (patternType + 1) % 4;
    setTimeout(initiateGraphSimulation, 1000);
  }
}

function plotGraphs() {
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
      },
    ],
    {
      title: "",
      showlegend: false,
    }
  );
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
      },
    ],
    {
      title: "",
      showlegend: false,
    }
  );
}

function addToCursorGraphPatternCollection(cursorGraphPatternCollection, data, rowNumber, columnNumber) {
  var collectionRowNumber = Math.floor([rowNumber / cursorGraphRowScale]);
  var collectionColumnNumber = Math.floor([columnNumber / cursorGraphColumnScale]);

  if (cursorGraphPatternCollection[collectionRowNumber] === undefined) {
    cursorGraphPatternCollection[collectionRowNumber] = [];
  }
  if (cursorGraphPatternCollection[collectionRowNumber][collectionColumnNumber] === undefined) {
    cursorGraphPatternCollection[collectionRowNumber][collectionColumnNumber] = {
      length: 0,
      sum: 0,
    };
  }
  cursorGraphPatternCollection[collectionRowNumber][collectionColumnNumber].sum += data;
  cursorGraphPatternCollection[collectionRowNumber][collectionColumnNumber].length++;
}

function getCursorGraphPatternFromCollection(cursorGraphPatternCollection) {
  var returnValue = [];
  for (let rowNumber = 0; rowNumber < cursorGraphPatternCollection.length; rowNumber++) {
    let newArray = [];
    for (let columnNumber = 0; columnNumber < cursorGraphPatternCollection[rowNumber].length; columnNumber++) {
      var patternInfo = cursorGraphPatternCollection[rowNumber][columnNumber];
      newArray.push(patternInfo.sum >= patternInfo.length * 0.5 ? 1 : 0);
    }
    returnValue.push(newArray);
  }
  return returnValue;
}

function getCheckerPattern() {
  var mainGraphPattern = [];
  var cursorGraphPatternCollection = [];
  var cursorGraphPattern = [];

  var counter = 1;
  var initialcounter = 1;
  for (let i = 0; i < mainGraphRowCount; i++) {
    var newArray = [];
    counter = initialcounter;
    for (let j = 0; j < mainGraphColumnCount; j++) {
      var data = counter++;
      newArray.push(data);
      if (!skipCursorGraph) {
        addToCursorGraphPatternCollection(cursorGraphPatternCollection, data, i, j);
      }
      counter %= 2;
    }
    initialcounter++;
    initialcounter %= 2;
    mainGraphPattern.push(newArray);
  }
  if (!skipCursorGraph) {
    cursorGraphPattern = getCursorGraphPatternFromCollection(cursorGraphPatternCollection);
  }
  return {
    mainGraphPattern: mainGraphPattern,
    cursorGraphPattern: cursorGraphPattern,
  };
}

function getRandomPattern() {
  var mainGraphPattern = [];
  var cursorGraphPatternCollection = [];
  var cursorGraphPattern = [];

  for (let i = 0; i < mainGraphRowCount; i++) {
    var newArray = [];
    for (let j = 0; j < mainGraphColumnCount; j++) {
      var data = Math.round(Math.random() * 10) % 2;
      newArray.push(data);
      if (!skipCursorGraph) {
        addToCursorGraphPatternCollection(cursorGraphPatternCollection, data, i, j);
      }
    }
    mainGraphPattern.push(newArray);
  }
  if (!skipCursorGraph) {
    cursorGraphPattern = getCursorGraphPatternFromCollection(cursorGraphPatternCollection);
  }
  return {
    mainGraphPattern: mainGraphPattern,
    cursorGraphPattern: cursorGraphPattern,
  };
}

function getDominantPassPattern() {
  var mainGraphPattern = [];
  var cursorGraphPatternCollection = [];
  var cursorGraphPattern = [];

  for (let i = 0; i < mainGraphRowCount; i++) {
    var newArray = [];
    for (let j = 0; j < mainGraphColumnCount; j++) {
      var data = Math.round(Math.random() * 10) < 8 ? 1 : 0;
      newArray.push(data);
      if (!skipCursorGraph) {
        addToCursorGraphPatternCollection(cursorGraphPatternCollection, data, i, j);
      }
    }
    mainGraphPattern.push(newArray);
  }
  if (!skipCursorGraph) {
    cursorGraphPattern = getCursorGraphPatternFromCollection(cursorGraphPatternCollection);
  }
  return {
    mainGraphPattern: mainGraphPattern,
    cursorGraphPattern: cursorGraphPattern,
  };
}

function getDominantFailPattern() {
  var mainGraphPattern = [];
  var cursorGraphPatternCollection = [];
  var cursorGraphPattern = [];

  for (let i = 0; i < mainGraphRowCount; i++) {
    var newArray = [];
    for (let j = 0; j < mainGraphColumnCount; j++) {
      var data = Math.round(Math.random() * 10) < 8 ? 0 : 1;
      newArray.push(data);
      if (!skipCursorGraph) {
        addToCursorGraphPatternCollection(cursorGraphPatternCollection, data, i, j);
      }
    }
    mainGraphPattern.push(newArray);
  }
  if (!skipCursorGraph) {
    cursorGraphPattern = getCursorGraphPatternFromCollection(cursorGraphPatternCollection);
  }
  return {
    mainGraphPattern: mainGraphPattern,
    cursorGraphPattern: cursorGraphPattern,
  };
}

function initializeArray() {
  for (let rowNumber = 0; rowNumber < mainGraphRowCount; rowNumber++) {
    mainGraphRowPoints.push(rowNumber);
    mainGraphDataPoints.push(new Array(mainGraphColumnCount).fill(null));
  }
  for (let columnNumber = 0; columnNumber < mainGraphColumnCount; columnNumber++) {
    mainGraphColumnPoints.push(columnNumber);
  }

  for (let rowNumber = 0; rowNumber < cursorGraphRowRange; rowNumber++) {
    cursorGraphRowPoints.push(rowNumber);
    cursorGraphDataPoints.push(new Array(cursorGraphColumnRange).fill(null));
  }
  for (let columnNumber = 0; columnNumber < cursorGraphColumnRange; columnNumber++) {
    cursorGraphColumnPoints.push(columnNumber);
  }
}

initializeArray();
initiateGraphSimulation();
