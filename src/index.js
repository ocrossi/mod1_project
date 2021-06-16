import '@kitware/vtk.js/Rendering/Profiles/Geometry';
import '@kitware/vtk.js/macro.js';

import vtkFullScreenRenderWindow from '@kitware/vtk.js/Rendering/Misc/FullScreenRenderWindow';

import vtkActor           from '@kitware/vtk.js/Rendering/Core/Actor';
import vtkMapper          from '@kitware/vtk.js/Rendering/Core/Mapper';
import vtkCalculator      from '@kitware/vtk.js/Filters/General/Calculator';
//import { AttributeTypes } from '@kitware/vtk.js/Common/DataModel/DataSetAttributes/Constants';
//import { FieldDataTypes } from '@kitware/vtk.js/Common/DataModel/DataSet/Constants';

import vtkPolyData from '@kitware/vtk.js/Common/DataModel/PolyData.js'


import vtkPlaneSource from '@kitware/vtk.js/Filters/Sources/PlaneSource';
import { Representation } from '@kitware/vtk.js/Rendering/Core/Property/Constants';

// ----------------------------------------------------------------------------
// Standard rendering code setup
// ----------------------------------------------------------------------------

const fullScreenRenderer = vtkFullScreenRenderWindow.newInstance();
const renderer = fullScreenRenderer.getRenderer();
const renderWindow = fullScreenRenderer.getRenderWindow();

// ----------------------------------------------------------------------------
// Example code
// ----------------------------------------------------------------------------

// const planeSource = vtkPlaneSource.newInstance();

const SIZE_MAP_X = 3;
const SIZE_MAP_Y = 3;
const SIZE_MAP_Z = 0;

const polyData  = vtkPolyData.newInstance();

// place les points
function calc_map() {
	let nbPoints = (SIZE_MAP_X + 1) * (SIZE_MAP_Y + 1);
	let numTriangles = SIZE_MAP_X * SIZE_MAP_Y * 2;

	let points = new Float64Array(nbPoints * 3);
	polyData.getPoints().setData(points, 3);

	let polys = new Uint32Array(4 * numTriangles);
	polyData.getPolys().setData(polys, 1);

	// TO DO : set normals?
	let idx = 0;
	for (let i = 0; i <= SIZE_MAP_X; i++) {
		for (let j = 0; j <= SIZE_MAP_Y; j++) {
			points[idx * 3] = SIZE_MAP_X - i;
			points[idx * 3 + 1] = SIZE_MAP_Y - j;
			points[idx * 3 + 2] = 0; // z coords
			idx++;
		}
	}

	idx = 0;
	/*
	for (let k = 0; k < SIZE_MAP_X; k++) {
		for (let l = 0; l < SIZE_MAP_Y; l++) {
			polys[idx * 4] = 3;
			polys[idx * 4 + 1] = k + l * (SIZE_MAP_X + 1); // ref point for triangle
			polys[idx * 4 + 2] = 
				(k + l % 2 === 0)?
				polys[idx * 4 + 1] + 1 : //	right point in grid
				polys[idx * 4 + 1] + SIZE_MAP_X + 1; // 1 row below point in grid
			polys[idx * 4 + 3] = 
				(k + l % 2 === 0)?
				polys[idx * 4 + 1] + SIZE_MAP_X + 1 :// 1 row below point in grid
				polys[idx * 4 + 1] + SIZE_MAP_X - 1 ;// one point below & 1 left in grid

			idx++;
		}
	}
	*/

	for (let k = 0; k < SIZE_MAP_X; k++) {
		for (let l = 0; l < SIZE_MAP_Y; l++) {
			polys[idx * 4] = 3;
			polys[idx * 4 + 1] = k * (SIZE_MAP_X) + l; // ref point for triangle
			polys[idx * 4 + 2] = 
				(k + l % 2 === 0)?
				polys[idx * 4 + 1] + 1 : //	right point in grid
				polys[idx * 4 + 1] + SIZE_MAP_X; // 1 row below point in grid
			polys[idx * 4 + 3] = 
				(k + l % 2 === 0)?
				polys[idx * 4 + 1] + SIZE_MAP_X:// 1 row below point in grid
				polys[idx * 4 + 1] + SIZE_MAP_X - 1;// one point below & 1 left in grid

			idx++;
		}
	}
}

function create_triangle() {
	var nbPoints = 4 * 1;
	var points = new Float32Array(nbPoints * 3);


	points[0] = 0;
	points[1] = 0;
	points[2] = 0;

	points[3] = 1;
	points[4] = 1;
	points[5] = 0;

	points[6] = 1;
	points[7] = 0;
	points[8] = 0;

	points[9] = 0;
	points[10] = -1;
	points[11] = -1;

	var cells = Uint8Array.from([4, 0, 1, 2, 3]);

	polyData.getPoints().setData(points, 3);
  polyData.getPolys().setData(cells, 1);
}

calc_map();



const mapper = vtkMapper.newInstance();
//mapper.setInputConnection(planeSource.getOutputPort());

mapper.setInputData(polyData);



const actor = vtkActor.newInstance();

actor.getProperty().setRepresentation(Representation.WIREFRAME);

actor.setMapper(mapper);

renderer.addActor(actor);
renderer.resetCamera();
renderWindow.render();


global.renderWindow = renderWindow;
global.fullScreenRenderer = fullScreenRenderer;
global.renderer = renderer;
global.polyData = polyData;
global.planeSource = planeSource;
console.log("hoho");
