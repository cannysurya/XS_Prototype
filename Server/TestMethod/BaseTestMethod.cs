using System;
using MessengerNS;

namespace TestMethodNS
{
    public class BaseTestMethod
    {
        public Messenger messenger;

        public BaseTestMethod()
        {
            messenger = new Messenger();
        }

        public virtual void Execute()
        {
            
        }
    }
}
