#version 130
uniform float uKa, uKd, uKs, uAd, uBd, uTol,uNoiseFreq,uNoiseAmp,uAlpha; // coefficients of each type of lighting
uniform float uChromaBlue;
uniform float uChromaRed;
uniform bool uUseChromaDepth;
uniform vec3 uColor; // object color
uniform vec3 uSpecularColor; // light color
uniform float uShininess; // specular exponent
uniform sampler3D Noise3;
in vec2 vST; // texture cords
in vec3 vN; // normal vector
in vec3 vL; // vector from point to light
in vec3 vE; // vector from point to eye
in vec3 vMCposition;
in float depth;
vec3
Rainbow( float t )
{
	t = clamp( t, 0., 1. );

	float r = 1.;
	float g = 0.0;
	float b = 1.  -  6. * ( t - (5./6.) );

        if( t <= (5./6.) )
        {
                r = 6. * ( t - (4./6.) );
                g = 0.;
                b = 1.;
        }

        if( t <= (4./6.) )
        {
                r = 0.;
                g = 1.  -  6. * ( t - (3./6.) );
                b = 1.;
        }

        if( t <= (3./6.) )
        {
                r = 0.;
                g = 1.;
                b = 6. * ( t - (2./6.) );
        }

        if( t <= (2./6.) )
        {
                r = 1.  -  6. * ( t - (1./6.) );
                g = 1.;
                b = 0.;
        }

        if( t <= (1./6.) )
        {
                r = 1.;
                g = 6. * t;
        }

	return vec3( r, g, b );
}

void
main( )
{
	vec3 camoColor = vec3(153./256.,102./256.,0.);
	vec3 baseColor = vec3(51./256., 102./256., 0.);
	vec3 myColor = baseColor;

	float Ar = uAd/2.;
	float Br = uBd/2.;
	int numins = int( vST.s / uAd );
	int numint = int( vST.t / uBd );
	float u_c = numins *uAd + Ar ;
	float v_c = numint *uBd + Br ;
	
	vec4 nv = texture3D( Noise3, uNoiseFreq*vMCposition );
	float n = nv.r + nv.g + nv.b + nv.a;    //  1. -> 3.
	n = n - 2.;                             // -1. -> 1.

	float sc = float(numins) * uAd  +  Ar;
	float ds = vST.s - sc;                   // wrt ellipse center
	float tc = float(numint) * uBd  +  Br;
	float dt = vST.t - tc;                   // wrt ellipse center

	float oldDist = sqrt( ds*ds + dt*dt );
	float newDist = oldDist + uNoiseAmp*n;
	float scale = newDist / oldDist;        // this could be < 1., = 1., or > 1.

	ds *= scale;                            // scale by noise factor
	ds /= Ar;                               // ellipse equation

	dt *= scale;                            // scale by noise factor
	dt /= Br;                               // ellipse equation

	float d = ds*ds + dt*dt;
	float a=1.;
	if(d < 1 + uTol)
	{
		if (uAlpha==0)
			discard;
		else
			a=uAlpha;
	}
	if(d < 1 - uTol)
	{
		myColor=camoColor;
	}
	if( abs( d - 1 ) < uTol )
	{
		float t = smoothstep( 1 - uTol, 1 + uTol, d );
		myColor = vec3(0,mix( vec4( baseColor, 1. ), vec4( camoColor, 1. ), t ).g,1);
	}
	
	if( uUseChromaDepth )
	{
		float t = (2./3.) * ( normalize(vE).z - uChromaRed ) / ( uChromaBlue - uChromaRed );
		t = clamp( t, 0., 2./3. );
		myColor = Rainbow( t );
	}
	
	vec3 Normal = normalize(vN);
	vec3 Light = normalize(vL);
	vec3 Eye = normalize(vE);
	vec3 ambient = uKa * myColor;
	float dif = max( dot(Normal,Light), 0. ); // only do diffuse if the light can see the point
	vec3 diffuse = uKd * dif * myColor;
	float s = 0.;
	if( dot(Normal,Light) > 0. ) // only do specular if the light can see the point
	{
		vec3 ref = normalize( reflect( -Light, Normal ) );
		s = pow( max( dot(Eye,ref),0. ), uShininess );
	}
	vec3 specular = uKs * s * vec3(1,1,1);//uSpecularColor;
	
	gl_FragColor = vec4( ambient + diffuse + specular, a );
}
