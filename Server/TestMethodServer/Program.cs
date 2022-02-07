using System;
using System.Threading.Tasks;
using Grpc.Core;
using Testmethod;
using System.Reflection;
using TestMethodNS;
using System.Runtime.Loader;
using System.Linq;
using System.Diagnostics;
using System.IO;
using Google.Protobuf;
using System.Threading;
using System.Threading.Tasks.Dataflow;
using System.Collections.Concurrent;
using System.Collections.Generic;

namespace TestMethodServer
{
    public enum PubSubTopic
    {
        ResumeTopic,
        DataLogTopic,
        Nil
    }

    class TestMethodServerImpl : TestMethod.TestMethodBase
    {
        public static AssemblyLoadContext loadContext = null;
        public static WeakReference weakReference = null;
        public static Assembly assembly = null;
        public static string dllLocation = Directory.GetParent(Directory.GetCurrentDirectory()).Parent.Parent.Parent + @"\TestProjectDLL\TestProject.dll";
        public static string pdbLocation = Directory.GetParent(Directory.GetCurrentDirectory()).Parent.Parent.Parent + @"\TestProjectDLL\TestProject.pdb";
        public static FlowNode currentFlowNode = null;
        public static bool terminateExecution = false;

        private ConcurrentDictionary<PubSubTopic, Dictionary<string, object>> _clientCollection = new ConcurrentDictionary<PubSubTopic, Dictionary<string, object>>();
        private readonly BufferBlock<ResumeInfo> _resumeTopic = new BufferBlock<ResumeInfo>();
        private readonly BufferBlock<DataLogInfo> _datalogTopic = new BufferBlock<DataLogInfo>();

        public override Task<UploadStatus> UpdateDLL(Chunk request, ServerCallContext context)
        {
            Console.WriteLine("***** Received a DLL Update request from client ****");
            Console.WriteLine();

            UnloadContext();
            Thread.Sleep(1000);
            UpdateDLL(request.DLLContent);
            UpdatePDB(request.PDBContent);

            Console.WriteLine("***** DLL is Updated ****");
            Console.WriteLine();
            Console.WriteLine();

            return Task.FromResult(new UploadStatus { Message = "DLL Loaded Successfully!!!" });
        }

        public override Task<TestMethodReply> ExecuteTestMethod(TestMethodRequest request, ServerCallContext context)
        {
            terminateExecution = false;
            Console.WriteLine($"***** Received an execute request from client to execute {request.TestFlowName} *****");
            Console.WriteLine();

            Console.WriteLine($"Before Execution - All load contexts : {string.Join(", ", AssemblyLoadContext.All.Select(x => x.Name))}");
            var canExecuteTestFlow = LoadContext();

            if (canExecuteTestFlow)
            {
                ExecuteTestFlow(request);
            }

            Console.WriteLine($"After Execution - All load contexts : {string.Join(", ", AssemblyLoadContext.All.Select(x => x.Name))}");
            Console.WriteLine();
            Console.WriteLine();

            return Task.FromResult(new TestMethodReply { Message = "Test Method Executed Successfully!!!" });
        }

        public override Task<Google.Protobuf.WellKnownTypes.Empty> ResumeExecution(Google.Protobuf.WellKnownTypes.Empty request, ServerCallContext context)
        {
            if (currentFlowNode != null)
            {
                currentFlowNode.HasBreakPoint = false;
            }
            return Task.FromResult(new Google.Protobuf.WellKnownTypes.Empty());
        }

        public override Task<Google.Protobuf.WellKnownTypes.Empty> StopExecution(Google.Protobuf.WellKnownTypes.Empty request, ServerCallContext context)
        {
            terminateExecution = true;
            if (currentFlowNode != null)
            {
                currentFlowNode.HasBreakPoint = false;
            }
            return Task.FromResult(new Google.Protobuf.WellKnownTypes.Empty());
        }

        public override async Task SubscribeResumeTopic(SubRequest request, IServerStreamWriter<ResumeInfo> responseStream, ServerCallContext context)
        {
            if (!_clientCollection.ContainsKey(PubSubTopic.ResumeTopic))
            {
                _clientCollection.TryAdd(PubSubTopic.ResumeTopic, new Dictionary<string, object>());
            }
            _clientCollection[PubSubTopic.ResumeTopic].Add(request.ClientName, responseStream);

            Console.WriteLine("Subscribed to Resume Topic");

            while (_clientCollection.ContainsKey(PubSubTopic.ResumeTopic))
            {
                var resumeInfo = await _resumeTopic.ReceiveAsync();

                foreach (var client in _clientCollection[PubSubTopic.ResumeTopic])
                {
                    await ((IServerStreamWriter<ResumeInfo>)client.Value).WriteAsync(resumeInfo);
                }
            }
        }

        public override async Task SubscribeDataLogTopic(SubRequest request, IServerStreamWriter<DataLogInfo> responseStream, ServerCallContext context)
        {
            if (!_clientCollection.ContainsKey(PubSubTopic.DataLogTopic))
            {
                _clientCollection.TryAdd(PubSubTopic.DataLogTopic, new Dictionary<string, object>());
            }
            _clientCollection[PubSubTopic.DataLogTopic].Add(request.ClientName, responseStream);

            Console.WriteLine("Subscribed to DataLog Topic");
            while (_clientCollection.ContainsKey(PubSubTopic.DataLogTopic))
            {
                var datalogInfo = await _datalogTopic.ReceiveAsync();

                foreach (var client in _clientCollection[PubSubTopic.DataLogTopic])
                {
                    await ((IServerStreamWriter<DataLogInfo>)client.Value).WriteAsync(datalogInfo);
                }
            }
        }

        private void ExecuteTestFlow(TestMethodRequest request)
        {
            foreach (var flowNode in request.FlowNodes)
            {
                if (flowNode.HasBreakPoint)
                {
                    currentFlowNode = flowNode;
                    PublishData(PubSubTopic.ResumeTopic, new ResumeInfo()
                    {
                        FlowNodeIndex = request.FlowNodes.IndexOf(flowNode)
                    });

                    while (flowNode.HasBreakPoint)
                    {

                    }
                    currentFlowNode = null;
                }
                if (terminateExecution)
                {
                    break;
                }
                var testMethodType = assembly.GetType($"TestProject.{flowNode.Name}");
                var myObj = (BaseTestMethod)Activator.CreateInstance(testMethodType);
                myObj.messenger.SubscribeToEvent(MessageReceivedFromMessenger);
                myObj.Execute();
                myObj.messenger.UnsubscribeToEvent(MessageReceivedFromMessenger);
            }
        }

        private void UnloadContext()
        {
            if (loadContext != null)
            {
                Console.WriteLine("Unloading NewContext...");
                loadContext.Unload();

                ClearGlobalVariables();

                for (int i = 0; i < 10 && weakReference.IsAlive; i++)
                {
                    GC.Collect();
                    GC.WaitForPendingFinalizers();
                }
                weakReference = null;
                Console.WriteLine("Unloaded NewContext...");
                Console.WriteLine($"All load contexts : {string.Join(", ", AssemblyLoadContext.All.Select(x => x.Name))}");
            }
        }

        private void UpdateDLL(ByteString data)
        {
            try
            {
                File.WriteAllBytes(dllLocation, data.ToByteArray());
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
            }
        }

        private void UpdatePDB(ByteString data)
        {
            try
            {
                File.WriteAllBytes(pdbLocation, data.ToByteArray());
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
            }
        }

        private void ClearGlobalVariables()
        {
            loadContext = null;
            assembly = null;
        }

        private bool LoadContext()
        {
            if (loadContext == null)
            {
                if (File.Exists(dllLocation))
                {
                    loadContext = new AssemblyLoadContext("NewContext", true);
                    weakReference = new WeakReference(loadContext, true);
                    assembly = loadContext.LoadFromAssemblyPath(dllLocation);
                }
                else
                {
                    Console.WriteLine("DLL does not exist. Please rebuild the project");
                    return false;
                }
            }
            return true;
        }

        private void MessageReceivedFromMessenger(string message)
        {
            //Console.WriteLine("Message From Messenger : " + message);
            Console.WriteLine("Sending Message to client");
            PublishData(PubSubTopic.DataLogTopic, new DataLogInfo()
            {
                ServerName = "DummyData",
                Site = 1,
                MeasuredValue = "1",
                TestMethodName = "DummyTestMethod"
            });
        }

        private void PublishData(PubSubTopic PublishTopic, object PublishData)
        {
            switch (PublishTopic)
            {
                case PubSubTopic.ResumeTopic:
                    ResumeInfo resumeData = PublishData as ResumeInfo;
                    _resumeTopic.Post(resumeData);
                    break;
                case PubSubTopic.DataLogTopic:
                    DataLogInfo datalogData = PublishData as DataLogInfo;
                    _datalogTopic.Post(datalogData);
                    break;
            }
        }
    }

    class Program
    {
        const int Port = 30051;

        public static void Main(string[] args)
        {
            Server server = new Server
            {
                Services = { TestMethod.BindService(new TestMethodServerImpl()) },
                Ports = { new ServerPort("localhost", Port, ServerCredentials.Insecure) }
            };
            server.Start();

            Console.WriteLine("server listening on port " + Port);
            Console.WriteLine("Press any key to stop the server...");

            Console.ReadKey();

            server.ShutdownAsync().Wait();
        }
    }
}
