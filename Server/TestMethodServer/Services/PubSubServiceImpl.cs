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
		private static readonly BufferBlock<BitMapInfo> _bitMapToolTopic = new BufferBlock<BitMapInfo>();
		private static readonly BufferBlock<DigitalWaveformInfo> _digitalWaveformTopic = new BufferBlock<DigitalWaveformInfo>();

		public override async Task SubscribeBitmapToolTopic(SubRequest request, IServerStreamWriter<BitMapInfo> responseStream, ServerCallContext context)
		{
			if (!_clientCollection.ContainsKey(PubSubTopic.BitmapToolTopic))
			{
				_clientCollection.TryAdd(PubSubTopic.BitmapToolTopic, new Dictionary<string, object>());
			}
			if (_clientCollection[PubSubTopic.BitmapToolTopic].ContainsKey(request.ClientName))
      {
				_clientCollection[PubSubTopic.BitmapToolTopic].Remove(request.ClientName);
			}
			_clientCollection[PubSubTopic.BitmapToolTopic].Add(request.ClientName, responseStream);

			Console.WriteLine($"Subscribed {request.ClientName} to Bit Map Topic");
			while (_clientCollection.ContainsKey(PubSubTopic.BitmapToolTopic))
			{
        var bitmapInfo = await _bitMapToolTopic.ReceiveAsync();

        foreach (var client in _clientCollection[PubSubTopic.BitmapToolTopic])
        {
          await ((IServerStreamWriter<BitMapInfo>)client.Value).WriteAsync(bitmapInfo);
        }
      }
		}

		public override async Task SubscribeDigitalWaveformTopic(SubRequest request, IServerStreamWriter<DigitalWaveformInfo> responseStream, ServerCallContext context)
		{
			if (!_clientCollection.ContainsKey(PubSubTopic.DigitalWaveformTopic))
			{
				_clientCollection.TryAdd(PubSubTopic.DigitalWaveformTopic, new Dictionary<string, object>());
			}
			if (_clientCollection[PubSubTopic.DigitalWaveformTopic].ContainsKey(request.ClientName))
			{
				_clientCollection[PubSubTopic.DigitalWaveformTopic].Remove(request.ClientName);
			}
			_clientCollection[PubSubTopic.DigitalWaveformTopic].Add(request.ClientName, responseStream);

			Console.WriteLine($"Subscribed {request.ClientName} to Digital Waveform Topic");
			while (_clientCollection.ContainsKey(PubSubTopic.DigitalWaveformTopic))
			{
				var digitalWaveformInfo = await _digitalWaveformTopic.ReceiveAsync();

				foreach (var client in _clientCollection[PubSubTopic.DigitalWaveformTopic])
				{
					await ((IServerStreamWriter<DigitalWaveformInfo>)client.Value).WriteAsync(digitalWaveformInfo);
				}
			}
		}

		public override async Task SubscribeResumeTopic(SubRequest request, IServerStreamWriter<ResumeInfo> responseStream, ServerCallContext context)
		{
			if (!_clientCollection.ContainsKey(PubSubTopic.ResumeTopic))
			{
				_clientCollection.TryAdd(PubSubTopic.ResumeTopic, new Dictionary<string, object>());
			}
			if (_clientCollection[PubSubTopic.ResumeTopic].ContainsKey(request.ClientName))
			{
				_clientCollection[PubSubTopic.ResumeTopic].Remove(request.ClientName);
			}
			_clientCollection[PubSubTopic.ResumeTopic].Add(request.ClientName, responseStream);

			Console.WriteLine($"Subscribed {request.ClientName} to Resume Topic");
			while (_clientCollection.ContainsKey(PubSubTopic.ResumeTopic))
			{
				var resumeInfo = await _resumeTopic.ReceiveAsync();

				foreach (var client in _clientCollection[PubSubTopic.ResumeTopic])
				{
					Console.WriteLine("Sending PubSub response to " + resumeInfo.FlowNodeIndex);
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
			if (_clientCollection[PubSubTopic.DataLogTopic].ContainsKey(request.ClientName))
			{
				_clientCollection[PubSubTopic.DataLogTopic].Remove(request.ClientName);
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

		public static void PublishData(object PublishData)
		{
			var type = PublishData.GetType();
			if (type == typeof(ResumeInfo))
			{
				ResumeInfo resumeInfo = PublishData as ResumeInfo;
				_resumeTopic.Post(resumeInfo);
			}
			else if (type == typeof(DataLogInfo))
			{
				DataLogInfo dataLogInfo = PublishData as DataLogInfo;
				_datalogTopic.Post(dataLogInfo);
			}
			else if (type == typeof(BitMapInfo))
			{
				BitMapInfo bitMapInfo = PublishData as BitMapInfo;
				_bitMapToolTopic.Post(bitMapInfo);
			}
			else if (type == typeof(DigitalWaveformInfo))
			{
				DigitalWaveformInfo digitalWaveformInfo = PublishData as DigitalWaveformInfo;
				_digitalWaveformTopic.Post(digitalWaveformInfo);
			}
		}
	}
}
