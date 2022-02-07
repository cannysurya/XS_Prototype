using System;

namespace MessengerNS
{
    public class Messenger
    {
        public delegate void myDel(string message);

        private event myDel myEvent;
        public void SendMessageToSubscribers(string message) {
            if (myEvent != null)
            {
                myEvent(message);
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
