# To Install ARFUD

1. install xcode and get the simulator you need
 - go to mac store and install xcode
 - open xcode once installed and install the additional components
 - open xcode > settings > locations, ensure Command Line Tools is selected (e.g., "Xcode 16.x")
 - in xcode, go to windows > devices and simulators > simulators, download latest iphone like iphone 17 pro max

   
2. install the following
- homebrew
- watchman (install using homebrew)
- volta
- cocoapods (install using homebrew)
- node (install using volta)
- pnpm (install using volta)
 
please refer to here for more reference: https://docs.expo.dev/get-started/set-up-your-environment/?platform=ios&device=simulated&mode=devel…

3. Run the command: pnpm install 

-------------------------------------------------------------------------------------------------------------------------------------------------

# To Run ARFUD
in one terminal:
pnpm convex dev # to run database (the first time you run this you will need to setup a new convex database)
 
in another terminal window:
pnpm run ios # to run simulator with app installed
