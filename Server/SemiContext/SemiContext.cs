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

      var counter = 1;
      var initialcounter = 1;
      for (var rowNumber = 0; rowNumber < rowSize; rowNumber++)
      {
        var bitmapInfo = new BitMapInfo();
        counter = initialcounter;
        for (var columnNumber = 0; columnNumber < columnSize; columnNumber++)
        {
          bitmapInfo.Data.Add(counter);
          counter = (counter + 1) % 2;
        }
        initialcounter = (initialcounter + 1) % 2;
        bitmapInfo.IsLastRecord = rowNumber == rowSize - 1 ? true : false;
        messenger.Send(bitmapInfo);
      }
    }

    public void GenerateInverseCheckerBoardPattern()
    {
      var rowSize = 2160;
      var columnSize = 3840;

      var counter = 0;
      var initialcounter = 0;
      for (var rowNumber = 0; rowNumber < rowSize; rowNumber++)
      {
        var bitmapInfo = new BitMapInfo();
        counter = initialcounter;
        for (var columnNumber = 0; columnNumber < columnSize; columnNumber++)
        {
          bitmapInfo.Data.Add(counter);
          counter = (counter + 1) % 2;
        }
        initialcounter = (initialcounter + 1) % 2;
        bitmapInfo.IsLastRecord = rowNumber == rowSize - 1 ? true : false;
        messenger.Send(bitmapInfo);
      }
    }

    public void GenerateRandomPattern()
    {
      var rowSize = 2160;
      var columnSize = 3840;
      var rand = new Random();

      for (var rowNumber = 0; rowNumber < rowSize; rowNumber++)
      {
        var bitmapInfo = new BitMapInfo();
        for (var columnNumber = 0; columnNumber < columnSize; columnNumber++)
        {
          bitmapInfo.Data.Add(rand.Next(0, 2));
        }
        bitmapInfo.IsLastRecord = rowNumber == rowSize - 1 ? true : false;
        messenger.Send(bitmapInfo);
      }
    }

    public void GenerateDominantPassPattern()
    {
      var rowSize = 2160;
      var columnSize = 3840;
      var rand = new Random();

      for (var rowNumber = 0; rowNumber < rowSize; rowNumber++)
      {
        var bitmapInfo = new BitMapInfo();
        for (var columnNumber = 0; columnNumber < columnSize; columnNumber++)
        {
          var randomValue = rand.Next(0, 10);
          bitmapInfo.Data.Add(randomValue > 7 ? 1 : 0);
        }
        bitmapInfo.IsLastRecord = rowNumber == rowSize - 1 ? true : false;
        messenger.Send(bitmapInfo);
      }
    }

    public void GenerateDominantFailPattern()
    {
      var rowSize = 2160;
      var columnSize = 3840;
      var rand = new Random();

      for (var rowNumber = 0; rowNumber < rowSize; rowNumber++)
      {
        var bitmapInfo = new BitMapInfo();
        for (var columnNumber = 0; columnNumber < columnSize; columnNumber++)
        {
          var randomValue = rand.Next(0, 10);
          bitmapInfo.Data.Add(randomValue > 7 ? 0 : 1);
        }
        bitmapInfo.IsLastRecord = rowNumber == rowSize - 1 ? true : false;
        messenger.Send(bitmapInfo);
      }
    }

    public void GenerateHalfRowPassPattern()
    {
      var rowSize = 2160;
      var columnSize = 3840;

      for (var rowNumber = 0; rowNumber < rowSize; rowNumber++)
      {
        var bitmapInfo = new BitMapInfo();
        for (var columnNumber = 0; columnNumber < columnSize; columnNumber++)
        {
          bitmapInfo.Data.Add(rowNumber <= (rowSize / 2) ? 1 : 0);
        }
        bitmapInfo.IsLastRecord = rowNumber == rowSize - 1 ? true : false;
        messenger.Send(bitmapInfo);
      }
    }

    public void GenerateHalfColumnPassPattern()
    {
      var rowSize = 2160;
      var columnSize = 3840;

      for (var rowNumber = 0; rowNumber < rowSize; rowNumber++)
      {
        var bitmapInfo = new BitMapInfo();
        for (var columnNumber = 0; columnNumber < columnSize; columnNumber++)
        {
          bitmapInfo.Data.Add(columnNumber <= (columnSize / 2) ? 1 : 0);
        }
        bitmapInfo.IsLastRecord = rowNumber == rowSize - 1 ? true : false;
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
