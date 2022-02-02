import "@kitware/vtk.js/Rendering/Profiles/Geometry";
import "@kitware/vtk.js/macro.js";

import vtkFullScreenRenderWindow from "@kitware/vtk.js/Rendering/Misc/FullScreenRenderWindow";
import vtkActor from "@kitware/vtk.js/Rendering/Core/Actor";
import vtkMapper from "@kitware/vtk.js/Rendering/Core/Mapper";
import vtkSphereMapper from "@kitware/vtk.js/Rendering/Core/SphereMapper";
import vtkPolyData from "@kitware/vtk.js/Common/DataModel/PolyData.js";
import vtkCalculator from "@kitware/vtk.js/Filters/General/Calculator";
import vtkOutlineFilter from "@kitware/vtk.js/Filters/General/OutlineFilter";
import vtkColorTransferFunction from '@kitware/vtk.js/Rendering/Core/ColorTransferFunction';
import vtkDataSet from "@kitware/vtk.js/Common/DataModel/DataSet";
import vtkPointSource from '@kitware/vtk.js/Filters/Sources/PointSource';
const { ColorMode, ScalarMode } = vtkMapper;
const { FieldDataTypes } = vtkDataSet;


import * as ui from "./UI.js"
import controlPanel from "./controlPanel.html";
//import inputFile from "raw-loader!../resources/demosize.mod1";
import inputFile from "raw-loader!../resources/demoO.mod1";
//import inputFile from "raw-loader!../resources/demo1.mod1";
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
import * as ap from "./addDroplets.js"

// import perlin_map from "./perlinMap.js";
import generate_water_grid from "./generateStillWater.js";
import { display_water_particles,display_n_droplets, render_water, render_waters } from "./fluidUtilities";
import update_water from './updateWater.js';
import vtkSphere from '@kitware/vtk.js/Common/DataModel/Sphere';
import vtkSphereSource from '@kitware/vtk.js/Filters/Sources/SphereSource';

let ANIM_ITER = 30000;

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
	droplets: vtkPointSource.newInstance()
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

	let n = 3;
	ap.add_n_droplet(fluidData, mapData, n);

	console.log('after add 1 droplet ');
	console.log('pos :', fluidData.fluid_array[0].pos);
	console.log("old_pos :", fluidData.fluid_array[0].old_pos);
	console.log(fluidData.fluid_array);
	display_n_droplets(fluidData, waterPolyData);

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

function test_spheres() {
	let test = vtkSphereSource.newInstance();
	let coords = [fluidData.fluid_array[0].pos.x, fluidData.fluid_array[0].pos.y, fluidData.fluid_array[0].pos.z];
//	console.log(coords);
	test.setCenter(coords);
	test.setRadius(1);
	return test;
}

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
//
const waterActor = vtkActor.newInstance();
const waterSActor = vtkActor.newInstance();
const waterSMapper = vtkSphereMapper.newInstance(/*{
	interpolateScalarsBeforeMapping: true,
  colorMode: ColorMode.DEFAULT,
  scalarMode: ScalarMode.DEFAULT,
  useLookupTableScalarRange: true,
  lookupTable,
}*/);
const waterMapper = vtkMapper.newInstance();

display_n_droplets(fluidData, waterPolyData);
//waterMapper.setInputData(waterPolyData);

const waterFilter = vtkCalculator.newInstance();
const waterSFilter = vtkCalculator.newInstance({
  getArrays: (inputDataSets) => ({
    input: [{ location: FieldDataTypes.COORDINATE }], // Require point coordinates as input
    output: [
      // Generate two output arrays:
      {
        location: FieldDataTypes.POINT, // This array will be point-data ...
        name: 'pressure', // ... with the given name ...
        dataType: 'Float32Array', // ... of this type ...
        numberOfComponents: 1, // ... with this many components ...
      },
      {
        location: FieldDataTypes.POINT, // This array will be field data ...
        name: 'temperature', // ... with the given name ...
        dataType: 'Float32Array', // ... of this type ...
        attribute: AttributeTypes.SCALARS, // ... and will be marked as the default scalars.
        numberOfComponents: 1, // ... with this many components ...
      },
    ],
  }),
  evaluate: (arraysIn, arraysOut) => {
    // Convert in the input arrays of vtkDataArrays into variables
    // referencing the underlying JavaScript typed-data arrays:
    const [coords] = arraysIn.map((d) => d.getData());
    const [press, temp] = arraysOut.map((d) => d.getData());

    // Since we are passed coords as a 3-component array,
    // loop over all the points and compute the point-data output:
    for (let i = 0, sz = coords.length / 3; i < sz; ++i) {
      press[i] =
        ((coords[3 * i] - 0.5) * (coords[3 * i] - 0.5) +
          (coords[3 * i + 1] - 0.5) * (coords[3 * i + 1] - 0.5) +
          0.125) *
        0.1;
      temp[i] = coords[3 * i + 1];
    }
    // Mark the output vtkDataArray as modified
    arraysOut.forEach((x) => x.modified());
  },
}
);

waterSMapper.setRadius(10);
waterSActor.getProperty().setPointSize(1);
let test = test_spheres();
	//waterFilter.setInputData(waterPolyData);


//waterActor.setMapper(waterMapper);
waterFilter.setFormulaSimple(
	FieldDataTypes.POINT, // Generate an output array defined over points.
	[], // We don't request any point-data arrays because point coordinates are made available by default.
	"z", // Name the output array "z"
	//(x) => (x[0] - 0.5) * (x[0] - 0.5) + (x[1] - 0.5) * (x[1] - 0.5) + 0.125
	() => 4
); // Our formula for z
//waterSFilter.

//waterFilter.setInputConnection(waterPolyData);
//waterMapper.setInputConnection(waterPolyData);

//waterFilter.setInputConnection(test.getOutputPort());
//waterMapper.setInputConnection(waterFilter.getOutputPort());


render_water(test, waterMapper, waterActor, waterFilter, renderer);
render_waters(waterPolyData, waterSMapper, waterSActor, waterSFilter, renderer);
// ! water ! //


// add objects to scene, move camera and render
renderer.addActor(mapActor);
renderer.addActor(outlineActor);
renderer.addActor(waterActor);
renderer.addActor(waterSActor);
renderer.getActiveCamera().elevation(300);
renderer.getActiveCamera().computeDistance();
renderer.resetCamera();
renderWindow.render();
//actor.getProperty().setWireframe(true);



window.setInterval(function(){
	waterPolyData = vtkPolyData.newInstance();
	fluidData.anim_time += 1;

	if (fluidData.anim_time < ANIM_ITER)
		update_water(fluidData, mapData);
	display_n_droplets(fluidData,waterPolyData);
	let test = test_spheres();

	render_water(test, waterMapper, waterActor, waterFilter, renderer);
	render_waters(waterPolyData, waterSMapper, waterSActor, waterSFilter, renderer);
	renderWindow.render();
}, 1);


global.renderWindow = renderWindow;
global.fullScreenRenderer = fullScreenRenderer;
global.renderer = renderer;
global.mapActor = mapActor;
global.mapMapper = mapMapper;
global.waterActor = waterActor;
global.waterMapper = waterMapper;
global.waterSActor = waterSActor;
global.wateSrMapper = waterSMapper;
global.waterPolyData = waterPolyData;
global.waterFilter = waterFilter;
global.polyData = polyData;
global.mapData = mapData;
global.fluidData = fluidData;
