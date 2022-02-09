using System;
using System.IO;
using TestMethodNS;

namespace TestProject
{
  public class SampleTestMethod2 : BaseTestMethod
  {
    public override void Execute()
    {
      var fileName = "1K Samples.csv";
      var inputDirectory = Directory.GetParent(Directory.GetCurrentDirectory()).Parent.Parent.Parent + $"\\Test Files\\input\\{fileName}";
      var outputDirectory = Directory.GetParent(Directory.GetCurrentDirectory()).Parent.Parent.Parent + $"\\Test Files\\output\\{fileName}";

      semiContext.SortDataUsingDLLAndSendData(inputDirectory, outputDirectory);
    }
  }
}
