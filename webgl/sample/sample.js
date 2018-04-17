var canvas;
var gl;

var Program;

var Vertices;
var Color;

var NumPoints;
var VertexArray;
var ColorArray;
var TexArray;

var MouseDown = false;
var LastMouseX;
var LastMouseY;
var Left, Middle, Right;
var Perspective;
var SaveScale = 1.;

var MvMatrix = mat4.create( );
var PMatrix  = mat4.create( );
var MvLoc;
var PLoc;
var TLoc;
var SampleTexture;
var ModelMatrix = mat4.create( );

var ST00, ST01, ST10, ST11;

window.onload = InitGraphics;	// function to call first


function DrawTriangle( i, a, b, c, sta, stb, stc )
{
	VertexArray[i+0] = Vertices[a];
	ColorArray[i+0]  = Colors[a];
	TexArray[i+0]    = sta;
	VertexArray[i+1] = Vertices[b];
	ColorArray[i+1]  = Colors[b];
	TexArray[i+1]    = stb;
	VertexArray[i+2] = Vertices[c];
	ColorArray[i+2]  = Colors[c];
	TexArray[i+2]    = stc;
	return i+3;
}


function DrawQuad( i, a, b, c, d )
{
	i = DrawTriangle( i, a, b, c,  ST00, ST10, ST11 );
	i = DrawTriangle( i, a, c, d,  ST00, ST11, ST01 );
	return i ;
}


function InitGraphics( )
{
	canvas = document.getElementById( "gl-canvas" );
	
	gl = WebGLUtils.setupWebGL( canvas );
	if( !gl )
	{
		alert( "WebGL isn't available" );
	}

	canvas.onmousedown   = HandleMouseDown;
	document.onmouseup   = HandleMouseUp;
	document.onmousemove = HandleMouseMove;

	// set some handy constants for later:

	ST00 = vec2.create( [ 0., 0. ] );
	ST01 = vec2.create( [ 0., 1. ] );
	ST10 = vec2.create( [ 1., 0. ] );
	ST11 = vec2.create( [ 1., 1. ] );

	// set globals:

	Perspective = true;
	mat4.identity( ModelMatrix );


	//  load shaders:

	Program = InitShaders( gl, "vertex-shader", "fragment-shader" );
	gl.useProgram( Program );

	MvLoc = gl.getUniformLocation( Program, "uModelViewMatrix" );
	CheckError( "mvLoc " );
	PLoc  = gl.getUniformLocation( Program, "uProjectionMatrix" );
	CheckError( "PLoc " );
	TLoc  = gl.getUniformLocation( Program, "uTexture" );
	CheckError( "TLoc " );

	// setup the texture:

	SampleTexture = gl.createTexture( );
	SampleTexture.image = new Image( );
	SampleTexture.image.onload = function( )
		{
			HandleLoadedTexture( SampleTexture );
		}

	SampleTexture.image.src = "http://cs.oregonstate.edu/~mjb/webgl/beaver.bmp";
	CheckError( "Texture src " );

	// setup ui:

	var b1 = document.getElementById( "PerspButton" );
	b1.addEventListener( "click", function( ) { Perspective =  true; Display( ); }, false );

	b2 = document.getElementById( "OrthoButton" )
	b2.addEventListener( "click", function( ) { Perspective = false; Display( ); }, false );

	// initialize the data:

	InitData( );


	// put the data in opengl buffers:

	var vertexBufferId = gl.createBuffer( );
	gl.bindBuffer( gl.ARRAY_BUFFER, vertexBufferId );
	gl.bufferData( gl.ARRAY_BUFFER, flatten(VertexArray), gl.STATIC_DRAW );
	var vLoc = gl.getAttribLocation( Program, "aVertex" );
	gl.vertexAttribPointer( vLoc, 3, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray( vLoc );

	var colorBufferId = gl.createBuffer( );
	gl.bindBuffer( gl.ARRAY_BUFFER, colorBufferId );
	gl.bufferData( gl.ARRAY_BUFFER, flatten(ColorArray), gl.STATIC_DRAW );
	var cLoc = gl.getAttribLocation( Program, "aColor" );
	gl.vertexAttribPointer( cLoc, 3, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray( cLoc );

	var texBufferId = gl.createBuffer( );
	gl.bindBuffer( gl.ARRAY_BUFFER, texBufferId );
	gl.bufferData( gl.ARRAY_BUFFER, flatten(TexArray), gl.STATIC_DRAW );
	var tcLoc = gl.getAttribLocation( Program, "aTexCoord0" );
	gl.vertexAttribPointer( tcLoc, 2, gl.FLOAT, false, 0, 0 );
	gl.enableVertexAttribArray( tcLoc );


	// get everything running:

	Animate( );
}


function Animate( )
{
	//var date = new Date( );
	//var time = date.getTime( );
	//var timeDiff = time - lastTime;
	//var angleChange = angularSpeed * timeDiff * 2 * Math.PI / 1000;

	requestAnimFrame( Animate );
	Display( );
}


function Display( )
{
	gl.clearColor( 0.0, 0.0, 0.0, 1.0 );
	gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
	gl.viewport( 0, 0, canvas.width, canvas.height );
	gl.enable( gl.DEPTH_TEST );

	// projection matrix:

	if( Perspective )
	{
		PMatrix = mat4.perspective( 60., 1., 0.1, 100.0 );
	}
	else
	{
		PMatrix = mat4.ortho( -2., 2.,  -2., 2.,  0.1, 100. );
	}

	// read the scaling slider:

	var s = $( "#slider" ).slider( "value" );
	if( s != SaveScale )
	{
		var newScaleMatrix = mat4.create( );
		mat4.identity( newScaleMatrix );
		var s2 = s / SaveScale;
		mat4.scale( newScaleMatrix, [ s2, s2, s2 ] );
		mat4.multiply( newScaleMatrix, ModelMatrix, ModelMatrix );
		SaveScale = s;
	}

	// modelview matrix:

	gl.useProgram( Program );
	mat4.identity( MvMatrix );
	mat4.translate( MvMatrix, [0, 0, -4] );		// viewing
	mat4.multiply( MvMatrix, ModelMatrix );		// modeling
	gl.uniformMatrix4fv( MvLoc, false, MvMatrix );
	gl.uniformMatrix4fv( PLoc,  false, PMatrix );

	// texture sampler:

	gl.activeTexture( gl.TEXTURE6 );
	gl.bindTexture( gl.TEXTURE_2D, SampleTexture );
	gl.uniform1i( TLoc, 6 );

	// do the drawing:

	gl.drawArrays( gl.TRIANGLES, 0, NumPoints );
}


function CheckError( msg )
{
    var error = gl.getError( );
    if(  error != 0 )
    {
        var errMsg = "OpenGL error: " + error.toString(16);

        if ( msg )
	{
		errMsg = msg + "\n" + errMsg;
	}
        alert( errMsg );
    }
}


function HandleLoadedTexture( texture )
{
	gl.bindTexture( gl.TEXTURE_2D, texture );
	gl.pixelStorei( gl.UNPACK_FLIP_Y_WEBGL, true );
	gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, texture.image );
	gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR );
	gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR );
	//gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR );
	gl.generateMipmap( gl.TEXTURE_2D );
	gl.bindTexture( gl.TEXTURE_2D, null );
	CheckError( "Loading texture " );
}


function HandleMouseDown( event )
{
	MouseDown = true;
	LastMouseX = event.clientX;
	LastMouseY = event.clientY;
	WhichButton( event );
}

function HandleMouseUp( event )
{
	MouseDown = false;
}

function HandleMouseMove( event )
{
	if( ! MouseDown )
	{
		return;
	}
	var newX = event.clientX;
	var newY = event.clientY;

	var deltaX = newX - LastMouseX;
	var deltaY = newY - LastMouseY;

	if( Left )
	{
		var newModelMatrix = mat4.create( );
		mat4.identity( newModelMatrix );
		mat4.rotate( newModelMatrix, degToRad(deltaX / 2.), [0, 1, 0] );
		mat4.rotate( newModelMatrix, degToRad(deltaY / 2.), [1, 0, 0] );
		mat4.multiply( newModelMatrix, ModelMatrix, ModelMatrix );
	}

	LastMouseX = newX;
	LastMouseY = newY;
}


function WhichButton( event )
{
	var b = event.button;
	//alert( "b = " + b );
	//var middle = Math.floor(b/4);
	//b %= 4;
	//var right = Math.floor(b/2);
	//var left = b%2;
	
	Left   = ( b == 0 );
	Middle = ( b == 1 );
	Right  = ( b == 2 );

	//alert( "left :" +  left + "right: " + right +  "middle: " +  middle );
	return {'Left' : Left, 'Right': Right, 'Middle': Middle};
};
