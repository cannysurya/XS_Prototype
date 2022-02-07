using Grpc.Core;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Threading.Tasks.Dataflow;
using Testmethod;
using TestMethodServer.Enum;

namespace TestMethodServer.Services
{
  public class PubSubServiceImpl : PubSub.PubSubBase
  {

		private ConcurrentDictionary<PubSubTopic, Dictionary<string, object>> _clientCollection = new ConcurrentDictionary<PubSubTopic, Dictionary<string, object>>();
		private static readonly BufferBlock<ResumeInfo> _resumeTopic = new BufferBlock<ResumeInfo>();
		private static readonly BufferBlock<DataLogInfo> _datalogTopic = new BufferBlock<DataLogInfo>();

		public override async Task SubscribeResumeTopic(SubRequest request, IServerStreamWriter<ResumeInfo> responseStream, ServerCallContext context)
		{
			if (!_clientCollection.ContainsKey(PubSubTopic.ResumeTopic))
			{
				_clientCollection.TryAdd(PubSubTopic.ResumeTopic, new Dictionary<string, object>());
			}
			_clientCollection[PubSubTopic.ResumeTopic].Add(request.ClientName, responseStream);

			Console.WriteLine($"Subscribed {request.ClientName} to Resume Topic");
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

			Console.WriteLine($"Subscribed {request.ClientName} to Datalog Topic");
			while (_clientCollection.ContainsKey(PubSubTopic.DataLogTopic))
			{
				var datalogInfo = await _datalogTopic.ReceiveAsync();

				foreach (var client in _clientCollection[PubSubTopic.DataLogTopic])
				{
					await ((IServerStreamWriter<DataLogInfo>)client.Value).WriteAsync(datalogInfo);
				}
			}
		}

		public static void PublishData(PubSubTopic PublishTopic, object PublishData)
		{
			switch (PublishTopic)
			{
				case PubSubTopic.ResumeTopic:
					ResumeInfo resumeInfo = PublishData as ResumeInfo;
					_resumeTopic.Post(resumeInfo);
					break;
				case PubSubTopic.DataLogTopic:
					DataLogInfo dataLogInfo = PublishData as DataLogInfo;
					_datalogTopic.Post(dataLogInfo);
					break;
			}
		}
	}
}
