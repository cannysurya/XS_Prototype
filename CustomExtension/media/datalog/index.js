const vscode = acquireVsCodeApi();

let recordsInputElement = document.getElementById("recordsInput");
let currentPageInputElement = document.getElementById("currentPageInput");
let maxPageNumberElement = document.getElementById("maxPageNumber");

recordsInputElement.addEventListener('change', updateRecords);
currentPageInputElement.addEventListener('change', updateCurrentPageNumber);

function updateRecords(e) {
  updateMaxPageNumber()
  updateConfig(parseInt(e.target.value), parseInt(currentPageInputElement.value));
}

function updateCurrentPageNumber(e) {
  updateConfig(parseInt(recordsInputElement.value), parseInt(e.target.value));
}

function updateConfig(recordsPerPage, currentPageNumber) {
  let newConfigData = {
    recordsPerPage: recordsPerPage,
    currentPageNumber: currentPageNumber
  }
  vscode.postMessage({
    command: 'updateDatalogConfig', newConfigData: newConfigData
  });
}

function updateTableData(tableData) {
  let table = document.getElementById("table2");
  table.innerHTML = ``;
  table.innerHTML = `<tr class="table-head">
        <td>Server Name</td>
        <td>Site Number</td>
        <td>Measured Value</td>
        <td>Test Method Name</td>
    </tr>`;
  tableData.forEach(data => {
    var x = table.insertRow(1);
    var a = x.insertCell(0);
    var b = x.insertCell(1);
    var c = x.insertCell(2);
    var d = x.insertCell(3);
    a.innerHTML = `${data[3].Value}`;
    b.innerHTML = `${data[0].Value}`;
    c.innerHTML = `${data[1].Value}`;
    d.innerHTML = `${data[2].Value}`;
  });
}

function updateDatalogConfig(data) {
  recordsInputElement.value = data.recordsPerPage;
  currentPageInputElement.value = data.currentPageNumber;
  if (!isNaN(data.maxPageNumber)) {
    maxPageNumberElement.innerHTML = `${Math.max(data.maxPageNumber, 1)}`;
  }
}

function updateMaxPageNumber(maxPageNumber) {
  if (!isNaN(maxPageNumber)) {
    maxPageNumberElement.innerHTML = `${Math.max(maxPageNumber, 1)}`;
  }
}

window.addEventListener('message', event => {
  switch (event.data.command) {
    case 'updateDatalogData':
      updateTableData(event.data.datalogData);
      break;
    case 'updateDatalogConfig':
      updateDatalogConfig(event.data.datalogConfig);
      break;
    case 'updateMaxPageNumber':
      updateMaxPageNumber(event.data.maxPageNumber);
      break;
  }
});

vscode.postMessage({
  command: 'syncDatalogConfigData'
});