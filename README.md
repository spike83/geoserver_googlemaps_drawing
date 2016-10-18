## Synopsis

This project shows some examples of how to use the Google Maps Api with Geoserver and it's GeoWebCache layers.

## Code Example

Example of two functions to add a Geoserver layer to the Google Maps Api:

    function createOverlayObject(geoserver_ns, layername) {
        var service_base_url = "http://service.lisag.ch/gwc/service/gmaps?layers=";

        var LayerObjekt = {
            getTileUrl: function(coord, zoom) {
                return service_base_url + geoserver_ns + ":" + layername + "&" + "zoom="
                + zoom + "&x=" + coord.x + "&y=" + coord.y + "&gridSet=EPSG:4326&format=image/png";
            },
            tileSize: new google.maps.Size(256, 256),
            isPng: true,
            opacity: 0.7,
            name: layername
        };
        return LayerObjekt;
    }

    function addLayer(geoserver_ns, layername) {
        var map = initModule.getMap();
        var overlayObject = createOverlayObject(geoserver_ns, layername);
        var geoserver_layer = new google.maps.ImageMapType(overlayObject);
        map.overlayMapTypes.insertAt(0, geoserver_layer);

    }

## Motivation

This project is part of a bigger goal to create a isoline download service with geoserver, wps, and Google Maps Api.

## Installation

Copy the whole repository to a (local) Webserver and open index.html in a browser.

## API Reference

Currently no API Reference. But all the javascript logic lives in the files **init.js**, **drawing.js** and **layer.js**.
They are built with the revealing module pattern.

## Tests

No Tests available. Currently theres's also no build process. In a production environment this should clearly be done.

## Contributors
Feel free to fork or branch and if you find any issues, please let me know.

## License

MIT
