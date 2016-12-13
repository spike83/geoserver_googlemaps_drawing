var helperModule = (function() {
    function init(){
        // from http://cartometric.com/blog/2014/06/06/convert-google-maps-polygon-api-v3-to-well-known-text-wkt-geometry-expression/
        if (typeof google.maps.Polygon.prototype.ToWKT !== 'function')
        {
            google.maps.Polygon.prototype.ToWKT = function()
            {
                var poly = this;

                // Start the Polygon Well Known Text (WKT) expression
                var wkt = "POLYGON(";

                var paths = poly.getPaths();
                for(var i=0; i<paths.getLength(); i++)
                {
                    var path = paths.getAt(i);

                    // Open a ring grouping in the Polygon Well Known Text
                    wkt += "(";
                    for(var j=0; j<path.getLength(); j++)
                    {
                        // add each vertice, automatically anticipating another vertice (trailing comma)
                        wkt += path.getAt(j).lng().toString() + " " + path.getAt(j).lat().toString() + ",";
                    }

                    // Google's approach assumes the closing point is the same as the opening
                    // point for any given ring, so we have to refer back to the initial point
                    // and append it to the end of our polygon wkt, properly closing it.
                    //
                    // Additionally, close the ring grouping and anticipate another ring (trailing comma)
                    wkt += path.getAt(0).lng().toString() + " " + path.getAt(0).lat().toString() + "),";
                }

                // resolve the last trailing "," and close the Polygon
                wkt = wkt.substring(0, wkt.length - 1) + ")";

                return wkt;
            };
        }

        if (!google.maps.Polygon.prototype.getBounds) {

            google.maps.Polygon.prototype.getBounds=function(){
                var bounds = new google.maps.LatLngBounds();
                this.getPath().forEach(function(element,index){bounds.extend(element)});
                return bounds
            }
        }

        if (typeof google.maps.Polygon.prototype.BoundsArea !== 'function')
        {
            google.maps.Polygon.prototype.BoundsArea = function()
            {
                var bounds = this.getBounds();
                return getBoundsArea(bounds);
            };
        }

        if (typeof google.maps.Rectangle.prototype.ToWKT !== 'function')
        {
            google.maps.Rectangle.prototype.ToWKT = function()
            {
                var bounds = this.getBounds();
                var nord = (bounds.getNorthEast()).lat();
                var ost = (bounds.getNorthEast()).lng();
                var sud = (bounds.getSouthWest()).lat();
                var west = (bounds.getSouthWest()).lng();

                return ['POLYGON(('
                    , ost, ' ', nord, ' , '
                    , ost, ' ', sud, ' , '
                    , west, ' ', sud, ' , '
                    , west, ' ', nord, ' , '
                    , ost, ' ', nord,
                    '))'].join('');
            };
        }

        if (typeof google.maps.Rectangle.prototype.BoundsArea !== 'function')
        {
            google.maps.Rectangle.prototype.BoundsArea = function()
            {
                var bounds = this.getBounds();
                return getBoundsArea(bounds);
            };
        }
        /**
         * calculates the area of bounds
         * @param bounds
         */
        function getBoundsArea(bounds){
            var nord = (bounds.getNorthEast()).lat();
            var ost = (bounds.getNorthEast()).lng();
            var sud = (bounds.getSouthWest()).lat();
            var west = (bounds.getSouthWest()).lng();

            return google.maps.geometry.spherical.computeArea([
                new google.maps.LatLng(ost, nord),
                new google.maps.LatLng(ost, sud),
                new google.maps.LatLng(west, sud),
                new google.maps.LatLng(west, nord),
                new google.maps.LatLng(ost, nord)
            ]);
        }
    }
    return {
        init:init
    }
})();