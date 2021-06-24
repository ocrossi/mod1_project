import "@kitware/vtk.js/Rendering/Profiles/Geometry";
import "@kitware/vtk.js/macro.js";

import vtkFullScreenRenderWindow from "@kitware/vtk.js/Rendering/Misc/FullScreenRenderWindow";
import vtkActor from "@kitware/vtk.js/Rendering/Core/Actor";
import vtkMapper from "@kitware/vtk.js/Rendering/Core/Mapper";
import vtkCalculator from "@kitware/vtk.js/Filters/General/Calculator";
import vtkPolyData from "@kitware/vtk.js/Common/DataModel/PolyData.js";
import vtkPlaneSource from "@kitware/vtk.js/Filters/Sources/PlaneSource";
import { Representation } from "@kitware/vtk.js/Rendering/Core/Property/Constants";

import controlPanel from "./controlPanel.html";

import inputFile from "raw-loader!../resources/demo5.mod1";
//import inputFile from "raw-loader!../errors_resource/demo1.mod1";

import parse_input from "./parsing.js";
import resize_map from "./resizeMap.js";


// ----------------------------------------------------------------------------
// Standard rendering code setup
// ----------------------------------------------------------------------------

const fullScreenRenderer = vtkFullScreenRenderWindow.newInstance();
const renderer = fullScreenRenderer.getRenderer();
const renderWindow = fullScreenRenderer.getRenderWindow();

// ----------------------------------------------------------------------------
// The magic starts here
// ----------------------------------------------------------------------------

const polyData = vtkPolyData.newInstance();


function generate_map(mapData) {
	let nbPoints = (mapData.size_map + 1) * (mapData.size_map + 1);
	let numTriangles = mapData.size_map * mapData.size_map * 2;

	let points = new Float64Array(nbPoints * 3);
	polyData.getPoints().setData(points, 3);

	let polys = new Uint32Array(4 * numTriangles);
	polyData.getPolys().setData(polys, 1);

	let idx = 0;
	for (let i = 0; i <= mapData.size_map; i++) {
		for (let j = 0; j <= mapData.size_map; j++) {
			points[idx * 3] = mapData.size_map - i;
			points[idx * 3 + 1] = mapData.size_map - j;
			points[idx * 3 + 2] = 0; // z coords
			idx++;
		}
	}

	idx = 0;

	for (let k = 0; k < mapData.size_map; k++) {
		for (let l = 0; l < mapData.size_map; l++) {
			polys[idx * 8] = 3;
			polys[idx * 8 + 1] = k * (mapData.size_map + 1) + l; // ref
			polys[idx * 8 + 2] = polys[idx * 8 + 1] + 1; // down
			polys[idx * 8 + 3] = polys[idx * 8 + 1] + (mapData.size_map + 1); // right

			polys[idx * 8 + 4] = 3;
			polys[idx * 8 + 5] = polys[idx * 8 + 2];
			polys[idx * 8 + 6] = polys[idx * 8 + 3];
			polys[idx * 8 + 7] = polys[idx * 8 + 3] + 1;
			idx++;
		}
	}
}

function main() {
	let mapData = {
		size_map: 100,
		size_max: 1000000000,
		points: new Array(),
		input: "",
	}
	mapData.input = inputFile;
	
	if (parse_input(mapData) === false) {
		console.error("input parsing failure");
		return;
	}
	resize_map(mapData);
	generate_map(mapData);
}

main();

// -----------------------------------------------------------
// UI control handling
// -----------------------------------------------------------

fullScreenRenderer.addController(controlPanel);

function read_input() {
	const reader = new FileReader();
	reader.onload = function () {
		console.log(reader.result);
	};
	reader.readAsText(input.files[0]);
}

const input = document.querySelector('input[type="file"]');
input.addEventListener(
	"change",
	(e) => {
		console.log(input.files);
		read_input();
	},
	false
);

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
