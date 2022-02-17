"use strict";

const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const { performance } = require("perf_hooks");

const PROTO_PATH = __dirname + "/testmethod.proto";
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);
const testMethodPackage = protoDescriptor.testmethod;

var startTime = undefined;

var tfeData = {};

var datalogData = [];
var datalogConfig = {
  recordsPerPage: 10,
  currentPageNumber: 1,
  maxPageNumber: 1,
  refreshRate: 100,
};

var server1 = {
  name: "Server 1",
  debugConfiguration: {
    local: {
      name: ".NET Core Attach",
      type: "coreclr",
      request: "attach",
      processName: "TestMethodServer.exe",
    },
    remote: {
      name: "Remote 1",
      type: "coreclr",
      request: "attach",
      processName: "TestMethodServer.exe",
      pipeTransport: {
        pipeProgram: "ssh",
        pipeArgs: ["soliton@192.168.1.19"],
        debuggerPath: "C:/Users/Soliton/.vscode/extensions/ms-dotnettools.csharp-1.24.0/.debugger/vsdbg.exe",
        quoteArgs: false,
      },
    },
  },
  service: {
    testMethodService: new testMethodPackage.TestMethod("localhost:30051", grpc.credentials.createInsecure()),
    siteConfigurationService: new testMethodPackage.SiteConfiguration("localhost:30051", grpc.credentials.createInsecure()),
    pubsubService: new testMethodPackage.PubSub("localhost:30051", grpc.credentials.createInsecure()),
  },
  subscription: {
    resumeSubscription: undefined,
    datalogSubscription: undefined,
    bitmaptoolSubscription: undefined,
  },
  sites: [],
  isActive: true,
};

var server2 = {
  name: "Server 2",
  debugConfiguration: {
    local: {
      name: ".NET Core Attach",
      type: "coreclr",
      request: "attach",
      processName: "TestMethodServer.exe",
    },
    remote: {
      name: "Remote 2",
      type: "coreclr",
      request: "attach",
      processName: "TestMethodServer.exe",
      pipeTransport: {
        pipeProgram: "ssh",
        pipeArgs: ["soliton@192.168.1.20"],
        debuggerPath: "C:/Users/Soliton/.vscode/extensions/ms-dotnettools.csharp-1.24.0/.debugger/vsdbg.exe",
        quoteArgs: false,
      },
    },
  },
  service: {
    testMethodService: new testMethodPackage.TestMethod("192.168.1.20:30051", grpc.credentials.createInsecure()),
    siteConfigurationService: new testMethodPackage.SiteConfiguration("192.168.1.20:30051", grpc.credentials.createInsecure()),
    pubsubService: new testMethodPackage.PubSub("192.168.1.20:30051", grpc.credentials.createInsecure()),
  },
  subscription: {
    resumeSubscription: undefined,
    datalogSubscription: undefined,
  },
  sites: [],
  isActive: false,
};

var servers = [server1, server2];

exports.getTFEData = () => tfeData;
exports.getDatalogData = () => datalogData;
exports.setDatalogData = (newDatalogData) => (datalogData = newDatalogData);
exports.getDatalogConfig = () => datalogConfig;
exports.setTFEData = (newTFEData) => (tfeData = newTFEData);
exports.getServers = () => servers;
exports.startTimer = () => {
  startTime = performance.now();
};
exports.endTimer = () => {
  return performance.now() - startTime;
};
