var initModule = (function(){
    var map;

/*
* Initialize the map, load layers and drawing tools.
* @return {void}
*/
    function initMap() {
        "use strict";

        //Options for the custom Lisag Basemap
        var LisagBasemapOptions = {
            getTileUrl: function(coord, zoom) {
                var service_url = "http://basemaps.lisag.ch/gwc/service/gmaps?layers=geour_basemap:basemap_geour&";
                service_url += "zoom=" + zoom + "&x=" + coord.x + "&y=" + coord.y + "&format=image/jpeg";
                return service_url;
            },
            tileSize: new google.maps.Size(256, 256),
            isPng: true,
            opacity: 1.0,
            name: 'Pixelkarten / AV',
            alt: 'Pixelkarten / Amtliche Vermessung anzeigen',
            maxZoom: 21,
            minZoom: 10
        };

        // Create the Lisag Basemap
        var LisagBasemap = new google.maps.ImageMapType(LisagBasemapOptions);

        // Create a map object and specify the DOM element for display.
        map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 46.781, lng: 8.576},
        zoom: 11,
        mapTypeId: 'geour_basemap',
        mapTypeControlOptions: {
            mapTypeIds: ['geour_basemap', ,google.maps.MapTypeId.SATELLITE], // ,google.maps.MapTypeId.SATELLITE]
            position: google.maps.ControlPosition.TOP_RIGHT
        }
        });
        //Add the Lisag Basemap to the mapTypes
        map.mapTypes.set('geour_basemap', LisagBasemap);

        //Load the drawing tools
        wpsModule.init(wpsSuccessCallback, wpsErrorCallback);
        drawingModule.init(wpsModule.setGeometry);
        helperModule.init();

    }

    function wpsErrorCallback(flag, code, message) {
        var message= "Fehler bei Höhenkurven Export!\n";
        switch (flag){
            case wpsModule.WPS_ERROR_CONDITION.HTTP_ERROR:
                message += "HTTP ERROR mit Coce: " + code;
                break;
            case wpsModule.WPS_ERROR_CONDITION.WPS_ERROR:
                message += "Prozessierfehler: \n" + message;
                break;
            case wpsModule.WPS_ERROR_CONDITION.AREA_TOO_BIG:
                message += "Fläche zu gross. Bitte wenden Sie sich an die Lisag.";
                break;
            default:
                message += "Ein technischer Fehler ist aufgetreten.";
        }
        alert(message);
    }

    function wpsSuccessCallback() {
        alert("Höhenkurven wurden fertiggestellt und heruntergeladen. Sie finden die Datei in Ihren Downloads!")
    }

/*
* Function return the google.maps.map Objcect
* @return {Object} The used map object
*/
    function getMap(){
        "use strict";
        return map;

    }

    return {
        initMap:initMap,
        getMap: getMap
    }
})();