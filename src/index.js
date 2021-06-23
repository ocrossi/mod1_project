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

import inputFile from "raw-loader!../resources/demo1.mod1";
//import inputFile from "raw-loader!../errors_resource/demo1.mod1";

// ----------------------------------------------------------------------------
// Standard rendering code setup
// ----------------------------------------------------------------------------

const fullScreenRenderer = vtkFullScreenRenderWindow.newInstance();
const renderer = fullScreenRenderer.getRenderer();
const renderWindow = fullScreenRenderer.getRenderWindow();

// ----------------------------------------------------------------------------
// Example code
// ----------------------------------------------------------------------------

const polyData = vtkPolyData.newInstance();
const SIZE_MAP_X = 1000;
const SIZE_MAP_Y = 1000;
const SIZE_MAP_Z = 0;
const MAX_UNS_INT = 4294967295;
const INPUT_POINTS = new Array();


// returns length of a given number
function digitCount(num) {
	if (num === 0) return 1;
	return Math.floor(Math.log10(Math.abs(num))) + 1;
}

// transforms point string into coord tab
function store_point(point) {
	const newPoint = new Array(3);

	point = point.substr(1, point.length);
	newPoint[0] = parseInt(point, 10);
	point = point.substr(digitCount(newPoint[0]) + 1, point.length);
	newPoint[1] = parseInt(point, 10);
	point = point.substr(digitCount(newPoint[1]) + 1, point.length);
	newPoint[2] = parseInt(point, 10);
	INPUT_POINTS.push(newPoint);

	if (
		newPoint[0] > MAX_UNS_INT ||
		newPoint[1] > MAX_UNS_INT ||
		newPoint[2] > MAX_UNS_INT
	)
		return false;
	return true;
}

// browse input file, divides it into chunks of points, checks points and
// stores them in global INPUT_POINTS variable
function parse_input() {
	const reg1 = new RegExp('".*"');
	const reg2 = new RegExp("\([0-9]+,[0-9]+,[0-9]+\)");

	const t1 = reg1.exec(inputFile); // takes everything in double quotes cozz for now fixed inputFile
	const t2 = t1[0].substr(1, t1[0].length - 2); // suppress 1st and last double quote

	let lineTab = t2.split("\\n");
	if (lineTab.length <= 1) return false;
	for (let i = 0; i < lineTab.length - 1; i++) {
		let pointsTab = lineTab[i].split(" ");
		for (let j = 0; j < pointsTab.length; j++) {
			if (pointsTab[j].match(reg2) === null) {
				console.log("FAILURE REGEXP");
				return false;
			}
			if (store_point(pointsTab[j]) === false) return false;
		}
	}
	return true;
}

function sort_input_tab() {
	while (1) {
		let isSorted = true;
		for (let i = 1; i < INPUT_POINTS.length; i++) {
			if (INPUT_POINTS[i][2] > INPUT_POINTS[i - 1][2]) {
				isSorted = false;
				let temp = INPUT_POINTS[i];
				INPUT_POINTS[i] = INPUT_POINTS[i - 1];
				INPUT_POINTS[i - 1] = temp;
				console.log("i = " + i + '| we comp ' + INPUT_POINTS[i][2] + " and " + INPUT_POINTS[i - 1][2]);
			}
		}
		if (isSorted === true) break;
	}
}

// checks for points too high for their x,y coordinates to ensure a null altitude around the cube
function get_overlap() {
	let smallest = 0;
	let overlap = 0;
	let currentOverlap = 0;

	for (let i = 0; i < INPUT_POINTS.length; i++) {
		smallest = (INPUT_POINTS[i][0] <= INPUT_POINTS[i][1]) ? INPUT_POINTS[i][0] : INPUT_POINTS[i][1];
		currentOverlap = INPUT_POINTS[i][2] - smallest;
		console.log(currentOverlap);
		if (currentOverlap > overlap)
			overlap = currentOverlap;
	}
	return overlap;
}

// adds biggest overlap to every point in the map
function compute_overlap() {
	let overlap = get_overlap();

	for (let i = 0; i < INPUT_POINTS.length; i++) {
		INPUT_POINTS[i][0] += overlap;
		INPUT_POINTS[i][1] += overlap;
	}
}

function calc_map_size() {
	compute_overlap();
	// mapCoords_to_worldCoords();
}

function generate_map() {
	let nbPoints = (SIZE_MAP_X + 1) * (SIZE_MAP_Y + 1);
	let numTriangles = SIZE_MAP_X * SIZE_MAP_Y * 2;

	let points = new Float64Array(nbPoints * 3);
	polyData.getPoints().setData(points, 3);

	let polys = new Uint32Array(4 * numTriangles);
	polyData.getPolys().setData(polys, 1);

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
	if (parse_input() === false) {
		console.error("input parsing failure");
		return;
	}
	sort_input_tab();
	calc_map_size();
	generate_map();
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
