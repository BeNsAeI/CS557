#version 130
uniform float uK,uP,uY,uLightX,uLightY,uLightZ;
out vec2 vST; // texture coords
out vec3 vN; // normal vector
out vec3 vL; // vector from point to light
out vec3 vE; // vector from point to eye
out vec3 vMCposition;
out vec4 model;
const float PI = 3.14159265359;

void
main( )
{
	vec3 LIGHTPOSITION = vec3( uLightX,uLightY,uLightZ );
	model = gl_Vertex;
	
	model.z = uK * (uY-model.y) * sin( 2.*PI*model.x/uP );
	
	vST = gl_MultiTexCoord0.st;
	vec4 ECposition = gl_ModelViewMatrix * model;
	vN = normalize( gl_NormalMatrix * gl_Normal ); // normal vector
	vL = LIGHTPOSITION - ECposition.xyz; // vector from the point
	// to the light position
	vE = vec3( 0., 0., 0. ) - ECposition.xyz; // vector from the point
	// to the eye position
	vMCposition  = model.xyz;
	gl_Position = gl_ModelViewProjectionMatrix * vec4( vMCposition, 1. );
}
