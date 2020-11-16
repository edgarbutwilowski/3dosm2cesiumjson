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
http://localhost:3000?bbox=-73.98176,40.76253,-73.97499,40.76821&baseheight=10
```

This will give you a Cesium.js JSON of some buildings in New York Manhatten. You have to set or adjust the `basehight` value. This is the hight above sea level of all the buildings' base lines in the service request. You also have to provide the bounding box (`bbox`) for your request. Try to choose small bounding boxes in order to spare the OSM export service. You can manually configure the bounding box you need through this OSM web map:

https://www.openstreetmap.org/export

You can use the resulting JSON and integrate it directly into a Cesium.js client this way:

```console
fetch("http://localhost:3000?bbox=-73.98176,40.76253,-73.97499,40.76821&baseheight=10")
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
