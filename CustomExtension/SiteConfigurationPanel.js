"use strict";

const vscode = require("vscode");
const { getServers } = require("./GlobalState");

var selfWebView = undefined;

var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };

var __generator =
  (this && this.__generator) ||
  function (thisArg, body) {
    var _ = {
        label: 0,
        sent: function () {
          if (t[0] & 1) throw t[1];
          return t[1];
        },
        trys: [],
        ops: [],
      },
      f,
      y,
      t,
      g;
    return (
      (g = { next: verb(0), throw: verb(1), return: verb(2) }),
      typeof Symbol === "function" &&
        (g[Symbol.iterator] = function () {
          return this;
        }),
      g
    );
    function verb(n) {
      return function (v) {
        return step([n, v]);
      };
    }
    function step(op) {
      if (f) throw new TypeError("Generator is already executing.");
      while (_)
        try {
          if (
            ((f = 1),
            y &&
              (t =
                op[0] & 2
                  ? y["return"]
                  : op[0]
                  ? y["throw"] || ((t = y["return"]) && t.call(y), 0)
                  : y.next) &&
              !(t = t.call(y, op[1])).done)
          )
            return t;
          if (((y = 0), t)) op = [op[0] & 2, t.value];
          switch (op[0]) {
            case 0:
            case 1:
              t = op;
              break;
            case 4:
              _.label++;
              return { value: op[1], done: false };
            case 5:
              _.label++;
              y = op[1];
              op = [0];
              continue;
            case 7:
              op = _.ops.pop();
              _.trys.pop();
              continue;
            default:
              if (
                !((t = _.trys), (t = t.length > 0 && t[t.length - 1])) &&
                (op[0] === 6 || op[0] === 2)
              ) {
                _ = 0;
                continue;
              }
              if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) {
                _.label = op[1];
                break;
              }
              if (op[0] === 6 && _.label < t[1]) {
                _.label = t[1];
                t = op;
                break;
              }
              if (t && _.label < t[2]) {
                _.label = t[2];
                _.ops.push(op);
                break;
              }
              if (t[2]) _.ops.pop();
              _.trys.pop();
              continue;
          }
          op = body.call(thisArg, _);
        } catch (e) {
          op = [6, e];
          y = 0;
        } finally {
          f = t = 0;
        }
      if (op[0] & 5) throw op[1];
      return { value: op[0] ? op[1] : void 0, done: true };
    }
  };

Object.defineProperty(exports, "__esModule", { value: true });
exports.SiteConfigurationPanel = void 0;

var SiteConfigurationPanel = /** @class */ (function () {
  function SiteConfigurationPanel(panel, extensionUri) {
    var _this = this;
    this._disposables = [];
    this._panel = panel;
    this._extensionUri = extensionUri;
    this._update();
    this._panel.onDidDispose(
      function () {
        return _this.dispose();
      },
      null,
      this._disposables
    );
  }

  SiteConfigurationPanel.createOrShow = function (extensionUri) {
    var column = vscode.window.activeTextEditor
      ? vscode.window.activeTextEditor.viewColumn
      : undefined;
    // If we already have a panel, show it.
    if (SiteConfigurationPanel.currentPanel) {
      SiteConfigurationPanel.currentPanel._panel.reveal(column);
      SiteConfigurationPanel.currentPanel._update();
      return;
    }

    // Otherwise, create a new panel.
    var panel = vscode.window.createWebviewPanel(
      SiteConfigurationPanel.viewType,
      "Site Configuration Panel",
      column || vscode.ViewColumn.One,
      {
        // Enable javascript in the webview
        enableScripts: true,
        // And restrict the webview to only loading content from our extension's `media` directory.
        localResourceRoots: [
          vscode.Uri.joinPath(extensionUri, "media"),
          vscode.Uri.joinPath(extensionUri, "out/compiled"),
        ],
      }
    );
    SiteConfigurationPanel.currentPanel = new SiteConfigurationPanel(
      panel,
      extensionUri
    );
  };

  SiteConfigurationPanel.kill = function () {
    var _a;
    (_a = SiteConfigurationPanel.currentPanel) === null || _a === void 0
      ? void 0
      : _a.dispose();
    SiteConfigurationPanel.currentPanel = undefined;
  };

  SiteConfigurationPanel.revive = function (panel, extensionUri) {
    SiteConfigurationPanel.currentPanel = new SiteConfigurationPanel(
      panel,
      extensionUri
    );
  };

  SiteConfigurationPanel.prototype.dispose = function () {
    SiteConfigurationPanel.currentPanel = undefined;
    // Clean up our resources
    this._panel.dispose();
    while (this._disposables.length) {
      var x = this._disposables.pop();
      if (x) {
        x.dispose();
      }
    }
  };

  SiteConfigurationPanel.prototype._update = function () {
    return __awaiter(this, void 0, void 0, function () {
      var webview;
      var _this = this;
      return __generator(this, function (_a) {
        webview = this._panel.webview;
        selfWebView = webview;
        this._panel.webview.html = this._getHtmlForWebview(webview);
        webview.onDidReceiveMessage(function (data) {
          return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
              switch (data.command) {
                case "syncSiteData": {
                  selfWebView.postMessage({
                    command: "updateSiteData",
                    siteData: getSiteData(),
                    activeServers: getActiveServers(),
                  });
                  break;
                }
                case "addSite": {
                  addSite();
                  break;
                }
                case "deleteSite": {
                  deleteSite(data.value);
                  break;
                }
                case "updateChangedServer": {
                  updateChangedServer(data.value);
                }
              }
              return [2 /*return*/];
            });
          });
        });
        return [2 /*return*/];
      });
    });
  };

  SiteConfigurationPanel.prototype._getHtmlForWebview = function (webview) {
    const scriptUri = webview.asWebviewUri(
      vscode.Uri.joinPath(
        this._extensionUri,
        "media",
        "siteconfiguration",
        "index.js"
      )
    );
    const resetUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "reset.css")
    );
    const vscodeUri = webview.asWebviewUri(
      vscode.Uri.joinPath(this._extensionUri, "media", "vscode.css")
    );
    const styleUri = webview.asWebviewUri(
      vscode.Uri.joinPath(
        this._extensionUri,
        "media",
        "siteconfiguration",
        "index.css"
      )
    );
    return `
            <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <link href="${resetUri}" rel="stylesheet">
                    <link href="${vscodeUri}" rel="stylesheet">
                    <link href="${styleUri}" rel="stylesheet">
                </head>
                <body>
									<div class="function-buttons">
										<button class="button-1" id="addSite">Add</button>
										<button class="button-1" id="deleteSite">Delete</button>
									</div>
									<div id="siteTableContainer">
									</div>
                </body>
                <script src="${scriptUri}"></script>
                </html>
        `;
  };

  SiteConfigurationPanel.viewType = "SiteConfigurationPanel";
  return SiteConfigurationPanel;
})();

function addSite() {
  var servers = getServers().filter((x) => x.isActive);
  var totalSites = [];
  servers.forEach((server) => {
    totalSites.push(...server.sites);
  });

  servers[0].sites.push(`Site ${totalSites.length + 1}`);

  selfWebView.postMessage({
    command: "updateSiteData",
    siteData: getSiteData(),
    activeServers: getActiveServers(),
  });
  updateSiteInfo();
}

function deleteSite(siteToBeDeleted) {
  var servers = getServers().filter((x) => x.isActive);
  servers.forEach((server) => {
    if (server.sites.indexOf(siteToBeDeleted) != -1) {
      server.sites.splice(server.sites.indexOf(siteToBeDeleted), 1);
    }
  });
  selfWebView.postMessage({
    command: "updateSiteData",
    siteData: getSiteData(),
    activeServers: getActiveServers(),
  });
  updateSiteInfo();
}

function updateChangedServer(value) {
  getServers()
    .filter((x) => x.isActive)
    .forEach((server) => {
      if (
        server.name === value.serverName &&
        server.sites.indexOf(value.siteNumber) === -1
      ) {
        server.sites.push(value.siteNumber);
      }
      if (
        server.name !== value.serverName &&
        server.sites.indexOf(value.siteNumber) !== -1
      ) {
        server.sites.splice(server.sites.indexOf(value.siteNumber), 1);
      }
    });
  updateSiteInfo();
}

function getSiteData() {
  var siteData = [];
  getServers()
    .filter((x) => x.isActive)
    .forEach((server) => {
      server.sites.forEach((site) => {
        siteData.push({
          siteNumber: site,
          serverName: server.name,
        });
      });
    });
  siteData.sort((x, y) => {
    return (
      parseInt(x.siteNumber.split(" ")[1]) -
      parseInt(y.siteNumber.split(" ")[1])
    );
  });
  return siteData;
}

function getActiveServers() {
  var activeServers = [];
  getServers()
    .filter((x) => x.isActive)
    .forEach((server) => activeServers.push(server.name));
  return activeServers;
}

function updateSiteInfo() {
  getServers()
    .filter((x) => x.isActive)
    .forEach((server) => {
      server.service.siteConfigurationService.UpdateSite(
        {
          Sites: server.sites,
        },
        (err) => {
          console.log("Receiving gRPC Response from Update Sites");
          if (err) {
            console.log(err);
          }
        }
      );
    });
}

updateSiteInfo();

exports.SiteConfigurationPanel = SiteConfigurationPanel;
