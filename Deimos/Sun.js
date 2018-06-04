/**
 * Created by Master on 4/26/2017.
 */
//Sun object
    //http://i.imgur.com/HI3Gy4P.jpg

var grobjects = grobjects || [];  //set up objects array

var Sun = undefined; //leak constructors

(function()
{
    "use strict";
    var vertexSource = "" +
        "precision highp float;" +
        "attribute vec3 vPos;" +
        "uniform mat4 tMVP;" +


        "void main(void)" +
        "{" +
        "gl_Position = tMVP * vec4(vPos, 1.0);" +
        "}";

    var fragmentSource = "" +
        "precision highp float;" +
        "void main(void)" +
        "{" +
        "gl_FragColor = vec4(1.0,1.0,0.0,1.0);" +
        "}";


    //Sun constructor
    Sun = function Sun(name, position, size, color)
    {
        this.name = name;
        this.position = position || [0,0,0];
        this.size = size || 1.0;
        this.color = color || [.7, .3, .3];
        this.program = null; //shader program
        this.attributes = null; //attributes for shader
        this.uniforms = null; //uniforms for shader
        this.buffers = [null, null]; //buffers for shader
        this.texture = null;
    }
    Sun.prototype.init = function(drawingState)
    {
        var gl = drawingState.gl;
        //create the shaders

            //buffer shit yo
            console.log("buffering");
            var arraysSun = {
                vpos: {
                    numComponents: 3, data: [
                        -.5, -.5, -.5, .5, -.5, -.5, .5, .5, -.5, -.5, -.5, -.5, .5, .5, -.5, -.5, .5, -.5,    // z = 0
                        -.5, -.5, .5, .5, -.5, .5, .5, .5, .5, -.5, -.5, .5, .5, .5, .5, -.5, .5, .5,    // z = 1
                        -.5, -.5, -.5, .5, -.5, -.5, .5, -.5, .5, -.5, -.5, -.5, .5, -.5, .5, -.5, -.5, .5,    // y = 0
                        -.5, .5, -.5, .5, .5, -.5, .5, .5, .5, -.5, .5, -.5, .5, .5, .5, -.5, .5, .5,    // y = 1
                        -.5, -.5, -.5, -.5, .5, -.5, -.5, .5, .5, -.5, -.5, -.5, -.5, .5, .5, -.5, -.5, .5,    // x = 0
                        .5, -.5, -.5, .5, .5, -.5, .5, .5, .5, .5, -.5, -.5, .5, .5, .5, .5, -.5, .5     // x = 1
                    ]
                },
                vnormal: {
                    numComponents: 3, data: [
                        0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1,
                        0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,
                        0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0,
                        0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0,
                        -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0,
                        1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0
                    ]
                },

                inTexCoords: {
                    numComponents: 2, data: [
                        0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0, 0, 0, 1, 1, 1,
                        0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1,
                        0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1,
                        0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1,
                        0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1,
                        0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 1
                    ]
                }
            };

            //var test1 = document.getElementById("test-vs").string();
//console.log(test1);
            this.program = GLH_createGLProgram(gl, vertexSource, fragmentSource);
            //this.attributes = GLH_findAttribLocations(gl, this.program, ["vPos"]);
            //this.uniforms = GLH_findUniformLocations(gl, this.program, ["view", "proj", "model"]);

            this.program.PositionAttribute = gl.getAttribLocation(this.program, "vPos");
            gl.enableVertexAttribArray(this.program.PositionAttribute);

            this.program.MVPmatrix = gl.getUniformLocation(this.program, "uMVP");

            //Create Buffers
            //this.buffers[0] = GLH_createGLBuffer(gl, arraysSun.vpos, gl.STATIC_DRAW); //sun vertexes
            //this.buffers[1] = GLH_createGLBuffer(gl, arraysSun.vnormal, gl.STATIC_DRAW); //sun normals
            //this.buffers[2] = GLH_createGLBuffer(gl, arraysSun.inTexCoords, gl.STATIC_DRAW); //sun texture coords
        console.log(arraysSun.vpos.data);
            var trianglePosBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, trianglePosBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, arraysSun.vpos.data, gl.STATIC_DRAW);
            trianglePosBuffer.itemSize = 3;

            trianglePosBuffer.numItems = arraysSun.vpos.data.length/3;
            console.log(trianglePosBuffer.numItems);
            this.buffers[0] = trianglePosBuffer;

            //Create Texture
            var texture = gl.createTexture();
            gl.bindTexture(gl.TEXTURE_2D, texture);

            //Fill with 1x1 blue pixel
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE,
                new Uint8Array([0,0,2255,255]));

            //Asynchronously load image
            var image = new Image();
            image.crossOrigin = 'anonymous';
            image.src = "http://i.imgur.com/HI3Gy4P.jpg";
            image.addEventListener('load', function(){
                this.texture = createGLTexture(gl, image, false);
            });


    };


    var createGLTexture = function (gl, image, flipY) {
        var texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
        if(flipY){
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        }
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER,  gl.LINEAR);
        gl.generateMipmap(gl.TEXTURE_2D);
        gl.bindTexture(gl.TEXTURE_2D, null);
        return texture;
    }

    Sun.prototype.draw = function(drawingState)
    {
        var gl = drawingState.gl;
        gl.useProgram(this.program);
        //create model matrix
        var modelM = twgl.m4.scaling([this.size, this.size, this.size]);
        var sunHolder = drawingState.sunDirection;

        sunHolder = twgl.v3.multiply(drawingState.sunDirection, this.position);

        twgl.m4.setTranslation(modelM, sunHolder, modelM);

        var tMVP = twgl.m4.multiply(twgl.m4.multiply(modelM, drawingState.view), drawingState.proj);

        //gl.disable(gl.CULL_FACE);




        //gl.uniformMatrix4fv(this.uniforms.proj, gl.FALSE, drawingState.proj);
        //gl.uniformMatrix4fv(this.uniforms.view, gl.FALSE, drawingState.view);
        //gl.uniformMatrix4fv(this.uniforms.model, gl.FALSE, modelM);

        //gl.activeTexture(gl.TEXTURE0);
        //gl.bindTexture(gl.TEXTURE_2D, this.texture);
        //gl.uniform1i(this.texture, 0);

        gl.uniformMatrix4fv(this.program.MVPmatrix, false, tMVP);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffers[0]);
        gl.vertexAttribPointer(this.program.PositionAttribute, this.buffers[0].itemSize,
        gl.FLOAT, false, 0, 0);

        gl.drawArrays(gl.TRIANGLES, 0, this.buffers[0].numItems);
    };

    Sun.prototype.center = function(drawingState)
    {
        return this.position;
    }



})();

//grobjects.push(new Sun("Sun", [10,0,10], 50, [.9,.9,.2]));