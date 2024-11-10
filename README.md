# QuickBim

### TL:DR
Creating 3D models from pictures in seconds using ML, try out the web app https://quickbim.fi/ or come see our live demo at table 269

## The problem
3D models and visualizations have become more and more usual in todays business. However, creating 3D models still requires quite a bit of special knowledge and training, which the majority of people don't have. In the case of KONE, salespeople would like to visualize the clients' buildings with a 3D model, but don't have the time or skills required. They would have to call up the architect for the building, which is expensive and takes a long time.

## The solution
QuickBIM introduces a simple way to create 3D models of buildings from just a simple floor plan. You can input the floor plan received from the client / architect, or **even just draw it on a piece of paper!** Upload it to our web portal, and in seconds our ML-based conversion system gives you a 3D model! Use the portal to add elevators to the model wherever they should be, and download the final result to use in PowerPoint or any other tool.
Or if you'd really like to wow your client, use our mobile app and point it at the QR code in our web app to view the building in AR, really bringing your plans to life!

## In brief: The tech
### Web App:
- Next.JS with Three.JS for 3D rendering
- Used for uploading image, adding elevators and viewing the model
- Place the elevator in generated 3D models
- Export single floors or whole buildings as .gltf files
### Backend:
- Virtual machine hosted in Azure
- Docker container running API and Server
- API receives image in .jpg or .png, uses OpenCV to exctract information and Blender to generate a 3D model
- Generated model pushed to Blob Storage for easy fetching
### Mobile App:
- Flutter app using QR code to anchor 3D model, utilizing Apple ARcore to render the model in AR


**Not a Figma demo, real code, real tunkkings, real suffering**