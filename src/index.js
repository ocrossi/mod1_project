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

import controlPanel from "./controlPanel.html";
import inputFile from "raw-loader!../resources/demo5.mod1";
//import inputFile from "raw-loader!../resources/demolimittesting.mod1";
//import inputFile from "raw-loader!../resources/demosimpleaf.mod1";

import parse_input from "./parsing.js";
import set_size_map from "./setMap.js";
import compute_hills_size from './computeHillsSize.js'
import generate_heat_map from './generateHeatMap.js';
import generate_map from "./generateScaleMap.js";
import perlin_map from "./perlinMap.js";
import generate_water_grid from "./generateStillWater.js";
import { display_water } from "./fluidUtilities";

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

const polyData = vtkPolyData.newInstance();
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
	res_offset: 1,
	resolution_max: 199,
	bounds_multiplier: 1,
	max_height: 0,
	size_multiplier: 1,
	size_max: 1000000,
	points: new Array(),
	closest_points: new Array(), // no need to define here, memory mismanagment
	heat_map: new Array(), // no need
	input: "", // only for parsing, could be destroyed afterwards
	unit_length: 1, // voxel length compared to coordinates system
	res_flag: false,
	combine_heats: false,
	square_flattening: false,
	sigmoid_flattening: false,
};

function main() {
	mapData.input = inputFile;

	if (parse_input(mapData) === false) {
		console.error("input parsing failure");
		return;
	}
	set_size_map(mapData);
	compute_hills_size(mapData);
	generate_heat_map(mapData);
	generate_map(mapData, polyData);
	generate_water_grid(mapData, fluidData);
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

// sets colors to height map
function map_color(x) {
	if (x[2] < 1)
		return 0;
	if (x[2] < 10)
		return 1;
	if (x[2] < 20)
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

waterActor.setMapper(waterMapper);
const waterFilter = vtkCalculator.newInstance();

waterFilter.setFormulaSimple(
	FieldDataTypes.POINT, // Generate an output array defined over points.
	[], // We don't request any point-data arrays because point coordinates are made available by default.
	"z", // Name the output array "z"
	//(x) => (x[0] - 0.5) * (x[0] - 0.5) + (x[1] - 0.5) * (x[1] - 0.5) + 0.125
	(x) => 4
); // Our formula for z

waterFilter.setInputData(waterPolyData);
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

/*
var intervalId = window.setInterval(function(){
	waterPolyData = vtkPolyData.newInstance();
	fluidData.anim_time += 1;
	console.log("anim_time :", fluidData.anim_time);
	display_water(fluidData, waterPolyData);
	renderer.addActor(waterActor);

	waterFilter.setInputData(waterPolyData);
	waterMapper.setInputConnection(waterFilter.getOutputPort());
	renderWindow.render();
}, 1000);
*/

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
