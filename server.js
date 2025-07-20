// server.js
// where your node app starts

// we've started you off with Express (https://expressjs.com/)
// but feel free to use whatever libraries or frameworks you'd like through `package.json`.
const express = require("express");
const app = express();
var requestLib = require('request');


class GeoJSONRewind {

  rewindRing(ring, dir) {
      var area = 0, err = 0;
      for (var i = 0, len = ring.length, j = len - 1; i < len; j = i++) {
          var k = (ring[i][0] - ring[j][0]) * (ring[j][1] + ring[i][1]);
          var m = area + k;
          err += Math.abs(area) >= Math.abs(k) ? area - m + k : k - m + area;
          area = m;
      }
      if (area + err >= 0 !== !!dir) ring.reverse();
  }

  rewindRings(rings, outer) {
      if (rings.length === 0) return;

      this.rewindRing(rings[0], outer);
      for (var i = 1; i < rings.length; i++) {
          this.rewindRing(rings[i], !outer);
      }
  }

  rewind(gj, outer) {
      var type = gj && gj.type, i;

      if (type === 'FeatureCollection') {
          for (i = 0; i < gj.features.length; i++) this.rewind(gj.features[i], outer);

      } else if (type === 'GeometryCollection') {
          for (i = 0; i < gj.geometries.length; i++) this.rewind(gj.geometries[i], outer);

      } else if (type === 'Feature') {
          this.rewind(gj.geometry, outer);

      } else if (type === 'Polygon') {
          this.rewindRings(gj.coordinates, outer);

      } else if (type === 'MultiPolygon') {
          for (i = 0; i < gj.coordinates.length; i++) this.rewindRings(gj.coordinates[i], outer);
      }

      return gj;
  }
}

//This function takes in latitude and longitude of two location and returns the distance between them as the crow flies (in km)
function calcCrow(lat1, lon1, lat2, lon2) 
{
  var R = 6371; // km
  var dLat = toRad(lat2-lat1);
  var dLon = toRad(lon2-lon1);
  var lat1 = toRad(lat1);
  var lat2 = toRad(lat2);

  var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.sin(dLon/2) * Math.sin(dLon/2) * Math.cos(lat1) * Math.cos(lat2); 
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  var d = R * c;
  return d;
}

// Converts numeric degrees to radians
function toRad(Value) 
{
    return Value * Math.PI / 180;
}


// make all the files in 'public' available
// https://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));

// https://expressjs.com/en/starter/basic-routing.html
app.get("/", (request, response) => {
  response.sendFile(__dirname + "/views/index.html");
});


app.get("/cutmap", (request, response) => {

 
  let pointsStrs = request.query.points.split('|')
  let points = []
  pointsStrs.forEach((p)=>{
    p = p.split(",")
    points.push([parseFloat(p[0]),parseFloat(p[1])])
  })
  
  
  let biggestLon = -1000000;
  let biggestLat = -1000000;
  let smallestLon = 10000000;
  let smallestLat = 10000000;
  points.forEach((p)=>{
    if (p[0] > biggestLon ) biggestLon = p[0]
    if (p[0] < smallestLon ) smallestLon = p[0]

    if (p[1] > biggestLat ) biggestLat = p[1]
    if (p[1] < smallestLat ) smallestLat = p[1]

    
  })
  
  let biggestDistance = calcCrow(biggestLat, biggestLon, smallestLat, smallestLon)   
  
  console.log("THe km is",biggestDistance)
  // add in the first one to the last to make a colosed polygon
  points.push(points[0])

  let geojson = {
	"type": "FeatureCollection",
	"features": [{
      "type": "Feature",
      "properties": {
        "stroke": "#fff",
        "stroke-width": 1,
        "stroke-8": 1,
        "fill": "#fff",
        "fill-opacity": 1
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": [points]
      }
    }]
  }

  const rewinder = new GeoJSONRewind();
  let newGeoJSON = rewinder.rewind(geojson);  

  
  let geojsonEncoded = encodeURIComponent(`geojson(${JSON.stringify(newGeoJSON)})`)
  
  let centerLon = smallestLat + ((biggestLat - smallestLat) / 2);
  let centerLat = smallestLon + ((biggestLon - smallestLon) / 2);
  let zoomLvl = request.query.zoom;
  
  console.log("request.query.firstcut", request.query.firstcut)
  if (request.query.firstcut){
    
    if (biggestDistance < 20){
      zoomLvl = 12
    }else if (biggestDistance > 100){
      zoomLvl = 4
      
    }else{
      zoomLvl = 8
    }
    
  }
  console.log("Setting zoomLvl to",zoomLvl)
  
  let url = `https://api.mapbox.com/styles/v1/mapbox/satellite-v9/static/${geojsonEncoded}/${centerLat},${centerLon},${zoomLvl},0/1280x1280@2x?access_token=${process.env["BETWEENTHEPLACES_MAPBOX_KEY"]}&attribution=false&logo=false`
  console.log(url)
  if (request.query.download){
    response.type("application/octet-stream");
    response.attachment("between_the_spaces.jpg");
  }
  
  requestLib.get(url).pipe(response);  
  
  
  
});


// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
