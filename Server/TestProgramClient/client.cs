using Grpc.Core;
using Grpc.Net.Client;
using System;
using System.IO;
using System.Text;
using Testmethod;

namespace TestProgramClient
{
  class client
  {
    static void Main(string[] args)
    {
      //var options = new GrpcChannelOptions();
      //options.MaxReceiveMessageSize = Int32.MaxValue;
      //var channel = GrpcChannel.ForAddress("http://localhost:30051", options);
      //var testMethodClient = new TestMethod.TestMethodClient(channel);
      //var pubSubClient = new PubSub.PubSubClient(channel);
      //testMethodClient.ExecuteTestMethodForBitmapToolGraph(new Google.Protobuf.WellKnownTypes.Empty());

      //System.Threading.Tasks.Task.Run(async () =>
      //{

      //  var _subscriptionRequest = new SubRequest() { ClientName = "TFE2" };
      //  using (var call = pubSubClient.SubscribeBitmapToolTopic(_subscriptionRequest))
      //  {
      //    var responseReaderTask = System.Threading.Tasks.Task.Run(async () =>
      //    {
      //      try
      //      {
      //        while (await call.ResponseStream.MoveNext())
      //        {
      //          Console.WriteLine(call.ResponseStream.Current);
      //        }
      //      }
      //      catch (Exception ex)
      //      {

      //      }
      //    });
      //    await responseReaderTask;
      //  }
      //});

      //var response = client.ExecuteTestMethod(
      //      new TestMethodRequest
      //      {
      //          Name = ".NET 5 - grpcClient"
      //      });
      //Console.WriteLine("From Server: " + response.Message);

      //Google.Protobuf.ByteString arrayElements = new Google.Protobuf.ByteString { 1, 2, 3 };
      // var text = File.ReadAllBytes(Directory.GetParent(Directory.GetCurrentDirectory()).Parent.Parent.Parent.Parent + @"\TestProject\TestProject\bin\Debug\net5.0\TestProject.dll");

      //var response = client.UpdateDLL(new Chunk()
      //{
      //    DLLContent = Google.Protobuf.ByteString.CopyFrom(text)
      //});

      Console.ReadKey();
    }
  }
}
