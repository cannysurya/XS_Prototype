using System;
using TestMethodNS;

namespace TestProject
{
  public class SampleTestMethod3 : BaseTestMethod
  {
    public override void Execute()
    {
      int x = 111;
      int z = 112;
      int y = 113;
      int result = x + y + z;
      messenger.SendMessageToSubscribers(result.ToString());
    }
  }
}
