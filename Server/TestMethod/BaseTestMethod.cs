using System;
using MessengerNS;
using SemiContextNS;

namespace TestMethodNS
{
  public class BaseTestMethod
  {
    public static Messenger messenger;
    public static SemiContext semiContext;

    public BaseTestMethod()
    {
      
    }

    public virtual void Execute()
    {

    }
  }
}
