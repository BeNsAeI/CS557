#version 130
uniform float uK,uP,uY,uLightX,uLightY,uLightZ,uKa, uKd, uKs,uNoiseFreq,uNoiseAmp; // coefficients of each type of lighting
uniform float uShininess; // specular exponent
uniform vec4 uColor;
uniform vec4 uSpecularColor;
uniform sampler3D Noise3;
in vec2 vST; // texture cords
in vec3 vN; // normal vector
in vec3 vL; // vector from point to light
in vec3 vE; // vector from point to eye
in vec3 vMCposition;
in vec4 model;
const float PI = 3.14159265359;
vec3
RotateNormal( float angx, float angy, vec3 n )
{
        float cx = cos( angx );
        float sx = sin( angx );
        float cy = cos( angy );
        float sy = sin( angy );

        // rotate about x:
        float yp =  n.y*cx - n.z*sx;    // y'
        n.z      =  n.y*sx + n.z*cx;    // z'
        n.y      =  yp;
        // n.x      =  n.x;

        // rotate about y:
        float xp =  n.x*cy + n.z*sy;    // x'
        n.z      = -n.x*sy + n.z*cy;    // z'
        n.x      =  xp;
        // n.y      =  n.y;

        return normalize( n );
}

void
main( )
{
	vec3 myColor = vec3(uColor.r,uColor.g,uColor.b);
	
	float dzdx = uK * (uY-model.y) * (2.*PI/uP) * cos( 2.*PI*model.x/uP );
	float dzdy = -uK * sin( 2.*PI*model.x/uP );
	
	vec3 Tx = vec3(1.0, 0.0, dzdx );
	vec3 Ty = vec3(0.0, 1.0, dzdy );
	
	vec4 nvx = texture3D( Noise3, uNoiseFreq*vMCposition );
	float angx = nvx.r + nvx.g + nvx.b + nvx.a  -  2.;
	angx *= uNoiseAmp;
	vec4 nvy = texture3D( Noise3, uNoiseFreq*vec3(vMCposition.xy,vMCposition.z+0.5) );
	float angy = nvy.r + nvy.g + nvy.b + nvy.a  -  2.;
	angy *= uNoiseAmp;
	
	vec3 Normal = RotateNormal(angx,angy,cross(Tx,Ty));

	//	vec3 Normal = normalize(vN);
	vec3 Light = normalize(vL);
	vec3 Eye = normalize(vE);
	vec3 ambient = uKa * myColor;
	float d = max( dot(Normal,Light), 0. ); // only do diffuse if the light can see the point
	vec3 diffuse = uKd * d * myColor;
	float s = 0.;
	if( dot(Normal,Light) > 0. ) // only do specular if the light can see the point
	{
		vec3 ref = normalize( reflect( -Light, Normal ) );
		s = pow( max( dot(Eye,ref),0. ), uShininess );
	}
	vec3 specular = uKs * s * vec3(uSpecularColor.r,uSpecularColor.g,uSpecularColor.b);
	
	gl_FragColor = vec4( ambient + diffuse + specular, uColor.a );
}
