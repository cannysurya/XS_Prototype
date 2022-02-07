using System;
using System.Threading;
using TestMethodNS;

namespace TestProject
{
  public class SampleTestMethod1 : BaseTestMethod
  {
    public override void Execute()
    {
      int x = 1;
      int z = 2;
      int y = 3;
      int result = x + y + z;
      while (true)
      {
        Thread.Sleep(1000);
        messenger.SendMessageToSubscribers(result.ToString());
      }
    }
  }
}
