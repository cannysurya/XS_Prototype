# Setup Prototype 1

This document helps to setup the prototype with the remote server

## Setting up Remote Server

- Install .NET 5.0 SDK
- Place the "Server" folder in the remote machine
- Update the Server's IP Address
  ![](DocumentAssets/server_configuration.png)
- Build the server
  ![](DocumentAssets/build_server.png)
- Start the server
  ![](DocumentAssets/start_server.png)

## Setting up Custom Extension

- Install node modules
  ![](DocumentAssets/install_node_modules.png)
- Configure Server information (Note: In the below image, we are configuring for Server 1. The similar configuration needs to be done for Server 2 as well)
  ![](DocumentAssets/client_configuration.png)
- Start the client (Click Run -> Start Debugging)
  ![](DocumentAssets/start_client.png)

## Execute Test Program

- Open the test project
  ![](DocumentAssets/open_test_project.png)
- Initiate all the panels (Right Click on Explorer Panel -> TFE Panel)
  ![](DocumentAssets/initiate_panels.png)
- Configure Site
  ![](DocumentAssets/configure_site.png)
- Rebuild Test Project (This will update the Test Project DLL in the server. Whenever there is a change in the Test Method, the user is expected to Rebuild Test Project)
  ![](DocumentAssets/rebuild_test_project.png)
- Execute Test Flow
  ![](DocumentAssets/execute_testflow.png)
- The Results will be displayed in the DataLog Panel
