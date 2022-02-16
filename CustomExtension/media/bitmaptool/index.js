var mainGraphRowCount = 2160;
var mainGraphColumnCount = 3840;

var mainGraphRowPoints = [];
var mainGraphColumnPoints = [];
var mainGraphDataPoints = [];

var cursorGraphRowSamples = 100;
var cursorGraphColumnSamples = 2;
var cursorGraphRowScale = 500;
var cursorGraphColumnScale = 500;
var cursorGraphRowRange = Math.ceil(mainGraphRowCount / cursorGraphRowScale) * cursorGraphRowSamples;
var cursorGraphColumnRange = Math.ceil(mainGraphColumnCount / cursorGraphColumnScale) * cursorGraphColumnSamples;

var cursorGraphRowReference = 0;
var cursorGraphColumnReference = 0;

var cursorGraphRowPoints = [];
var cursorGraphColumnPoints = [];
var cursorGraphDataPoints = [];

var skipCursorGraph = false;

var renderTimeout = 10;

function updateCursorGraphData(cursorGraphData) {
  var cursorGraphDataLength = cursorGraphData.length;
  var rowReferenceOfSample = Math.ceil(mainGraphRowCount / cursorGraphRowScale);
  var columnReferenceOfSample = Math.ceil(mainGraphColumnCount / cursorGraphColumnScale);
  for (let rowNumber = 0; rowNumber < cursorGraphDataLength; rowNumber++) {
    var cursorGraphDataRowLength = cursorGraphData[rowNumber].length;
    for (let columnNumber = 0; columnNumber < cursorGraphDataRowLength; columnNumber++) {
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
  switch (Math.floor(Math.random() * 10) % 6) {
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
    case 4:
      pattern = getHalfRowPassPattern();
      break;
    case 5:
      pattern = getHalfColumnPassPattern();
      break;
  }

  stopSimulation = updateCursorGraphData(pattern.cursorGraphPattern);

  updateMainGraphData(pattern.mainGraphPattern);
  plotGraphs();
  if (!stopSimulation) {
    setTimeout(initiateGraphSimulation, renderTimeout);
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

function scaleCursorGraphData(mainGraphPattern, cursorGraphPattern, startRowNumber, startColumnNumber, endRowNumber, endColumnNumber) {
  var collectionRowNumber = Math.floor([endRowNumber / cursorGraphRowScale]);
  var collectionColumnNumber = Math.floor([endColumnNumber / cursorGraphColumnScale]);
  let count = 0;
  let sum = 0;

  for (let rowNumber = startRowNumber; rowNumber <= endRowNumber; rowNumber++) {
    for (let columnNumber = startColumnNumber; columnNumber <= endColumnNumber; columnNumber++) {
      count++;
      sum += mainGraphPattern[rowNumber][columnNumber];
    }
  }

  if (cursorGraphPattern[collectionRowNumber] === undefined) {
    cursorGraphPattern[collectionRowNumber] = [];
  }

  cursorGraphPattern[collectionRowNumber][collectionColumnNumber] = sum >= count * 0.5 ? 1 : 0;
}

function getCheckerPattern() {
  var mainGraphPattern = [];
  var cursorGraphPattern = [];

  var counter = 1;
  var initialcounter = 1;

  for (let rowNumber = 0; rowNumber < mainGraphRowCount; rowNumber++) {
    var newArray = [];
    counter = initialcounter;
    for (let columnNumber = 0; columnNumber < mainGraphColumnCount; columnNumber++) {
      var data = counter++;
      newArray.push(data);
      counter %= 2;
    }
    initialcounter++;
    initialcounter %= 2;
    mainGraphPattern.push(newArray);
  }

  if (!skipCursorGraph) {
    let processedEndRowNumber = 0;
    let processedEndColumnNumber = 0;
    for (let rowNumber = 0; rowNumber < mainGraphRowCount; rowNumber++) {
      for (let columnNumber = 0; columnNumber < mainGraphColumnCount; columnNumber++) {
        if (rowNumber != 0 && columnNumber != 0 && (rowNumber + 1) % cursorGraphRowScale == 0 && (columnNumber + 1) % cursorGraphColumnScale == 0) {
          scaleCursorGraphData(mainGraphPattern, cursorGraphPattern, rowNumber - (cursorGraphRowScale - 1), columnNumber - (cursorGraphColumnScale - 1), rowNumber, columnNumber);
          processedEndRowNumber = rowNumber;
          processedEndColumnNumber = columnNumber;
        }
      }
    }

    if (processedEndRowNumber < mainGraphRowCount - 1) {
      for (let columnNumber = 0; columnNumber < mainGraphColumnCount; columnNumber++) {
        if ((columnNumber + 1) % cursorGraphColumnScale == 0) {
          scaleCursorGraphData(mainGraphPattern, cursorGraphPattern, processedEndRowNumber + 1, columnNumber - (cursorGraphColumnScale - 1), mainGraphRowCount - 1, columnNumber);
        }
      }
    }

    if (processedEndColumnNumber < mainGraphColumnCount - 1) {
      for (let rowNumber = 0; rowNumber < mainGraphRowCount; rowNumber++) {
        if ((rowNumber + 1) % cursorGraphRowScale == 0) {
          scaleCursorGraphData(mainGraphPattern, cursorGraphPattern, rowNumber - (cursorGraphRowScale - 1), processedEndColumnNumber + 1, rowNumber, mainGraphColumnCount - 1);
        }
      }
    }

    if (processedEndRowNumber < mainGraphRowCount - 1 && processedEndColumnNumber < mainGraphColumnCount - 1) {
      scaleCursorGraphData(mainGraphPattern, cursorGraphPattern, processedEndRowNumber + 1, processedEndColumnNumber + 1, mainGraphRowCount - 1, mainGraphColumnCount - 1);
    }
  }
  return {
    mainGraphPattern: mainGraphPattern,
    cursorGraphPattern: cursorGraphPattern,
  };
}

function getRandomPattern() {
  var mainGraphPattern = [];
  var cursorGraphPattern = [];

  for (let rowNumber = 0; rowNumber < mainGraphRowCount; rowNumber++) {
    var newArray = [];
    for (let columnNumber = 0; columnNumber < mainGraphColumnCount; columnNumber++) {
      var data = Math.round(Math.random() * 10) % 2;
      newArray.push(data);
    }
    mainGraphPattern.push(newArray);
  }

  if (!skipCursorGraph) {
    let processedEndRowNumber = 0;
    let processedEndColumnNumber = 0;
    for (let rowNumber = 0; rowNumber < mainGraphRowCount; rowNumber++) {
      for (let columnNumber = 0; columnNumber < mainGraphColumnCount; columnNumber++) {
        if (rowNumber != 0 && columnNumber != 0 && (rowNumber + 1) % cursorGraphRowScale == 0 && (columnNumber + 1) % cursorGraphColumnScale == 0) {
          scaleCursorGraphData(mainGraphPattern, cursorGraphPattern, rowNumber - (cursorGraphRowScale - 1), columnNumber - (cursorGraphColumnScale - 1), rowNumber, columnNumber);
          processedEndRowNumber = rowNumber;
          processedEndColumnNumber = columnNumber;
        }
      }
    }

    if (processedEndRowNumber < mainGraphRowCount - 1) {
      for (let columnNumber = 0; columnNumber < mainGraphColumnCount; columnNumber++) {
        if ((columnNumber + 1) % cursorGraphColumnScale == 0) {
          scaleCursorGraphData(mainGraphPattern, cursorGraphPattern, processedEndRowNumber + 1, columnNumber - (cursorGraphColumnScale - 1), mainGraphRowCount - 1, columnNumber);
        }
      }
    }

    if (processedEndColumnNumber < mainGraphColumnCount - 1) {
      for (let rowNumber = 0; rowNumber < mainGraphRowCount; rowNumber++) {
        if ((rowNumber + 1) % cursorGraphRowScale == 0) {
          scaleCursorGraphData(mainGraphPattern, cursorGraphPattern, rowNumber - (cursorGraphRowScale - 1), processedEndColumnNumber + 1, rowNumber, mainGraphColumnCount - 1);
        }
      }
    }

    if (processedEndRowNumber < mainGraphRowCount - 1 && processedEndColumnNumber < mainGraphColumnCount - 1) {
      scaleCursorGraphData(mainGraphPattern, cursorGraphPattern, processedEndRowNumber + 1, processedEndColumnNumber + 1, mainGraphRowCount - 1, mainGraphColumnCount - 1);
    }
  }
  return {
    mainGraphPattern: mainGraphPattern,
    cursorGraphPattern: cursorGraphPattern,
  };
}

function getDominantPassPattern() {
  var mainGraphPattern = [];
  var cursorGraphPattern = [];

  for (let rowNumber = 0; rowNumber < mainGraphRowCount; rowNumber++) {
    var newArray = [];
    for (let columnNumber = 0; columnNumber < mainGraphColumnCount; columnNumber++) {
      var data = Math.round(Math.random() * 10) < 8 ? 1 : 0;
      newArray.push(data);
    }
    mainGraphPattern.push(newArray);
  }

  if (!skipCursorGraph) {
    let processedEndRowNumber = 0;
    let processedEndColumnNumber = 0;
    for (let rowNumber = 0; rowNumber < mainGraphRowCount; rowNumber++) {
      for (let columnNumber = 0; columnNumber < mainGraphColumnCount; columnNumber++) {
        if (rowNumber != 0 && columnNumber != 0 && (rowNumber + 1) % cursorGraphRowScale == 0 && (columnNumber + 1) % cursorGraphColumnScale == 0) {
          scaleCursorGraphData(mainGraphPattern, cursorGraphPattern, rowNumber - (cursorGraphRowScale - 1), columnNumber - (cursorGraphColumnScale - 1), rowNumber, columnNumber);
          processedEndRowNumber = rowNumber;
          processedEndColumnNumber = columnNumber;
        }
      }
    }

    if (processedEndRowNumber < mainGraphRowCount - 1) {
      for (let columnNumber = 0; columnNumber < mainGraphColumnCount; columnNumber++) {
        if ((columnNumber + 1) % cursorGraphColumnScale == 0) {
          scaleCursorGraphData(mainGraphPattern, cursorGraphPattern, processedEndRowNumber + 1, columnNumber - (cursorGraphColumnScale - 1), mainGraphRowCount - 1, columnNumber);
        }
      }
    }

    if (processedEndColumnNumber < mainGraphColumnCount - 1) {
      for (let rowNumber = 0; rowNumber < mainGraphRowCount; rowNumber++) {
        if ((rowNumber + 1) % cursorGraphRowScale == 0) {
          scaleCursorGraphData(mainGraphPattern, cursorGraphPattern, rowNumber - (cursorGraphRowScale - 1), processedEndColumnNumber + 1, rowNumber, mainGraphColumnCount - 1);
        }
      }
    }

    if (processedEndRowNumber < mainGraphRowCount - 1 && processedEndColumnNumber < mainGraphColumnCount - 1) {
      scaleCursorGraphData(mainGraphPattern, cursorGraphPattern, processedEndRowNumber + 1, processedEndColumnNumber + 1, mainGraphRowCount - 1, mainGraphColumnCount - 1);
    }
  }
  return {
    mainGraphPattern: mainGraphPattern,
    cursorGraphPattern: cursorGraphPattern,
  };
}

function getDominantFailPattern() {
  var mainGraphPattern = [];
  var cursorGraphPattern = [];

  for (let rowNumber = 0; rowNumber < mainGraphRowCount; rowNumber++) {
    var newArray = [];
    for (let columnNumber = 0; columnNumber < mainGraphColumnCount; columnNumber++) {
      var data = Math.round(Math.random() * 10) < 8 ? 0 : 1;
      newArray.push(data);
    }
    mainGraphPattern.push(newArray);
  }

  if (!skipCursorGraph) {
    let processedEndRowNumber = 0;
    let processedEndColumnNumber = 0;
    for (let rowNumber = 0; rowNumber < mainGraphRowCount; rowNumber++) {
      for (let columnNumber = 0; columnNumber < mainGraphColumnCount; columnNumber++) {
        if (rowNumber != 0 && columnNumber != 0 && (rowNumber + 1) % cursorGraphRowScale == 0 && (columnNumber + 1) % cursorGraphColumnScale == 0) {
          scaleCursorGraphData(mainGraphPattern, cursorGraphPattern, rowNumber - (cursorGraphRowScale - 1), columnNumber - (cursorGraphColumnScale - 1), rowNumber, columnNumber);
          processedEndRowNumber = rowNumber;
          processedEndColumnNumber = columnNumber;
        }
      }
    }

    if (processedEndRowNumber < mainGraphRowCount - 1) {
      for (let columnNumber = 0; columnNumber < mainGraphColumnCount; columnNumber++) {
        if ((columnNumber + 1) % cursorGraphColumnScale == 0) {
          scaleCursorGraphData(mainGraphPattern, cursorGraphPattern, processedEndRowNumber + 1, columnNumber - (cursorGraphColumnScale - 1), mainGraphRowCount - 1, columnNumber);
        }
      }
    }

    if (processedEndColumnNumber < mainGraphColumnCount - 1) {
      for (let rowNumber = 0; rowNumber < mainGraphRowCount; rowNumber++) {
        if ((rowNumber + 1) % cursorGraphRowScale == 0) {
          scaleCursorGraphData(mainGraphPattern, cursorGraphPattern, rowNumber - (cursorGraphRowScale - 1), processedEndColumnNumber + 1, rowNumber, mainGraphColumnCount - 1);
        }
      }
    }

    if (processedEndRowNumber < mainGraphRowCount - 1 && processedEndColumnNumber < mainGraphColumnCount - 1) {
      scaleCursorGraphData(mainGraphPattern, cursorGraphPattern, processedEndRowNumber + 1, processedEndColumnNumber + 1, mainGraphRowCount - 1, mainGraphColumnCount - 1);
    }
  }
  return {
    mainGraphPattern: mainGraphPattern,
    cursorGraphPattern: cursorGraphPattern,
  };
}

function getHalfRowPassPattern() {
  var mainGraphPattern = [];
  var cursorGraphPattern = [];

  for (let rowNumber = 0; rowNumber < mainGraphRowCount; rowNumber++) {
    var newArray = [];
    for (let columnNumber = 0; columnNumber < mainGraphColumnCount; columnNumber++) {
      var data = rowNumber > mainGraphRowCount / 2 ? 1 : 0;
      newArray.push(data);
    }
    mainGraphPattern.push(newArray);
  }

  if (!skipCursorGraph) {
    let processedEndRowNumber = 0;
    let processedEndColumnNumber = 0;
    for (let rowNumber = 0; rowNumber < mainGraphRowCount; rowNumber++) {
      for (let columnNumber = 0; columnNumber < mainGraphColumnCount; columnNumber++) {
        if (rowNumber != 0 && columnNumber != 0 && (rowNumber + 1) % cursorGraphRowScale == 0 && (columnNumber + 1) % cursorGraphColumnScale == 0) {
          scaleCursorGraphData(mainGraphPattern, cursorGraphPattern, rowNumber - (cursorGraphRowScale - 1), columnNumber - (cursorGraphColumnScale - 1), rowNumber, columnNumber);
          processedEndRowNumber = rowNumber;
          processedEndColumnNumber = columnNumber;
        }
      }
    }

    if (processedEndRowNumber < mainGraphRowCount - 1) {
      for (let columnNumber = 0; columnNumber < mainGraphColumnCount; columnNumber++) {
        if ((columnNumber + 1) % cursorGraphColumnScale == 0) {
          scaleCursorGraphData(mainGraphPattern, cursorGraphPattern, processedEndRowNumber + 1, columnNumber - (cursorGraphColumnScale - 1), mainGraphRowCount - 1, columnNumber);
        }
      }
    }

    if (processedEndColumnNumber < mainGraphColumnCount - 1) {
      for (let rowNumber = 0; rowNumber < mainGraphRowCount; rowNumber++) {
        if ((rowNumber + 1) % cursorGraphRowScale == 0) {
          scaleCursorGraphData(mainGraphPattern, cursorGraphPattern, rowNumber - (cursorGraphRowScale - 1), processedEndColumnNumber + 1, rowNumber, mainGraphColumnCount - 1);
        }
      }
    }

    if (processedEndRowNumber < mainGraphRowCount - 1 && processedEndColumnNumber < mainGraphColumnCount - 1) {
      scaleCursorGraphData(mainGraphPattern, cursorGraphPattern, processedEndRowNumber + 1, processedEndColumnNumber + 1, mainGraphRowCount - 1, mainGraphColumnCount - 1);
    }
  }
  return {
    mainGraphPattern: mainGraphPattern,
    cursorGraphPattern: cursorGraphPattern,
  };
}

function getHalfColumnPassPattern() {
  var mainGraphPattern = [];
  var cursorGraphPattern = [];

  for (let rowNumber = 0; rowNumber < mainGraphRowCount; rowNumber++) {
    var newArray = [];
    for (let columnNumber = 0; columnNumber < mainGraphColumnCount; columnNumber++) {
      var data = columnNumber > mainGraphColumnCount / 2 ? 1 : 0;
      newArray.push(data);
    }
    mainGraphPattern.push(newArray);
  }

  if (!skipCursorGraph) {
    let processedEndRowNumber = 0;
    let processedEndColumnNumber = 0;
    for (let rowNumber = 0; rowNumber < mainGraphRowCount; rowNumber++) {
      for (let columnNumber = 0; columnNumber < mainGraphColumnCount; columnNumber++) {
        if (rowNumber != 0 && columnNumber != 0 && (rowNumber + 1) % cursorGraphRowScale == 0 && (columnNumber + 1) % cursorGraphColumnScale == 0) {
          scaleCursorGraphData(mainGraphPattern, cursorGraphPattern, rowNumber - (cursorGraphRowScale - 1), columnNumber - (cursorGraphColumnScale - 1), rowNumber, columnNumber);
          processedEndRowNumber = rowNumber;
          processedEndColumnNumber = columnNumber;
        }
      }
    }

    if (processedEndRowNumber < mainGraphRowCount - 1) {
      for (let columnNumber = 0; columnNumber < mainGraphColumnCount; columnNumber++) {
        if ((columnNumber + 1) % cursorGraphColumnScale == 0) {
          scaleCursorGraphData(mainGraphPattern, cursorGraphPattern, processedEndRowNumber + 1, columnNumber - (cursorGraphColumnScale - 1), mainGraphRowCount - 1, columnNumber);
        }
      }
    }

    if (processedEndColumnNumber < mainGraphColumnCount - 1) {
      for (let rowNumber = 0; rowNumber < mainGraphRowCount; rowNumber++) {
        if ((rowNumber + 1) % cursorGraphRowScale == 0) {
          scaleCursorGraphData(mainGraphPattern, cursorGraphPattern, rowNumber - (cursorGraphRowScale - 1), processedEndColumnNumber + 1, rowNumber, mainGraphColumnCount - 1);
        }
      }
    }

    if (processedEndRowNumber < mainGraphRowCount - 1 && processedEndColumnNumber < mainGraphColumnCount - 1) {
      scaleCursorGraphData(mainGraphPattern, cursorGraphPattern, processedEndRowNumber + 1, processedEndColumnNumber + 1, mainGraphRowCount - 1, mainGraphColumnCount - 1);
    }
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
