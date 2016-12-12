var wpsModule = (function() {
    /**
     * the wkt string to pass into the wps xml.
     */
    var wkt;

    /**
     * the google maps api geometry object.
     */
    var geom;

    /**
     * WPS initializing function.
     */
    function init(){
        // nothing to do at the moment.
    }


    /**
     * set the geometry and transform it to internally used wkt string..
     * @param event the drawing event
     */
    function setGeometry(event){
        if(event.type == google.maps.drawing.OverlayType.RECTANGLE){
            wkt = event.overlay.ToWKT();
        }
        else if(event.type == google.maps.drawing.OverlayType.POLYGON){
            wkt = event.overlay.ToWKT();
        }

        geom = event.overlay;
        $('.hoehenkurven-service>#submit').removeAttr('disabled');

    }

    /**
     * function to check all the parameters and if ok start processing and loading data.
     * @param form
     */
    function startProcess(form) {
        // the size check should prevent the user to wait a long time for the results.
        if(!checkSize(geom, form.interval.value)){
            errorAreaToBig();
            return;
        }

        // we provide two values within the form <mimetype>|<download filename>
        // so here we have to split them up
        var spl = form.format.value.split('|');
        var fileType;
        var fileName;
        if(spl.length == 2){
            fileType = spl[0];
            fileName = spl[1];
        }else{
            fileType = form.format.value;
            fileName = "default.file";
            console.log("failed to get filetype and filename out of format form field");
        }

        // prepare the request
        var xhr = new XMLHttpRequest();

        // todo: wps server address should be extracted to some config place
        xhr.open('POST', 'https://geoserver.karten-werk.ch/demo/wps', true);
        xhr.responseType = 'blob';
        xhr.setRequestHeader('Content-type', 'application/xml; charset=utf-8');
        xhr.onload = function(e) { // this function is called with feedback from server
            if (this.status == 200) {
                var self = this;
                // unfortunately a wps error is sent with status 200 as well, the check function will check for xml error message
                checkBlob(this.response, function () { // function get called when all is right and we can download the data
                    var blob = new Blob([self.response], {type: fileType});
                    var downloadUrl = URL.createObjectURL(blob);
                    var a = document.createElement("a");
                    a.href = downloadUrl;
                    a.download = fileName;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                });
            } else { // to handle other than 200 response codes
                errorCodeSent(this.status, this.response);
            }
        };
        // fire the request to the server
        xhr.send(getXml(wkt,form.interval.value, fileType));
        cleanup();
    }

    /**
     * bring the client in initial state to start another process.
     */
    function cleanup(){
        $('.hoehenkurven-service>#submit').attr('disabled', 'disabled');
        geom.setMap(null);
    }

    /**
     * check if blob contains an xml fragment with the wps error.
     * @param blob the blob received from server
     * @param cb function to call when response is ok
     */
    function checkBlob(blob, cb){
        if(blob.length > 5000){ // error messages are probably shorter
            cb();
            return;
        }
        var reader = new window.FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = function() {
            base64data = reader.result;
            // base64data should be <mimetype>;base64,<base64string>
            var spl = base64data.split(';');
            if(spl.length != 2){
                errorBlobNotCorrect();
            }
            var sp2 = spl[1].split(',');
            if(sp2.length != 2){
                errorBlobNotCorrect();
            }
            var message = window.atob(sp2[1]);
            if(message.indexOf("ExceptionReport") > -1){
                errorOnProcessingServer(message);
            }
            cb();
        }
    }

    /**
     * function to check the area of the selected geometry is not too big for our server.
     * @param geom the geometry object from google maps api
     * @param interval the interval in meters between two lines
     * @returns {boolean} true if we can proceed with the request, false when a too big area is selected.
     */
    function checkSize(geom, interval){
        return geom.BoundsArea() / interval <= 4000000; // max 4 km^2 with 1m or 1 km^2 with 0.5m interval
    }

    function errorAreaToBig(){
        alert("area is too big for our processing server");
        cleanup();
    }

    function errorOnProcessingServer(errorMessage){
        alert("error on processing server \n" + errorMessage);
        cleanup();
    }

    function errorBlobNotCorrect(){
        alert("blob not correct");
        cleanup();
    }

    function errorCodeSent(errorCode, response){
        alert('Höhenkurven können nicht geladen werden! ' + errorCode +" " + response);
        cleanup();
    }

    /**
     * paste the parameters into the xml template
     * @param wkt the wkt string
     * @param interval the vertical distance between two lines
     * @param format the mime type to request from server
     * @returns {string} the composed xml string
     */

    function getXml(wkt, interval, format){
        return xml = "\
            <p0:Execute xmlns:p0=\"http://www.opengis.net/wps/1.0.0\" service=\"WPS\" version=\"1.0.0\">\
              <p1:Identifier xmlns:p1=\"http://www.opengis.net/ows/1.1\">ras:Contour\
              </p1:Identifier>\
              <p0:DataInputs>\
                <p0:Input>\
                  <p1:Identifier xmlns:p1=\"http://www.opengis.net/ows/1.1\">data\
                  </p1:Identifier>\
                  <p0:Reference p5:href=\"http://geoserver/wps\" xmlns:p5=\"http://www.w3.org/1999/xlink\" method=\"POST\" mimeType=\"image/tiff\">\
                    <p0:Body>\
                      <p0:Execute service=\"WPS\" version=\"1.0.0\">\
                        <p1:Identifier xmlns:p1=\"http://www.opengis.net/ows/1.1\">ras:CropCoverage\
                        </p1:Identifier>\
                        <p0:DataInputs>\
                          <p0:Input>\
                            <p1:Identifier xmlns:p1=\"http://www.opengis.net/ows/1.1\">coverage\
                            </p1:Identifier>\
                            <p0:Reference p3:href=\"http://geoserver/wcs\" xmlns:p3=\"http://www.w3.org/1999/xlink\" method=\"POST\" mimeType=\"image/tiff\">\
                              <p0:Body>\
                                <p2:GetCoverage xmlns:p2=\"http://www.opengis.net/wcs/1.1.1\" service=\"WCS\" version=\"1.1.1\">\
                                  <p1:Identifier xmlns:p1=\"http://www.opengis.net/ows/1.1\">dtm:dtm_extrakt_uri\
                                  </p1:Identifier>\
                                  <p2:DomainSubset>\
                                    <p1:BoundingBox xmlns:p1=\"http://www.opengis.net/ows/1.1\" crs=\"http://www.opengis.net/gml/srs/epsg.xml#4326\">\
                                      <p1:LowerCorner>681389 168179</p1:LowerCorner>\
                                      <p1:UpperCorner>697891 195321</p1:UpperCorner>\
                                    </p1:BoundingBox>\
                                  </p2:DomainSubset>\
                                  <p2:Output format=\"image/tiff\"/>\
                                </p2:GetCoverage>\
                              </p0:Body>\
                            </p0:Reference>\
                          </p0:Input>\
                          <p0:Input>\
                            <p1:Identifier xmlns:p1=\"http://www.opengis.net/ows/1.1\">cropShape\
                            </p1:Identifier>\
                            <p0:Reference p4:href=\"http://geoserver/wps\" xmlns:p4=\"http://www.w3.org/1999/xlink\" method=\"POST\" mimeType=\"text/xml; subtype=gml/3.1.1\">\
                              <p0:Body>\
                                <p0:Execute service=\"WPS\" version=\"1.0.0\">\
                                  <p1:Identifier xmlns:p1=\"http://www.opengis.net/ows/1.1\">geo:reproject\
                                  </p1:Identifier>\
                                  <p0:DataInputs>\
                                    <p0:Input>\
                                      <p1:Identifier xmlns:p1=\"http://www.opengis.net/ows/1.1\">geometry\
                                      </p1:Identifier>\
                                      <p0:Data>\
                                        <p0:ComplexData mimeType=\"application/wkt\">" + wkt + "</p0:ComplexData>\
                                      </p0:Data>\
                                    </p0:Input>\
                                    <p0:Input>\
                                      <p1:Identifier xmlns:p1=\"http://www.opengis.net/ows/1.1\">sourceCRS\
                                      </p1:Identifier>\
                                      <p0:Data>\
                                        <p0:LiteralData>EPSG:4326</p0:LiteralData>\
                                      </p0:Data>\
                                    </p0:Input>\
                                    <p0:Input>\
                                      <p1:Identifier xmlns:p1=\"http://www.opengis.net/ows/1.1\">targetCRS\
                                      </p1:Identifier>\
                                      <p0:Data>\
                                        <p0:LiteralData>EPSG:21781</p0:LiteralData>\
                                      </p0:Data>\
                                    </p0:Input>\
                                  </p0:DataInputs>\
                                  <p0:ResponseForm>\
                                    <p0:RawDataOutput>\
                                      <p1:Identifier xmlns:p1=\"http://www.opengis.net/ows/1.1\">result\
                                      </p1:Identifier>\
                                    </p0:RawDataOutput>\
                                  </p0:ResponseForm>\
                                </p0:Execute>\
                              </p0:Body>\
                            </p0:Reference>\
                          </p0:Input>\
                        </p0:DataInputs>\
                        <p0:ResponseForm>\
                          <p0:RawDataOutput>\
                            <p1:Identifier xmlns:p1=\"http://www.opengis.net/ows/1.1\">result\
                            </p1:Identifier>\
                          </p0:RawDataOutput>\
                        </p0:ResponseForm>\
                      </p0:Execute>\
                    </p0:Body>\
                  </p0:Reference>\
                </p0:Input>\
                <p0:Input>\
                  <p1:Identifier xmlns:p1=\"http://www.opengis.net/ows/1.1\">interval\
                  </p1:Identifier>\
                  <p0:Data>\
                    <p0:LiteralData>" + interval + "</p0:LiteralData>\
                  </p0:Data>\
                </p0:Input>\
                <p0:Input>\
                  <p1:Identifier xmlns:p1=\"http://www.opengis.net/ows/1.1\">simplify\
                  </p1:Identifier>\
                  <p0:Data>\
                    <p0:LiteralData>true</p0:LiteralData>\
                  </p0:Data>\
                </p0:Input>\
                <p0:Input>\
                  <p1:Identifier xmlns:p1=\"http://www.opengis.net/ows/1.1\">smooth\
                  </p1:Identifier>\
                  <p0:Data>\
                    <p0:LiteralData>true</p0:LiteralData>\
                  </p0:Data>\
                </p0:Input>\
              </p0:DataInputs>\
              <p0:ResponseForm>\
                <p0:RawDataOutput mimeType=\"" + format + "\">\
                  <p1:Identifier xmlns:p1=\"http://www.opengis.net/ows/1.1\">result\
                  </p1:Identifier>\
                </p0:RawDataOutput>\
              </p0:ResponseForm>\
            </p0:Execute>\
        ";
    }

    return {
        init:init,
        setGeometry: setGeometry,
        startProcess: startProcess
    }
})();