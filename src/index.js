import "@kitware/vtk.js/Rendering/Profiles/Geometry";
import "@kitware/vtk.js/macro.js";

import vtkFullScreenRenderWindow from "@kitware/vtk.js/Rendering/Misc/FullScreenRenderWindow";
import vtkActor from "@kitware/vtk.js/Rendering/Core/Actor";
import vtkMapper from "@kitware/vtk.js/Rendering/Core/Mapper";
import vtkPolyData from "@kitware/vtk.js/Common/DataModel/PolyData.js";
import vtkPlaneSource from "@kitware/vtk.js/Filters/Sources/PlaneSource";
import { Representation } from "@kitware/vtk.js/Rendering/Core/Property/Constants";

import vtkCalculator from "@kitware/vtk.js/Filters/General/Calculator";
import vtkOutlineFilter from "@kitware/vtk.js/Filters/General/OutlineFilter";
import vtkColorTransferFunction from '@kitware/vtk.js/Rendering/Core/ColorTransferFunction';
import { AttributeTypes } from "@kitware/vtk.js/Common/DataModel/DataSetAttributes/Constants";
import vtkLookupTable from "@kitware/vtk.js/Common/Core/LookupTable";
import vtkDataSet from "@kitware/vtk.js/Common/DataModel/DataSet";
const { ColorMode, ScalarMode } = vtkMapper;
const { FieldDataTypes } = vtkDataSet;

import controlPanel from "./controlPanel.html";

import inputFile from "raw-loader!../resources/demo5.mod1";

import parse_input from "./parsing.js";
import generate_map from "./generateMap.js";
import set_size_map from "./setMap.js";
import add_points from "./addPoints.js";

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

let mapData = {
	size_map: 0,
	brushFallOff: 0.2, 
	bounds_multiplier: 1,
	max_height: 0,
	size_multiplier: 1,
	size_max: 1000000000,
	points: new Array(),
	input: "",
};

function main() {
	mapData.input = inputFile;

	if (parse_input(mapData) === false) {
		console.error("input parsing failure");
		return;
	}
	set_size_map(mapData);
	generate_map(mapData, polyData);
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

// color table
const lookupTable = vtkColorTransferFunction.newInstance();
lookupTable.addRGBPoint(0, 1.0, 1.0, 0.0); // yellow
lookupTable.addRGBPoint(1, 0.0, 1.0, 0.0); //green
lookupTable.addRGBPoint(2, 0.5, 0.37, 0.3); //brown
lookupTable.addRGBPoint(3, 1, 1, 1); //white
lookupTable.build();

const mapper = vtkMapper.newInstance({
	interpolateScalarsBeforeMapping: true,
	colorMode: ColorMode.DEFAULT,
	scalarMode: ScalarMode.DEFAULT,
	useLookupTableScalarRange: true,
	lookupTable,
});
const actor = vtkActor.newInstance();
actor.setMapper(mapper);

const simpleFilter = vtkCalculator.newInstance();
simpleFilter.setFormulaSimple(
	FieldDataTypes.POINT, // Generate an output array defined over points.
	[], // We don't request any point-data arrays because point coordinates are made available by default.
	"z", // Name the output array "z"
	//(x) => (x[0] - 0.5) * (x[0] - 0.5) + (x[1] - 0.5) * (x[1] - 0.5) + 0.125
	(x) => map_color(x)
); // Our formula for z

simpleFilter.setInputData(polyData);
mapper.setInputConnection(simpleFilter.getOutputPort());

const outlineFilter = vtkOutlineFilter.newInstance();
outlineFilter.setInputData(polyData);
const outlineMapper = vtkMapper.newInstance();
const outlineActor = vtkActor.newInstance();

outlineMapper.setInputConnection(outlineFilter.getOutputPort());
outlineActor.setMapper(outlineMapper);

renderer.addActor(actor);
renderer.addActor(outlineActor);
renderer.getActiveCamera().elevation(300);
renderer.getActiveCamera().computeDistance();
renderer.resetCamera();
renderWindow.render();
//actor.getProperty().setWireframe(true);

global.renderWindow = renderWindow;
global.fullScreenRenderer = fullScreenRenderer;
global.renderer = renderer;
global.actor = actor;
global.mapper = mapper;
global.polyData = polyData;
global.mapData = mapData;
