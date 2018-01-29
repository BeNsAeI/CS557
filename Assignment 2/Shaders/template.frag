#version 130
uniform float uKa, uKd, uKs, uAd, uBd, uTol, uA, uP; // coefficients of each type of lighting
uniform vec3 uColor; // object color
uniform vec3 uSpecularColor; // light color
uniform float uShininess; // specular exponent
in vec2 vST; // texture cords
in vec3 vN; // normal vector
in vec3 vL; // vector from point to light
in vec3 vE; // vector from point to eye
void
main( )
{
	vec3 myColor = vec3(0,1,1);

	float Ar = uAd/2.;
	float Br = uBd/2.;
	int numins = int( vST.s / uAd );
	int numint = int( vST.t / uBd );
	float u_c = numins *uAd + Ar ;
	float v_c = numint *uBd + Br ;

	float thresh = pow((((vST.s)-(u_c))/(Ar)),2) + pow((((vST.t)-(v_c))/(Br)),2);
	if(thresh <= 1)
	{
		float r = 1-thresh;//sqrt( vST.s*vST.s + vST.t*vST.t );
		float rfrac = fract( uA * r );
		float t = smoothstep( 0.5 - uP - uTol, 0.5 - uP + uTol, rfrac ) - smoothstep( 0.5 + uP - uTol, 0.5 + uP + uTol, rfrac );
		myColor = vec3(0,mix( vec4( 0., 1., 1., 1. ), vec4( 0., 0., 1., 1. ), t ).g,1);
	}

	vec3 Normal = normalize(vN);
	vec3 Light = normalize(vL);
	vec3 Eye = normalize(vE);
	vec3 ambient = uKa * myColor;
	float d = max( dot(Normal,Light), 0. ); // only do diffuse if the light can see the point
	vec3 diffuse = uKd * d * vec3(0,1,1);//uColor;
	float s = 0.;
	if( dot(Normal,Light) > 0. ) // only do specular if the light can see the point
	{
		vec3 ref = normalize( reflect( -Light, Normal ) );
		s = pow( max( dot(Eye,ref),0. ), uShininess );
	}
	vec3 specular = uKs * s * vec3(1,1,1);//uSpecularColor;

	gl_FragColor = vec4( ambient + diffuse + specular, 1. );
}
