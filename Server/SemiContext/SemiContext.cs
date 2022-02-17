using MessengerNS;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Runtime.InteropServices;
using System.Text;
using System.Threading.Tasks;
using Testmethod;

namespace SemiContextNS
{
  public class SemiContext
  {
    public static Messenger messenger;
    public List<string> sites = new List<string>();

    [DllImport("generate_sort.dll")]
    private static extern void GenerateFile(StringBuilder path, StringBuilder resultfile);

    public void Add(int x, int y)
    {
      var testMethodName = new StackFrame(1, true).GetMethod().DeclaringType.FullName.Split(".")[1];
      Parallel.ForEach(sites, site =>
      {
        var value = x + y;
        messenger.Send(GetLogInfo(site, value.ToString(), testMethodName));
      });
    }

    public void SortDataUsingDLLAndSendData(string sourcePath, string destinationPath)
    {
      var testMethodName = new StackFrame(1, true).GetMethod().DeclaringType.FullName.Split(".")[1];
      Parallel.ForEach(sites, site =>
      {
        var destinationPathChunks = destinationPath.Split("\\");
        destinationPathChunks[destinationPathChunks.Length - 1] = site + "_" + destinationPathChunks[destinationPathChunks.Length - 1];

        var newDestinationPath = string.Join("\\", destinationPathChunks);
        GenerateFile(new StringBuilder(sourcePath), new StringBuilder(newDestinationPath));

        string[] lines = File.ReadAllLines(newDestinationPath);
        foreach (string line in lines)
        {
          string[] values = line.Split(',');
          foreach (string value in values)
          {
            messenger.Send(GetLogInfo(site, value, testMethodName));
          }
        }
      });
    }

    public void IterateOverAllSites(double iterationCount)
    {
      var testMethodName = new StackFrame(1, true).GetMethod().DeclaringType.FullName.Split(".")[1];
      Parallel.ForEach(sites, site =>
      {
        for (double i = 0; i < iterationCount; i++)
        {
          messenger.Send(GetLogInfo(site, i.ToString(), testMethodName));
        }
      });
    }

    public void GenerateCheckerBoardPattern()
    {
      var rowSize = 2160;
      var columnSize = 3840;
      var bitmapInfo = new BitMapInfo();

      var counter = 1;
      var initialcounter = 1;
      for (var rowNumber = 0; rowNumber < rowSize; rowNumber++)
      {
        var data = "";
        counter = initialcounter;
        for (var columnNumber = 0; columnNumber < columnSize; columnNumber++)
        {
          data += counter.ToString();
          counter = (counter + 1) % 2;
        }
        initialcounter = (initialcounter + 1) % 2;
        bitmapInfo.GraphPlot = data;
        messenger.Send(bitmapInfo);
      }
    }

    private DataLogInfo GetLogInfo(string site, string measuredValue, string testMethodName)
    {
      var datalogInfo = new DataLogInfo();
      datalogInfo.KeyValuePair.Add(new gRPCKeyValuePair() { Key = "Site", Value = site });
      datalogInfo.KeyValuePair.Add(new gRPCKeyValuePair() { Key = "Measured Value", Value = measuredValue });
      datalogInfo.KeyValuePair.Add(new gRPCKeyValuePair() { Key = "Test Method Name", Value = testMethodName });
      return datalogInfo;
    }
  }
}
