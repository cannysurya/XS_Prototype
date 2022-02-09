"use strict";

const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');

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

}

var siteData = [];

var servers = [{
  name: "Server 1",
  debugConfiguration: {
    local: {
      name: ".NET Core Attach",
      type: "coreclr",
      request: "attach",
      processName: "TestMethodServer.exe"
    },
    remote: {
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
    }
  },
  service: {
    testMethodService: new testMethodPackage.TestMethod('localhost:30051', grpc.credentials.createInsecure()),
    siteConfigurationService: new testMethodPackage.SiteConfiguration('localhost:30051', grpc.credentials.createInsecure()),
    pubsubService: new testMethodPackage.PubSub('localhost:30051', grpc.credentials.createInsecure())
  },
  subscription: {
    resumeSubscription: undefined,
    datalogSubscription: undefined
  },
  sites: [],
  isActive: true
},
{
  name: "Server 2",
  debugConfiguration: {
    local: {
      name: ".NET Core Attach",
      type: "coreclr",
      request: "attach",
      processName: "TestMethodServer.exe"
    },
    remote: {
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
    }
  },
  service: {
    testMethodService: new testMethodPackage.TestMethod('localhost:30051', grpc.credentials.createInsecure()),
    siteConfigurationService: new testMethodPackage.SiteConfiguration('localhost:30051', grpc.credentials.createInsecure()),
    pubsubService: new testMethodPackage.PubSub('localhost:30051', grpc.credentials.createInsecure())
  },
  subscription: {
    resumeSubscription: undefined,
    datalogSubscription: undefined
  },
  sites: [],
  isActive: true
}
]

exports.getTFEData = () => tfeData;
exports.setTFEData = (newTFEData) => tfeData = newTFEData;
exports.getServers = () => servers;
exports.getSiteData = () => siteData;
exports.setSiteData = (newSiteData) => siteData = newSiteData;
