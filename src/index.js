import "@kitware/vtk.js/Rendering/Profiles/Geometry";
import "@kitware/vtk.js/macro.js";

import vtkFullScreenRenderWindow from "@kitware/vtk.js/Rendering/Misc/FullScreenRenderWindow";
import vtkActor from "@kitware/vtk.js/Rendering/Core/Actor";
import vtkMapper from "@kitware/vtk.js/Rendering/Core/Mapper";
import vtkPolyData from "@kitware/vtk.js/Common/DataModel/PolyData.js";
import vtkCalculator from "@kitware/vtk.js/Filters/General/Calculator";
import vtkOutlineFilter from "@kitware/vtk.js/Filters/General/OutlineFilter";
import vtkColorTransferFunction from '@kitware/vtk.js/Rendering/Core/ColorTransferFunction';
import vtkDataSet from "@kitware/vtk.js/Common/DataModel/DataSet";
const { ColorMode, ScalarMode } = vtkMapper;
const { FieldDataTypes } = vtkDataSet;


import * as ui from "./UI.js"
import controlPanel from "./controlPanel.html";
//import inputFile from "raw-loader!../resources/demosize.mod1";
import inputFile from "raw-loader!../resources/demo1.mod1";
//import inputFile from "raw-loader!../resources/testnotrailingchar.mod1"; // a retest
//import inputFile from "raw-loader!../resources/demo4.mod1";
//import inputFile from "raw-loader!../resources/demolimittesting.mod1";
//import inputFile from "raw-loader!../resources/demosimpleaf.mod1";
//import inputFile from "raw-loader!../resources/demotestfinest.mod1";

import parse_input from "./parsing.js";
import change_map_dimensions from "./changeMapDimensions.js";
import create_map from "./createMap.js";
import generate_heat_map2 from './generateHeatMap2.js';
import generate_map2 from "./generateScaleMap2.js";
// import perlin_map from "./perlinMap.js";
import generate_water_grid from "./generateStillWater.js";
import { display_water_sphere } from "./fluidUtilities";
import update_water from './updateWater.js'
import vtkSphere from '@kitware/vtk.js/Common/DataModel/Sphere';

// ----------------------------------------------------------------------------
// Standard rendering code setup
// ----------------------------------------------------------------------------

const fullScreenRenderer = vtkFullScreenRenderWindow.newInstance();
const renderer = fullScreenRenderer.getRenderer();
const renderWindow = fullScreenRenderer.getRenderWindow();

// ----------------------------------------------------------------------------
// The main for map generation and water movement starts here
// ----------------------------------------------------------------------------

let polyData = vtkPolyData.newInstance();
var waterPolyData = vtkPolyData.newInstance();


let	fluidData = {
	fluid_array: [],
	map_topo: [],
	anim_time: 0,
};


let fluidCube = {
	size: 1,
	// timestep: a voir
	diffusion: 0,
	viscosity: 0,
	density: 0,
	
	temp: new Array(),
	vX:new Array(),
	vY:new Array(),
	vZ:new Array(),
	vX0:new Array(),
	vY0:new Array(),
	vZ0:new Array(),
};

let mapData = {
	size_map: 0,
	size_world: 0,
	highest: 0,
	res_offset: 1,
	resolution_max: 200,
	max_height: 0,
	size_max: 1000000,
	points: new Array(),
	closest_points: new Array(), // no need to define here, memory mismanagment
	heat_map: new Array(), // no need
	input: "", // only for parsing, could be destroyed afterwards
	file_name: "",
	noise_map: false,
	combine_heats: false,
	square_flattening: false,
	sigmoid_flattening: false,
	reset_map: false
};

function main() {
	mapData.input = inputFile;
	if (parse_input(mapData) === false) {
		console.error("input parsing failure"); // faire affichage fail parser a l ecran
		return;
	}
	create_map(mapData); // creates smallest map possible 
	change_map_dimensions(mapData); // adds margin and sets a resolution param for big maps
	generate_heat_map2(mapData);
	generate_map2(mapData, polyData);


	//generate_water_grid(mapData, fluidData);
}

main();

// -----------------------------------------------------------
// UI control handling
// -----------------------------------------------------------

fullScreenRenderer.addController(controlPanel);

function read_input() {
	const reader = new FileReader();
	reader.onload = function () {
		mapData.input = reader.result;
	};
	reader.readAsText(input.files[0]);
	mapData.file_name = input.files[0].name;
	mapData.reset_map = true;
}

const input = document.querySelector('input[type="file"]');
input.addEventListener(
	"change",
	(e) => {
		//mapData.file_name = input.files[0].name;
		read_input();
	},
	false
);

document.querySelector('#generate').addEventListener('click', () => {
	polyData = vtkPolyData.newInstance();
	if (mapData.reset_map === true)
		ui.set_map_input(mapData);
	ui.toggle_square_f(mapData);
	ui.toggle_sigmoid(mapData);
	ui.toggle_heats(mapData);
	ui.toggle_noise(mapData);
	ui.change_res(mapData);
	ui.generate_new_map(polyData, mapData);
	simpleFilter.setInputData(polyData);
	outlineFilter.setInputData(polyData);
	outlineMapper.setInputConnection(outlineFilter.getOutputPort());
	mapMapper.setInputConnection(simpleFilter.getOutputPort());
	renderer.resetCamera();
	renderWindow.render();
});
// ----------------------------------------------------------------------------
// Display output
// ----------------------------------------------------------------------------


// sets colors to height map
function map_color(x) {
	let hmax = mapData.highest;
	if (x[2] < hmax / 8)
		return 0;
	if (x[2] < hmax / 4)
		return 1;
	if (x[2] < 3 * hmax / 4)
		return 2;
	return 3;
}

// ! color table ! //
const lookupTable = vtkColorTransferFunction.newInstance();
lookupTable.addRGBPoint(0, 1.0, 1.0, 0.0); // yellow
lookupTable.addRGBPoint(1, 0.0, 1.0, 0.0); //green
lookupTable.addRGBPoint(2, 0.5, 0.37, 0.3); //brown
lookupTable.addRGBPoint(3, 1, 1, 1); //white
lookupTable.addRGBPoint(4, 0, 0, 0.54); // deep blue
lookupTable.build();
// ! color table ! //

// ! TERRAIN ! //
const mapMapper = vtkMapper.newInstance({
	interpolateScalarsBeforeMapping: true,
	colorMode: ColorMode.DEFAULT,
	scalarMode: ScalarMode.DEFAULT,
	useLookupTableScalarRange: true,
	lookupTable,
});
const mapActor = vtkActor.newInstance();
mapActor.setMapper(mapMapper);

const simpleFilter = vtkCalculator.newInstance();
simpleFilter.setFormulaSimple(
	FieldDataTypes.POINT, // Generate an output array defined over points.
	[], // We don't request any point-data arrays because point coordinates are made available by default.
	"z", // Name the output array "z"
	//(x) => (x[0] - 0.5) * (x[0] - 0.5) + (x[1] - 0.5) * (x[1] - 0.5) + 0.125
	(x) => map_color(x)
); // Our formula for z

simpleFilter.setInputData(polyData);
mapMapper.setInputConnection(simpleFilter.getOutputPort());
// ! TERRAIN ! //

// ! outline box ! //
const outlineFilter = vtkOutlineFilter.newInstance();
outlineFilter.setInputData(polyData);
const outlineMapper = vtkMapper.newInstance();
const outlineActor = vtkActor.newInstance();

outlineMapper.setInputConnection(outlineFilter.getOutputPort());
outlineActor.setMapper(outlineMapper);
// ! outline box ! //

// ! water ! //
const waterActor = vtkActor.newInstance();
const waterMapper = vtkMapper.newInstance();

let droplet =	display_water_sphere(fluidData, waterPolyData);
//waterMapper.setInputConnection(droplet.getOutputPort());

waterActor.setMapper(waterMapper);

const waterFilter = vtkCalculator.newInstance();

waterFilter.setFormulaSimple(
	FieldDataTypes.POINT, // Generate an output array defined over points.
	[], // We don't request any point-data arrays because point coordinates are made available by default.
	"z", // Name the output array "z"
	//(x) => (x[0] - 0.5) * (x[0] - 0.5) + (x[1] - 0.5) * (x[1] - 0.5) + 0.125
	(x) => 4
); // Our formula for z

waterFilter.setInputConnection(droplet.getOutputPort());
waterMapper.setInputConnection(waterFilter.getOutputPort());

// ! water ! //


// add objects to scene, move camera and render
renderer.addActor(mapActor);
renderer.addActor(outlineActor);
//renderer.addActor(waterActor);
renderer.getActiveCamera().elevation(300);
renderer.getActiveCamera().computeDistance();
renderer.resetCamera();
renderWindow.render();
//actor.getProperty().setWireframe(true);


var intervalId = window.setInterval(function(){
	waterPolyData = vtkPolyData.newInstance();
	fluidData.anim_time += 1;
	//console.log("anim_time :", fluidData.anim_time);
	update_water(fluidData);
	let droplet = display_water_sphere(fluidData);
	//waterMapper.setInputConnection(droplet.getOutputPort());
	waterActor.setMapper(waterMapper);
	renderer.addActor(waterActor);

	waterFilter.setInputConnection(droplet.getOutputPort());
	waterMapper.setInputConnection(waterFilter.getOutputPort());
	renderWindow.render();
}, 1000);


global.renderWindow = renderWindow;
global.fullScreenRenderer = fullScreenRenderer;
global.renderer = renderer;
global.mapActor = mapActor;
global.mapMapper = mapMapper;
global.waterActor = waterActor;
global.waterMapper = waterMapper;
global.waterPolyData = waterPolyData;
global.polyData = polyData;
global.mapData = mapData;
global.fluidData = fluidData;
