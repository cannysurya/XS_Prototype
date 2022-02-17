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
using TestMethodServer.Enum;

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

			Console.ReadKey();

			server.ShutdownAsync().Wait();
		}

		private static void MessageReceivedFromMessenger(object dataLogInfo)
		{
			PubSubServiceImpl.PublishData(dataLogInfo);
		}
	}
}
