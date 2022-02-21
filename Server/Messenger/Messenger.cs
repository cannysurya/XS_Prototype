using System;
using Testmethod;

namespace MessengerNS
{
  public class Messenger
  {
    public delegate void myDel(object datalogInfo);

    private event myDel myEvent;
    public void Send(object datalogInfo)
    {      
      if (myEvent != null)
      {
        myEvent(datalogInfo);
      }
    }

    public void SubscribeToEvent(myDel del)
    {
      myEvent += del;
    }

    public void UnsubscribeToEvent(myDel del)
    {
      myEvent -= del;
    }
  }
}
