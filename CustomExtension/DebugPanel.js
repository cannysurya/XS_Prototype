"use strict";

const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const fs = require('fs');
const vscode = require("vscode");
const exec = require('child_process').exec;

const PROTO_PATH = __dirname + '/testmethod.proto';
const packageDefinition = protoLoader.loadSync(
	PROTO_PATH, {
	keepCase: true,
	longs: String,
	enums: String,
	defaults: true,
	oneofs: true
});
const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);
const testMethodPackage = protoDescriptor.testmethod;

var tfeData = {
	IsExectionInProgress: false,
	TestFlowName: "Main Test Flow",
	FlowNodes: []
}

const server1 = {
	localDebuggerConfiguration: {
		name: ".NET Core Attach",
		type: "coreclr",
		request: "attach",
		processName: "TestMethodServer.exe"
	},
	remoteDebuggerConfiguration: {
		"name": "Remote 1",
		"type": "coreclr",
		"request": "attach",
		"processName": "TestMethodServer.exe",
		"pipeTransport": {
			"pipeProgram": `${__dirname}/plink.exe`,
			"pipeArgs": [
				"soliton@192.168.1.19",
				"-pw",
				"login@123",
				"-batch",
				"-T"
			],
			"debuggerPath": "C:/Users/Soliton/.vscode/extensions/ms-dotnettools.csharp-1.24.0/.debugger/vsdbg.exe",
			"quoteArgs": false
		}
	},
	gRPCObject: new testMethodPackage.TestMethod('localhost:30051', grpc.credentials.createInsecure()),
	debugSession: undefined,
	resumeSubscription: undefined,
	dataLogSubscription: undefined,
	isActive: true
}

const server2 = {
	localDebuggerConfiguration: {
		name: ".NET Core Attach",
		type: "coreclr",
		request: "attach",
		processName: "TestMethodServer2.exe"
	},
	remoteDebuggerConfiguration: {

	},
	gRPCObject: new testMethodPackage.TestMethod('localhost:30052', grpc.credentials.createInsecure()),
	debugSession: undefined,
	resumeSubscription: undefined,
	isActive: false
}

const servers = [server1, server2];
const dllInputPath = __dirname + "/../TestProject/TestProject/bin/Debug/net5.0/TestProject.dll";
const pdbInputPath = __dirname + "/../TestProject/TestProject/bin/Debug/net5.0/TestProject.pdb";
const TestProjectSlnLocation = __dirname + "/../TestProject";

var selfWebView = undefined;

var skipServerAttach = false;
var isRemoteServer = false;

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
	function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
	return new (P || (P = Promise))(function (resolve, reject) {
		function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
		function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
		function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
		step((generator = generator.apply(thisArg, _arguments || [])).next());
	});
};

var __generator = (this && this.__generator) || function (thisArg, body) {
	var _ = { label: 0, sent: function () { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
	return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function () { return this; }), g;
	function verb(n) { return function (v) { return step([n, v]); }; }
	function step(op) {
		if (f) throw new TypeError("Generator is already executing.");
		while (_) try {
			if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
			if (y = 0, t) op = [op[0] & 2, t.value];
			switch (op[0]) {
				case 0: case 1: t = op; break;
				case 4: _.label++; return { value: op[1], done: false };
				case 5: _.label++; y = op[1]; op = [0]; continue;
				case 7: op = _.ops.pop(); _.trys.pop(); continue;
				default:
					if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
					if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
					if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
					if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
					if (t[2]) _.ops.pop();
					_.trys.pop(); continue;
			}
			op = body.call(thisArg, _);
		} catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
		if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
	}
};

Object.defineProperty(exports, "__esModule", { value: true });
exports.DebugPanel = void 0;

var DebugPanel = /** @class */ (function () {

	function DebugPanel(panel, extensionUri) {
		var _this = this;
		this._disposables = [];
		this._panel = panel;
		this._extensionUri = extensionUri;
		this._update();
		this._panel.onDidDispose(function () { return _this.dispose(); }, null, this._disposables);
	}

	DebugPanel.createOrShow = function (extensionUri) {
		var column = vscode.window.activeTextEditor
			? vscode.window.activeTextEditor.viewColumn
			: undefined;
		// If we already have a panel, show it.
		if (DebugPanel.currentPanel) {
			DebugPanel.currentPanel._panel.reveal(column);
			DebugPanel.currentPanel._update();
			return;
		}

		// Otherwise, create a new panel.
		var panel = vscode.window.createWebviewPanel(DebugPanel.viewType, "Debug Panel", column || vscode.ViewColumn.One, {
			// Enable javascript in the webview
			enableScripts: true,
			// And restrict the webview to only loading content from our extension's `media` directory.
			localResourceRoots: [
				vscode.Uri.joinPath(extensionUri, "media"),
				vscode.Uri.joinPath(extensionUri, "out/compiled"),
			],
		});
		DebugPanel.currentPanel = new DebugPanel(panel, extensionUri);
	};

	DebugPanel.kill = function () {
		var _a;
		(_a = DebugPanel.currentPanel) === null || _a === void 0 ? void 0 : _a.dispose();
		DebugPanel.currentPanel = undefined;
	};

	DebugPanel.revive = function (panel, extensionUri) {
		DebugPanel.currentPanel = new DebugPanel(panel, extensionUri);
	};

	DebugPanel.prototype.dispose = function () {
		DebugPanel.currentPanel = undefined;
		// Clean up our resources
		this._panel.dispose();
		while (this._disposables.length) {
			var x = this._disposables.pop();
			if (x) {
				x.dispose();
			}
		}
	};

	DebugPanel.prototype._update = function () {
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
								case "executeTestMethod": {
									vscode.window.showInformationMessage("Executing Test Method...");
									tfeData.IsExectionInProgress = true;
									selfWebView.postMessage({ command: 'updateTFEData', tfeData: tfeData });
									executeTestMethod();
									break;
								}
								case "rebuildProject": {
									vscode.window.showInformationMessage("Rebuilding Test Project...");
									sendDLLInfo();
									break;
								}
								case "resumeExecution": {
									resumeExecution();
									break;
								}
								case "stopExecution": {
									stopExecution();
									break;
								}
								case "handleBreakPoint": {
									handleBreakPoint(data.flowNodeIndex);
									break;
								}
								case "syncTFEData": {
									selfWebView.postMessage({ command: 'updateTFEData', tfeData: tfeData });
									break;
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

	DebugPanel.loadData = function (newTFEData) {
		tfeData = newTFEData;
		selfWebView.postMessage({ command: 'updateTFEData', tfeData: tfeData });
	}

	DebugPanel.prototype._getHtmlForWebview = function (webview) {
		const scriptUri = webview.asWebviewUri(
			vscode.Uri.joinPath(this._extensionUri, "media", "index.js")
		);
		const resetUri = webview.asWebviewUri(
			vscode.Uri.joinPath(this._extensionUri, "media", "reset.css")
		);
		const vscodeUri = webview.asWebviewUri(
			vscode.Uri.joinPath(this._extensionUri, "media", "vscode.css")
		);
		const styleUri = webview.asWebviewUri(
			vscode.Uri.joinPath(this._extensionUri, "media", "index.css")
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
										<button class="button-1" id="executeButton">Execute</button>
										<button class="button-1" id="resumeExecutionButton">Resume</button>
										<button class="button-1" id="stopExecutionButton">Stop</button>
										<button class="button-1" id="rebuildButton">Rebuild</button>
									</div>
									<div id="tableComponent">
									</div>
                </body>
                <script src="${scriptUri}"></script>
                </html>
        `;
	};

	DebugPanel.viewType = "DebugPanel";
	return DebugPanel;
}());

(function subscribeResumeTopic() {
	servers.filter(x => x.isActive).forEach((server) => {
		server.resumeSubscription = server.gRPCObject.SubscribeResumeTopic({
			ClientName: "TFE"
		});
		server.resumeSubscription.on("data", (data) => {
			setHitBreakpoint(data.FlowNodeIndex);
		})
		server.resumeSubscription.on("error", (err) => {
			vscode.window.showErrorMessage(`Error on Resume topic subscription - ${err.message}`);
		})
	});
})();

(function subscribeDataLogTopic() {
	servers.filter(x => x.isActive).forEach((server) => {
		server.dataLogSubscription = server.gRPCObject.SubscribeDataLogTopic({
			ClientName: "TFE"
		});
		server.dataLogSubscription.on("data", (data) => {
			console.log(data);
		})
		server.dataLogSubscription.on("error", (err) => {
			vscode.window.showErrorMessage(`Error on DataLog topic subscription - ${err.message}`);
		})
	});
})();

function handleBreakPoint(index) {
	tfeData.FlowNodes[index].HasBreakPoint =
		!tfeData.FlowNodes[index].HasBreakPoint;
	selfWebView.postMessage({ command: 'updateTFEData', tfeData: tfeData });
}

function resetIsExecutionInProgressAndHitBreakpoint() {
	tfeData.IsExectionInProgress = false;
	tfeData.FlowNodes.forEach(flowNode => {
		flowNode.HitBreakPoint = false;
	})
	selfWebView.postMessage({ command: 'updateTFEData', tfeData: tfeData });
}

function resetHitBreakpoint() {
	tfeData.FlowNodes.forEach(flowNode => {
		flowNode.HitBreakPoint = false;
	})
	selfWebView.postMessage({ command: 'updateTFEData', tfeData: tfeData });
}

function setHitBreakpoint(index) {
	tfeData.FlowNodes[index].HitBreakPoint = true;
	selfWebView.postMessage({ command: 'updateTFEData', tfeData: tfeData });
}

function registerSessionEvent(server) {
	vscode.debug.onDidStartDebugSession(session => {
		if (session.configuration.name === '.NET Core Attach') {
			server.debugSession = session;
		}
	});
}

async function executeTestMethod() {
	console.log("Executing Test Method");
	if (!skipServerAttach) {
		console.log("Attaching to Server");
		attachToServer();
		await new Promise(r => setTimeout(r, 5000));
	}
	console.log("Sending gRPC Request to Execute the Test Method");
	executeTestMethodInServer();
}

async function sendDLLInfo() {
	console.log("Building the DLL");
	let commandOne = `cd ${TestProjectSlnLocation}`;
	let commandTwo = "dotnet build";

	exec(`${commandOne} && ${commandTwo}`, async (error, stdout, stderr) => {
		if (error) {
			console.log(`error: ${error.message}`);
			return;
		}
		if (stderr) {
			console.log(`stderr: ${stderr}`);
			return;
		}
		console.log("Getting the DLL Data");
		var dLLContent = await getDLLContent();
		var pdbContent = await getPDBContent();
		console.log("Sending gRPC Request to Update the DLL");
		sendDLLToServer(dLLContent, pdbContent);
	});
}

async function resumeExecution() {
	resetHitBreakpoint();
	servers.filter(x => x.isActive).forEach((server) => {
		server.gRPCObject.ResumeExecution({
		}, (err) => {
			console.log("Receiving gRPC Response from Resume Execution");
			if (err) {
				console.log(err);
			}
		});
	})
}

async function stopExecution() {
	resetHitBreakpoint();
	servers.filter(x => x.isActive).forEach((server) => {
		server.gRPCObject.StopExecution({
		}, (err) => {
			console.log("Receiving gRPC Response from Stop Execution");
			if (err) {
				console.log(err);
			}
		});
	})
}

function getDLLContent() {
	return new Promise(function (resolve) {
		fs.stat(dllInputPath, (err, stats) => {
			fs.open(dllInputPath, 'r+', (err, fd) => {
				var buffer = new Buffer.alloc(stats.size);

				if (err) {
					console.log(err);
				}

				fs.read(fd, buffer, 0, buffer.length,
					0, (err, bytes) => {
						if (err) {
							console.log(err);
						}

						fs.close(fd, function (err) {
							if (err) {
								console.log(err);
							}
							resolve(buffer.slice(0, bytes));
						});
					});
			});
		});
	});
}

function getPDBContent() {
	return new Promise(function (resolve) {
		fs.stat(pdbInputPath, (err, stats) => {
			fs.open(pdbInputPath, 'r+', (err, fd) => {
				var buffer = new Buffer.alloc(stats.size);

				if (err) {
					console.log(err);
				}

				fs.read(fd, buffer, 0, buffer.length,
					0, (err, bytes) => {
						if (err) {
							console.log(err);
						}

						fs.close(fd, function (err) {
							if (err) {
								console.log(err);
							}
							resolve(buffer.slice(0, bytes));
						});
					});
			});
		});
	});
}

function sendDLLToServer(dLLData, pdbData) {
	servers.filter(x => x.isActive).forEach((server) => {
		server.gRPCObject.UpdateDLL({
			DLLContent: dLLData,
			PDBContent: pdbData
		}, (err) => {
			console.log("Receiving gRPC Response from UpdateDLL");
			if (err) {
				console.log(err);
			} else {
				vscode.window.showInformationMessage("Rebuild Test Project Successfully...");
			}
		});
	})
}

function executeTestMethodInServer() {
	servers.filter(x => x.isActive).forEach((server) => {
		server.gRPCObject.ExecuteTestMethod(tfeData, (err) => {
			console.log("Receiving gRPC Response from ExecuteTestMethod");
			if (err) {
				console.log(err);
			} else {
				if (selfWebView) {
					resetIsExecutionInProgressAndHitBreakpoint();
					vscode.window.showInformationMessage("Test Method Executed Successfully...");
				}
				if (server.debugSession) {
					//vscode.debug.stopDebugging(server.debugSession);
				}
			}
		});
	})
}

function getAttachObj(server) {
	if (isRemoteServer) {
		return server.remoteDebuggerConfiguration;
	}
	else {
		return server.localDebuggerConfiguration;
	}
}

function attachToServer() {
	servers.filter(x => x.isActive).forEach(async (server) => {
		registerSessionEvent(server);
		await new Promise(r => setTimeout(r, 1000));
		vscode.debug.startDebugging(undefined, getAttachObj(server), undefined);
	})
}

exports.DebugPanel = DebugPanel;
