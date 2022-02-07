using System;
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
      messenger.SendMessageToSubscribers(result.ToString());
    }
  }
}
