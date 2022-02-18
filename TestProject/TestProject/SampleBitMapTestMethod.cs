using System;
using System.IO;
using TestMethodNS;

namespace TestProject
{
  public class SampleBitMapTestMethod : BaseTestMethod
  {
    public override void Execute()
    {
      var rand = new Random();
      for (var i = 0; i < 1; i++)
      {
        switch (rand.Next(0, 6))
        {
          case 0:
            semiContext.GenerateCheckerBoardPattern();
            break;
          case 1:
            semiContext.GenerateRandomPattern();
            break;
          case 2:
            semiContext.GenerateDominantPassPattern();
            break;
          case 3:
            semiContext.GenerateDominantFailPattern();
            break;
          case 4:
            semiContext.GenerateHalfRowPassPattern();
            break;
          case 5:
            semiContext.GenerateHalfColumnPassPattern();
            break;
        }
      }
    }
  }
}
