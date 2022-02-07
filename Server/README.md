# gRPC in 3 minutes (C#)

## BACKGROUND

This is a version of the testmethod example using the dotnet SDK
tools to compile [testmethod.proto][] in a common library, build the server
and the client, and run them.

## PREREQUISITES

- The [.NET Core SDK 2.1+](https://www.microsoft.com/net/core)

You can also build the solution `TestMethodService.sln` using Visual Studio 2017,
but it's not a requirement.

## BUILD AND RUN

- Build and run the server

  ```
  > dotnet run -p TestMethodServer
  ```

- Build and run the client

  ```
  > dotnet run -p TestMethodClient
  ```

## Tutorial

You can find a more detailed tutorial about Grpc in [gRPC Basics: C#][]

[testmethod.proto]: ../../protos/testmethod.proto
[grpc basics: c#]: https://grpc.io/docs/languages/csharp/basics
