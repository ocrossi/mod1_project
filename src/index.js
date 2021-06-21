import '@kitware/vtk.js/Rendering/Profiles/Geometry';
import '@kitware/vtk.js/macro.js';

import vtkFullScreenRenderWindow from '@kitware/vtk.js/Rendering/Misc/FullScreenRenderWindow';

import vtkActor           from '@kitware/vtk.js/Rendering/Core/Actor';
import vtkMapper          from '@kitware/vtk.js/Rendering/Core/Mapper';
import vtkCalculator      from '@kitware/vtk.js/Filters/General/Calculator';

import vtkPolyData from '@kitware/vtk.js/Common/DataModel/PolyData.js'


import vtkPlaneSource from '@kitware/vtk.js/Filters/Sources/PlaneSource';
import { Representation } from '@kitware/vtk.js/Rendering/Core/Property/Constants';

import inputFile from 'raw-loader!../resources/demo1.mod1';
import controlPanel from './controlPanel.html';

// ----------------------------------------------------------------------------
// Standard rendering code setup
// ----------------------------------------------------------------------------

const fullScreenRenderer = vtkFullScreenRenderWindow.newInstance();
const renderer = fullScreenRenderer.getRenderer();
const renderWindow = fullScreenRenderer.getRenderWindow();

// ----------------------------------------------------------------------------
// Example code
// ----------------------------------------------------------------------------

const SIZE_MAP_X = 8;
const SIZE_MAP_Y = 8;
const SIZE_MAP_Z = 0;

const polyData  = vtkPolyData.newInstance();

var inputName = 'demo1';

async function importModule() {

  import(`raw-loader!../resources/${inputName}.mod1`).then((test) => {
    console.log("Loaded");
		console.log(test.default);
  }, (err)=>{
    console.log("Error", err)
  })
}

function parse_input() {
	console.log('input|', inputFile, '|EOI');
}

function calc_map_size() {
	
}


// for now generates flat squared map
function generate_map() {
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

	for (let k = 0; k < SIZE_MAP_X; k++) {
		for (let l = 0; l < SIZE_MAP_Y; l++) {	
			polys[idx * 8] = 3;
			polys[idx * 8 + 1] = k * (SIZE_MAP_X + 1) + l; // ref
			polys[idx * 8 + 2] = polys[idx * 8 + 1] + 1; // down
			polys[idx * 8 + 3] = polys[idx * 8 + 1] + (SIZE_MAP_X + 1); // right

			polys[idx * 8 + 4] = 3;
			polys[idx * 8 + 5] = polys[idx * 8 + 2];
			polys[idx * 8 + 6] = polys[idx * 8 + 3]; 
			polys[idx * 8 + 7] = polys[idx * 8 + 3] + 1; 
			idx++;
		}
	}
}

function main() {
	/* tests */

	importModule();
	console.log('1');

	/* code */
	generate_map();
	parse_input();
	console.log('2');

}

main();

// -----------------------------------------------------------
// UI control handling
// -----------------------------------------------------------

fullScreenRenderer.addController(controlPanel);

function read_input() {
	const reader = new FileReader();
	reader.onload = function() {
		console.log(reader.result);
	}
	reader.readAsText(input.files[0]);
}



const input = document.querySelector('input[type="file"]');
input.addEventListener('change', (e) => {
	console.log(input.files);
	reader.onload = () => console.log(reader.result);
}, false);

// ----------------------------------------------------------------------------
// Display output
// ----------------------------------------------------------------------------

const mapper = vtkMapper.newInstance();
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
