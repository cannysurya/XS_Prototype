const vscode = acquireVsCodeApi();

var executeButtonElement = document.getElementById("executeButton");
var resumeExecuteButtonElement = document.getElementById("resumeExecutionButton");
var stopExecuteButtonElement = document.getElementById("stopExecutionButton");
var rebuildButton = document.getElementById("rebuildButton");

var tfeData = {
  IsExectionInProgress: false,
  TestFlowName: "Main Test Flow",
  FlowNodes: []
}

function handleBreakPoint(e) {
  vscode.postMessage({
    command: 'handleBreakPoint',
    flowNodeIndex: parseInt(e.id.split("-")[2])
  })
  renderTable();
}

function renderTable() {
  let tableContainer = document.getElementById("tableContainer");
  tableComponent.innerHTML = `<table id="table"></table>`;
  let tableElement = document.getElementById("table");

  tableElement.innerHTML = `
  <tr>
    <td class="breakpoint-column">
    </td>
    <td class="node-name testflow-name" id="main-program">
      ${tfeData.TestFlowName}
    </td>
  </tr>`;
  tfeData.FlowNodes.forEach((flowNode, index) => {
    tableElement.innerHTML += `<tr>
      <td class="breakpoint-column ${flowNode.HitBreakPoint ? 'node-name-active' : ''}">
        <button id="breakpoint-button-${index}" 
          class="breakpoint-button ${flowNode.HasBreakPoint ? 'breakpoint-button-active' : ''}" 
          onclick="handleBreakPoint(this)"></button>
      </td>
      <td class="node-name testmethod-name ${flowNode.HitBreakPoint ? 'node-name-active' : ''}">
        ${flowNode.Name}
      </td>
    </tr>`
  })
}

function refreshButtonView() {
  if (tfeData.IsExectionInProgress) {
    executeButtonElement.classList.add("hide");
    rebuildButton.classList.add("hide");
    stopExecuteButtonElement.classList.remove("hide");
  } else {
    executeButtonElement.classList.remove("hide");
    rebuildButton.classList.remove("hide");
    stopExecuteButtonElement.classList.add("hide");
  }

  var includesHitBreakPointFunction = (flowNode) => flowNode.HitBreakPoint;

  if (tfeData.IsExectionInProgress && tfeData.FlowNodes.some(includesHitBreakPointFunction)) {
    resumeExecuteButtonElement.classList.remove("hide");
  } else {
    resumeExecuteButtonElement.classList.add("hide");
  }
}

function updateTFEData(newTFEData) {
  tfeData = newTFEData;
  refreshButtonView();
  renderTable();
}

function subsribeToButton() {

  executeButtonElement.addEventListener("click", function () {
    vscode.postMessage({
      command: 'executeTestMethod'
    })
    refreshButtonView();
  });

  rebuildButton.addEventListener("click", function () {
    vscode.postMessage({
      command: 'rebuildProject'
    })
    refreshButtonView();
  });

  resumeExecuteButtonElement.addEventListener("click", function () {
    vscode.postMessage({
      command: 'resumeExecution'
    })
    refreshButtonView();
  });

  stopExecuteButtonElement.addEventListener("click", function () {
    vscode.postMessage({
      command: 'stopExecution'
    })
    refreshButtonView();
  });
};

window.addEventListener('message', event => {
  switch (event.data.command) {
    case 'updateTFEData':
      updateTFEData(event.data.tfeData);
      break;
  }
});

subsribeToButton();

vscode.postMessage({
  command: 'syncTFEData'
})