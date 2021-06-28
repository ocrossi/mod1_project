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

import parse_input from "./parsing.js";
import generate_map from "./generateMap.js";
import set_size_map from "./setMap.js";

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


function main() {
	let mapData = {
		size_map: 0,
		bounds_multiplier: 1,
		size_multiplier: 1,
		size_max: 1000000000,
		points: new Array(),
		input: "",
	};
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

const mapper = vtkMapper.newInstance();
mapper.setInputData(polyData);

const actor = vtkActor.newInstance();
// actor.getProperty().setRepresentation(Representation.WIREFRAME);

actor.setMapper(mapper);

renderer.addActor(actor);
renderer.resetCamera();
renderWindow.render();

global.renderWindow = renderWindow;
global.fullScreenRenderer = fullScreenRenderer;
global.renderer = renderer;
global.polyData = polyData;
