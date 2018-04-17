function InitData( )
{
	// define the data:

	Vertices = new Array(8);
	Colors   = new Array(8);

	Vertices[0] = point3.create(  [ -1., -1., -1. ]  );
	Vertices[1] = point3.create(  [  1., -1., -1. ]  );
	Vertices[2] = point3.create(  [ -1.,  1., -1. ]  );
	Vertices[3] = point3.create(  [  1.,  1., -1. ]  );
	Vertices[4] = point3.create(  [ -1., -1.,  1. ]  );
	Vertices[5] = point3.create(  [  1., -1.,  1. ]  );
	Vertices[6] = point3.create(  [ -1.,  1.,  1. ]  );
	Vertices[7] = point3.create(  [  1.,  1.,  1. ]  );

	Colors[0] = color3.create(  [ 0., 0., 0. ]  );
	Colors[1] = color3.create(  [ 1., 0., 0. ]  );
	Colors[2] = color3.create(  [ 0., 1., 0. ]  );
	Colors[3] = color3.create(  [ 1., 1., 0. ]  );
	Colors[4] = color3.create(  [ 0., 0., 1. ]  );
	Colors[5] = color3.create(  [ 1., 0., 1. ]  );
	Colors[6] = color3.create(  [ 0., 1., 1. ]  );
	Colors[7] = color3.create(  [ 1., 1., 1. ]  );

	NumPoints = 6 * 2 * 3;		// sides * triangles/side * vertices/triangle
	VertexArray = new Array( NumPoints );
	ColorArray  = new Array( NumPoints );
	TexArray    = new Array( NumPoints );

	var index = 0;
	index = DrawQuad( index, 1, 0, 2, 3 );
	index = DrawQuad( index, 4, 5, 7, 6 );
	index = DrawQuad( index, 5, 1, 3, 7 );
	index = DrawQuad( index, 0, 4, 6, 2 );
	index = DrawQuad( index, 6, 7, 3, 2 );
	index = DrawQuad( index, 0, 1, 5, 4 );

	if( index != NumPoints )
	{
		alert( "Warning: index should have been " + NumPoints + ", but instead was " + index );
	}
}
