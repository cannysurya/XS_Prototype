const vscode = acquireVsCodeApi();
console.log("Datalog index file is loaded");

window.addEventListener('message', event => {
  switch (event.data.command) {
    case 'updateDatalogData':
      console.log(event.data.datalogData);
      break;
  }
});