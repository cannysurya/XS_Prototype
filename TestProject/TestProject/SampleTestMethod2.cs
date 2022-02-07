using System;
using TestMethodNS;

namespace TestProject
{
  public class SampleTestMethod2 : BaseTestMethod
  {
    public override void Execute()
    {
      int x = 11;
      int z = 12;
      int y = 13;
      int result = x + y + z;
      messenger.SendMessageToSubscribers(result.ToString());
    }
  }
}
