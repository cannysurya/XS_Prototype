const vscode = acquireVsCodeApi();
console.log("SiteConfigs is loaded");


vscode.postMessage({
    command: 'syncSiteData'
})

var siteConfig = {
    siteNumber: 0,
    serverNumber: 0
};
var siteTableData = [];

var deleteSiteButtonElement = document.getElementById("deleteSite");
var addSiteButtonElement = document.getElementById("addSite");

function renderTable() {
let tableContainer = document.getElementById("asc");
siteTable.innerHTML = `<table id="table"></table>`;
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
siteTableData.forEach((site, index) => {
    tableElement.innerHTML += `<tr>
    <td class="site-column">
        Site ${index+1}
    </td>
    <td class="server-name">
        <select class="server-list" id="server-list-${index}" onchange="updateServerNumber(this)">
        <option value=1 ${(site.serverNumber == "1")? 'selected' : ''}>Server-1</option>
        <option value=2 ${(site.serverNumber == "2")? 'selected' : ''}>Server-2</option>
        </select>
    </td>
    </tr>`
})
}

function updateSiteData(siteData) {
    siteTableData = siteData;
    renderTable();
}

function updateServerNumber(changedServer) {
    var serverData = {};
    serverData.selectedId = parseInt((changedServer.id.split("-"))[2]);
    serverData.selectedServer = changedServer.value;
    vscode.postMessage({
        command: 'updateChangedServer', value: serverData
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
    switch (event.data.command) {
      case 'updateSiteData':
        updateSiteData(event.data.siteData);
        break;
    }
});

subsribeToButton();