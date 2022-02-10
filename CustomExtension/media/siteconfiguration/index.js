const vscode = acquireVsCodeApi();

var siteTableData = [];
var activeServers = [];

var deleteSiteButtonElement = document.getElementById("deleteSite");
var addSiteButtonElement = document.getElementById("addSite");

function renderTable() {
  let tableContainer = document.getElementById("siteTableContainer");
  tableContainer.innerHTML = `<table id="table"></table>`;
  let tableElement = document.getElementById("table");

  tableElement.innerHTML = `
    <tr class = "table-header">
        <td class="site-column">
          Site Number
        </td>
        <td class="server-name" id="server-column">
          Server Number
        </td>
    </tr>`;
  siteTableData.forEach((site) => {
    tableElement.innerHTML += `<tr>
        <td class="site-column">
          ${site.siteNumber}
        </td>
        <td class="server-name">
          <select class="server-list" id="${site.siteNumber}" onchange="updateServerNumber(this)">
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

function updateSiteData(siteData, activeServers) {
  siteTableData = siteData;
  this.activeServers = activeServers;
  renderTable();
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
      command: 'deleteSite'
    })
  });

  addSiteButtonElement.addEventListener("click", function () {
    vscode.postMessage({
      command: 'addSite'
    })
  });
};

window.addEventListener('message', event => {
  console.log("Test");
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