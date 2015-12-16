(function () {

    "use strict";

    /**
     An **Nintendo3DSGeometry** is a Geometry that's loaded from a
     <a href="https://en.wikipedia.org/wiki/Nintendo_3DS" target = "_other">Nintendo 3DS</a> file.

     @class Nintendo3DSGeometry
     @module XEO
     @extends Component
     */
    XEO.Nintendo3DSGeometry = XEO.Geometry.extend({

        type: "XEO.Nintendo3DSGeometry",

        _init: function (cfg) {

            this._super(cfg);

            this.src = cfg.src;
        },

        _props: {

            /**
             Path to the .OBJ file.

             Fires a {{#crossLink "Nintendo3DSGeometry/src:event"}}{{/crossLink}} event on change.

             @property src
             @type String
             */
            src: {

                set: function (value) {

                    if (!value) {
                        return;
                    }

                    if (!XEO._isString(value)) {
                        this.error("Value for 'src' should be a string");
                        return;
                    }

                    //this._taskId = this.taskStarted("Loading .3DS");

                    this._src = value;

                    var self = this;

                    load(this._src, function (data) {

                            if (!data.length) {
                                //    return;
                            }

                            var m = K3D.parse.from3DS(data);

                            var mesh = m.edit.objects[0].mesh;

                            // Need to flip the UV coordinates on Y-axis for SceneJS geometry
                            if (mesh.uvt) {
                                for (var i = 1, len = mesh.uvt.length; i < len; i += 2) {
                                    mesh.uvt[i] *= -1.0;
                                }
                            }

                            self.primitive = "triangles";
                            self.positions = mesh.vertices;
                            self.uv = mesh.uvt;
                            //if (mesh.normals) {
                            //    self.normals = mesh.normals;
                            //} else {
                               // self.autoNormals = true;
                            //}
                            self.normals = undefined;
                            self.autoNormals = false;
                            self.indices = mesh.indices;
                            self.tangents = null;

                            //self.positions = [
                            //    -2, -2, 2,
                            //    2, -2, 2,
                            //    2, 2, 2,
                            //    -2, 2, 2, // Front face
                            //
                            //    -2, -2, -2,
                            //    -2, 2, -2,
                            //    2, 2, -2,
                            //    2, -2, -2, // Back face
                            //
                            //    -2, 2, -2,
                            //    -2, 2, 2,
                            //    2, 2, 2,
                            //    2, 2, -2, // Top face
                            //
                            //    -2, -2, -2,
                            //    2, -2, -2,
                            //    2, -2, 2,
                            //    -2, -2, 2, // Bottom face
                            //
                            //    2, -2, -2,
                            //    2, 2, -2,
                            //    2, 2, 2,
                            //    2, -2, 2, // Right face
                            //
                            //    -2, -2, -2,
                            //    -2, -2, 2,
                            //    -2, 2, 2,
                            //    -2, 2, -2 // Left face
                            //];
                            //
                            //self.normals = [
                            //    0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,
                            //    1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,
                            //    0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0,
                            //    -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0,
                            //    0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0,
                            //    0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1
                            //];
                            //
                            //self.uv = [
                            //    1, 1, 0, 1, 0, 0, 1, 0,
                            //    0, 1, 0, 0, 1, 0, 1, 1,
                            //    1, 0, 1, 1, 0, 1, 0, 0,
                            //    1, 1, 0, 1, 0, 0, 1, 0,
                            //    0, 0, 1, 0, 1, 1, 0, 1,
                            //    0, 0, 1, 0, 1, 1, 0, 1
                            //];
                            //
                            //// Tangents are lazy-computed from normals and UVs
                            //// for Normal mapping once we know we have texture
                            //
                            //self.tangents = null;
                            //
                            //self.indices = [
                            //    0, 1, 2, 0, 2, 3,    // front
                            //    4, 5, 6, 4, 6, 7,    // back
                            //    8, 9, 10, 8, 10, 11,   // top
                            //    12, 13, 14, 12, 14, 15,   // bottom
                            //    16, 17, 18, 16, 18, 19,   // right
                            //    20, 21, 22, 20, 22, 23    // left
                            //];

                            self.fire("loaded", true);
                        },

                        function (msg) {

                            self.error("Failed to load .3DS file: " + msg);

                            self.fire("failed", msg);

                            //self._taskId = self.taskFailed(self._taskId);
                        });

                    /**
                     Fired whenever this Nintendo3DSGeometry's  {{#crossLink "Nintendo3DSGeometry/src:property"}}{{/crossLink}} property changes.
                     @event src
                     @param value The property's new value
                     */
                    this.fire("src", this._src);
                },

                get: function () {
                    return this._src;
                }
            }
        },

        _getJSON: function () {
            return {
                src: this._src
            };
        }
    });

    function load(url, ok, error) {
        var xhr = new XMLHttpRequest();
        xhr.responseType = "arraybuffer";
//            xhr.addEventListener('progress',
//                function (event) {
//                    // TODO: Update the task? { type:'progress', loaded:event.loaded, total:event.total }
//                }, false);
        xhr.addEventListener('load',
            function (event) {
                if (event.target.response) {
                    ok(event.target.response);
                } else {
                    error('Invalid file [' + url + ']');
                }
            }, false);
        xhr.addEventListener('error',
            function () {
                error('Couldn\'t load URL [' + url + ']');
            }, false);
        xhr.open('GET', url, true);
        xhr.send(null);
    }

})();