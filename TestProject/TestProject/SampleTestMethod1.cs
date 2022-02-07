using System;
using TestMethodNS;

namespace TestProject
{
  public class SampleTestMethod1 : BaseTestMethod
  {
    public override void Execute()
    {
      semiContext.Add(1, 2);
    }
  }
}
