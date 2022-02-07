using Google.Protobuf.WellKnownTypes;
using Grpc.Core;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Testmethod;
using TestMethodNS;

namespace TestMethodServer.Services
{
  class SiteConfigurationServiceImpl : SiteConfiguration.SiteConfigurationBase
  {
    public override Task<Empty> UpdateSite(SiteRequest request, ServerCallContext context)
    {
      BaseTestMethod.semiContext.sites = request.Sites.Select(x => x).ToList();
      return Task.FromResult(new Empty());
    }
  }
}
