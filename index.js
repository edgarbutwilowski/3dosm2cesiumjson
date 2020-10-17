/*
 (c) Copyright 2020 Edgar Butwilowski
*/
const httpLib = require('http');
const urlLib = require('url');
const httpsLib = require('https');
const xml2jsLib = require('xml2js');


function transformToCesiumBuildings(osmJSON, baseheight) {
    let cesiumBuildings = [];

    for (let osmWay of osmJSON.osm.way) {
        if (osmWay.tag != undefined) {
            let isBuilding = false;
            let height = undefined;
            let buildingLevels = undefined;
            for (let osmWayTag of osmWay.tag) {
                // if way has a building tag:
                if (osmWayTag.$.k !== "building") {
                    isBuilding = true;
                }
                // if way has a height:
                if (osmWayTag.$.k === "height") {
                    height = osmWayTag.$.v;
                }
                // if way has a building levels value:
                if (osmWayTag.$.k === "building:levels") {
                    buildingLevels = osmWayTag.$.v;
                }
            }

            if (isBuilding && (height != undefined || buildingLevels != undefined)) {
                // we have found a buildin with a proper height value

                let cesiumBuilding = {};

                if (height === undefined) {
                    height = buildingLevels * 3;
                }

                cesiumBuilding.polygon = {}
                cesiumBuilding.polygon.hierarchy = [];
                cesiumBuilding.polygon.height = baseheight;
                cesiumBuilding.polygon.extrudedHeight = Number(height) + cesiumBuilding.polygon.height;
                cesiumBuilding.polygon.outline = true;
                cesiumBuilding.polygon.material = {
                    alpha: 1,
                    blue: 0,
                    green: 0,
                    red: 1
                }
                cesiumBuilding.polygon.outlineColor = {
                    alpha: 1,
                    blue: 0,
                    green: 0,
                    red: 0
                }
                cesiumBuilding.polygon.shadows = 1;

                // get all nodes of that building's floor:
                for (let refNode of osmWay.nd) {
                    for (let node of osmJSON.osm.node) {
                        if (node.$.id === refNode.$.ref) {
                            cesiumBuilding.polygon.hierarchy.push(node.$.lon);
                            cesiumBuilding.polygon.hierarchy.push(node.$.lat);                            
                        }
                    }
                }
                cesiumBuildings.push(cesiumBuilding);
            }
        }
    }
    return cesiumBuildings
}

const httpServer = httpLib.createServer((request, masterResponse) => {
    masterResponse.statusCode = 200;
    masterResponse.setHeader('Content-Type', 'application/json');

    // set CORS for all:
    masterResponse.setHeader('Access-Control-Allow-Origin', '*');
    masterResponse.setHeader('Access-Control-Request-Method', '*');
    masterResponse.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET');
    masterResponse.setHeader('Access-Control-Allow-Headers', '*');

    const queryParams = urlLib.parse(request.url, true).query;

    httpsLib.get("https://www.openstreetmap.org/api/0.6/map?bbox=" + queryParams.bbox,
        response => {

            let osmData = "";
            response.on("data", dataPart => {
                osmData += dataPart;
            });

            response.on("end", () => {
                const xmlParser = xml2jsLib.Parser();
                xmlParser.parseString(osmData, (error, osmJSON) => {
                    let cesiumBuildings = transformToCesiumBuildings(osmJSON, + queryParams.baseheight);
                    masterResponse.end(JSON.stringify(cesiumBuildings));
                });
            });
        }).on("error", error => {
            console.log(error.message);
        });
});


httpServer.listen(3000, '127.0.0.1', () => {
    console.log('Server has started');
});