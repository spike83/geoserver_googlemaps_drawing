var layerModule = (function(){
/**
 *Create layer object literal to add as imageMapType to the overlayMapTypes
 *@param {string} geoserver_ns Geoserver Namespace of the layer.
 *@param {string} layername Layername according to name on geoserver.
 *@return: Javascript Objekt Literal with imageMapTypeOptions for the Google Maps Api
 */
    function createOverlayObject(geoserver_ns, layername) {
        var service_base_url = "http://service.lisag.ch/gwc/service/gmaps?layers=";

        var LayerObjekt = {
            getTileUrl: function(coord, zoom) {
                return service_base_url + geoserver_ns + ":" + layername + "&" + "zoom=" + zoom + "&x=" + coord.x + "&y=" + coord.y + "&gridSet=EPSG:4326&format=image/png";
            },
            tileSize: new google.maps.Size(256, 256),
            isPng: true,
            opacity: 0.7,
            name: layername
        };
        return LayerObjekt;
    }

/**
 *Add ImageMapType as new Layer to the map.overlayMapTypes
 *@param {string} geoserver_ns Geoserver Namespace of the layer.
 *@param {string} layername Layername according to name on geoserver.
 *@return: {void}
 */
    function addLayer(geoserver_ns, layername) {
        var map = initModule.getMap();
        var overlayObject = createOverlayObject(geoserver_ns, layername);
        var geoserver_layer = new google.maps.ImageMapType(overlayObject);
        map.overlayMapTypes.insertAt(0, geoserver_layer);

    }

/**
 *Adds or removes the layer to the imageMapTypes depending on the visibility.
 *@return: {void}
 */
    function toggleLayer(){
        var map = initModule.getMap();
        if (map.overlayMapTypes.length === 0) {
            addLayer('hoehen', 'ur57_hoehen');
        } else {
            map.overlayMapTypes.removeAt(0);
        }
    }


    return {
        toggleLayer: toggleLayer
    }
})();