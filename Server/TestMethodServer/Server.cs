using System;
using System.Threading.Tasks;
using Grpc.Core;
using Testmethod;
using System.Reflection;
using TestMethodNS;
using MessengerNS;
using System.Runtime.Loader;
using System.Linq;
using System.Diagnostics;
using System.IO;
using Google.Protobuf;
using System.Threading;
using System.Threading.Tasks.Dataflow;
using System.Collections.Concurrent;
using System.Collections.Generic;
using SemiContextNS;
using TestMethodServer.Services;

namespace TestMethodServer
{
	class Server
	{
		const int Port = 30051;

		public static void Main(string[] args)
		{
      Grpc.Core.Server server = new Grpc.Core.Server
			{
				Services = { TestMethod.BindService(new TestMethodServiceImpl()),
											PubSub.BindService(new PubSubServiceImpl()),
											SiteConfiguration.BindService(new SiteConfigurationServiceImpl())},
				Ports = { new ServerPort("localhost", Port, ServerCredentials.Insecure) }
			};

			BaseTestMethod.messenger = new Messenger();
			BaseTestMethod.semiContext = new SemiContext();
			SemiContext.messenger = BaseTestMethod.messenger;

			BaseTestMethod.messenger.SubscribeToEvent(MessageReceivedFromMessenger);

			server.Start();

			Console.WriteLine("server listening on port " + Port);
			Console.WriteLine("Press any key to stop the server...");

			//var fileName = "100 Samples.csv";
			//var inputDirectory = Directory.GetParent(Directory.GetCurrentDirectory()).Parent.Parent.Parent + $"\\Test Files\\input\\{fileName}";
			//var outputDirectory = Directory.GetParent(Directory.GetCurrentDirectory()).Parent.Parent.Parent + $"\\Test Files\\output\\{fileName}";

			//BaseTestMethod.semiContext.sites = new List<string> { "Site1" };
			//BaseTestMethod.semiContext.SortDataUsingDLLAndSendData(inputDirectory, outputDirectory);


			Console.ReadKey();

			server.ShutdownAsync().Wait();
		}

		private static void MessageReceivedFromMessenger(DataLogInfo dataLogInfo)
		{
			Console.WriteLine("Message From Messenger : " + dataLogInfo);
		}
	}
}
