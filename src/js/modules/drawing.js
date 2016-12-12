var drawingModule = (function(){

/*
* Variables we use in the whole module
*/
var measuringTools, drawingGeometry;

/*
* Loads the drawing tools and add's them
* to the map.
* @return {void}
*/
function init(drawingEventHandler) {
    measuringTools = new google.maps.drawing.DrawingManager({
        drawingControl: true,
        drawingControlOptions: {
            position: google.maps.ControlPosition.TOP_LEFT,
            drawingModes: [
                google.maps.drawing.OverlayType.RECTANGLE,
                google.maps.drawing.OverlayType.POLYGON
            ]
        },
        rectangleOptions: {
            editable: true,
            draggable: true,
            fillColor: 'red',
            fillOpacity: 0.3
        },
        polygonOptions: {
            editable: true,
            draggable: true,
            fillColor: 'red',
            fillOpacity: 0.3
        }
    });
    //Add the drawing tools to the map
    measuringTools.setMap(initModule.getMap());
    //Register an event listener when the drawing is finished
    google.maps.event.addListener(measuringTools, 'overlaycomplete', drawingEventHandler || handleDrawEnd);
    //The drawing tools need to go in a custom place
    replaceDrawing();
}

/*
* Add an event listener when the drawing is finished and
* handles what to do then.
* @return {void}
*/
function handleDrawEnd(event) {
            //switch back to non drawing mode
            measuringTools.setDrawingMode(null);
            drawingGeometry = event.overlay;
            // Check for rectangle, this is only necessary if other geometries are available
            if (event.type == google.maps.drawing.OverlayType.RECTANGLE) {
                logRectangleCoordinates();
            }
            //Clear measureOverlay when drawing mode is changing
            google.maps.event.addListener(measuringTools, 'drawingmode_changed', function(){
                drawingGeometry.setMap(null);
            });
            drawingGeometry.addListener('bounds_changed', logRectangleCoordinates);
    }

/*
* Logs the rectangle bound coordinates to the browser console.
* First log is in WGS84, second in LV95 Projection.
* For the LV95 projection a transformation request to the
* swisstopo server is made.
* @return {void}
*/
function logRectangleCoordinates(){
    var nord = (drawingGeometry.getBounds().getNorthEast()).lat();
    var ost = (drawingGeometry.getBounds().getNorthEast()).lng();
    var sud = (drawingGeometry.getBounds().getSouthWest()).lat();
    var west = (drawingGeometry.getBounds().getSouthWest()).lng();

    console.log(nord + "/" + ost);
    console.log(sud + "/" + west);

    $.when($.getJSON(getTransformationUrl(ost, nord)), $.getJSON(getTransformationUrl(west, sud)))
        .done(function(result1, result2){
            console.log("Nord-Ost: " + result1[0].easting + " / " + result1[0].northing);
            console.log("Süd-West: "+ result2[0].easting + " / " + result2[0].northing);
        });
}

/*
* Creates and returns a transformation request url.
* @param {number} easting The lng coordinate in WGS84
* @param {number} northing The lat coordinate in WGS84
* @return {string} request_url The url for the transformation request.
*/
function getTransformationUrl(easting, northing){
    var request_url = "http://geodesy.geo.admin.ch/reframe/wgs84tolv95?";
    request_url += "easting="+easting+"&northing="+northing+"&format=json";
    return request_url;
}

/*
* Wait for the drawing tools to be loaded and then
* replace them to a custom place
* credits: https://swizec.com/blog/how-to-properly-wait-for-dom-elements-to-show-up-in-modern-browsers/swizec/6663
*/
function replaceDrawing() {
    var drawingElements = $('[title="Rechteck zeichnen"]').parent().parent();
    if (!drawingElements.length) {
        window.requestAnimationFrame(replaceDrawing);
    }
    drawingElements.removeAttr("style");
    drawingElements.appendTo($('.drawing-tools'));
}

    return {
        init: init
    }
})();