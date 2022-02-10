const vscode = acquireVsCodeApi();

var siteTableData = [];
var activeServers = [];

var deleteSiteButtonElement = document.getElementById("deleteSite");
var addSiteButtonElement = document.getElementById("addSite");
var selectedSiteNumber = -1;

function renderTable() {
  let tableContainer = document.getElementById("siteTableContainer");
  tableContainer.innerHTML = `<table id="table"></table>`;
  let tableElement = document.getElementById("table");

  tableElement.innerHTML = `
    <tr class = "table-head">
        <td class="site-column">
          Site Number
        </td>
        <td class="server-name" id="server-column">
          Server Number
        </td>
    </tr>`;
  siteTableData.forEach((site) => {
    tableElement.innerHTML += `<tr onclick="triggerSelection(this)" id="siterow_${site.siteNumber}" class="${isRowActive(site.siteNumber)}">
        <td class="site-column">
          ${site.siteNumber}
        </td>
        <td class="server-name">
          <select class="server-list" id="${site.siteNumber}" onchange="updateServerNumber(this)" onclick="event.stopPropagation()">
          </select>
        </td>
      </tr>`
  })

  document.querySelectorAll(".server-list").forEach(selectObj => {
    activeServers.forEach(server => {
      var option = document.createElement("option");
      option.value = server;
      option.text = server;
      siteTableData.forEach(siteData => {
        if (siteData.siteNumber === selectObj.id && siteData.serverName === server) {
          option.selected = true;
        }
      })
      selectObj.appendChild(option);
    })
  })
}

function isRowActive(siteNumber) {
  return siteNumber === selectedSiteNumber ? 'active' : 'inactive';
}

function updateSiteData(siteData, activeServers) {
  siteTableData = siteData;
  this.activeServers = activeServers;
  renderTable();
}

function triggerSelection(selectedRow) {
  var selectedRow = document.getElementById(selectedRow.id);
  if (selectedRow != null && selectedRow.firstElementChild != null && selectedRow.firstElementChild.innerText != null) {
    this.selectedSiteNumber = selectedRow.firstElementChild.innerText.trim();
    renderTable();
  }
}

function updateServerNumber(selectObj) {
  vscode.postMessage({
    command: 'updateChangedServer', value: {
      siteNumber: selectObj.id,
      serverName: selectObj.value
    }
  })
}

function subsribeToButton() {
  deleteSiteButtonElement.addEventListener("click", function () {
    vscode.postMessage({
      command: 'deleteSite',
      value: selectedSiteNumber
    })
    selectedSiteNumber = -1;
  });

  addSiteButtonElement.addEventListener("click", function () {
    vscode.postMessage({
      command: 'addSite'
    })
  });
};

window.addEventListener('message', event => {
  switch (event.data.command) {
    case 'updateSiteData':
      updateSiteData(event.data.siteData, event.data.activeServers);
      break;
  }
});

subsribeToButton();

vscode.postMessage({
  command: 'syncSiteData'
})