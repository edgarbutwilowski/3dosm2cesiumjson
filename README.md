# About 3dosm2cesiumjson
This node.js service can transform 3d OSM buildings to cesium.js building entities in JSON format.

# How to use
You need to install Node.js in order to run this service. If Node.js is installed, you can download 3dosm2cesiumjson through Github by using the "Download ZIP" on this repository.

After you have downloaded und unpacked 3dosm2cesiumjson locally, you can open a command line in the unpacked directory and type the following to start:

```console
node index.js
```
This will start the service on port 3000. CORS is activated for your comfort, so you can request the data from any web client.

Now you can open your browser and browse e.g. the following URL:

```console
http://localhost:3000?bbox=bbox=-73.98176,40.76253,-73.97499,40.76821&baseheight=500
```

This will give you a Cesium.js JSON of some buildings in New York Manhatten.

You can use the resulting JSON and integrate it directly into a Cesium.js client this way:

```console
fetch("http://localhost:3000?bbox=-73.98176,40.76253,-73.97499,40.76821&baseheight=500")
  .then(serviceResponse => serviceResponse.json())
  .then(cesiumData => {
    for(let cesiumEntity of cesiumData){
      cesiumEntity.polygon.hierarchy =
           Cesium.Cartesian3.fromDegreesArray(cesiumEntity.polygon.hierarchy);
      viewer.entities.add(cesiumEntity);
    }
  });
```
The `viewer` object in this example is of type `Cesium.Viewer`.
