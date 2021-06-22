import "@kitware/vtk.js/Rendering/Profiles/Geometry";
import "@kitware/vtk.js/macro.js";

import vtkFullScreenRenderWindow from "@kitware/vtk.js/Rendering/Misc/FullScreenRenderWindow";
import vtkActor from "@kitware/vtk.js/Rendering/Core/Actor";
import vtkMapper from "@kitware/vtk.js/Rendering/Core/Mapper";
import vtkCalculator from "@kitware/vtk.js/Filters/General/Calculator";
import vtkPolyData from "@kitware/vtk.js/Common/DataModel/PolyData.js";
import vtkPlaneSource from "@kitware/vtk.js/Filters/Sources/PlaneSource";
import { Representation } from "@kitware/vtk.js/Rendering/Core/Property/Constants";

import inputFile from "raw-loader!../resources/demo5.mod1";
import controlPanel from "./controlPanel.html";

// ----------------------------------------------------------------------------
// Standard rendering code setup
// ----------------------------------------------------------------------------

const fullScreenRenderer = vtkFullScreenRenderWindow.newInstance();
const renderer = fullScreenRenderer.getRenderer();
const renderWindow = fullScreenRenderer.getRenderWindow();

// ----------------------------------------------------------------------------
// Example code
// ----------------------------------------------------------------------------

const SIZE_MAP_X = 100;
const SIZE_MAP_Y = 100;
const SIZE_MAP_Z = 0;

const polyData = vtkPolyData.newInstance();

/* tests for custom import hard coded
var inputName = "demo1";
async function importModule() {
	const ret = await import(`raw-loader!../resources/${inputName}.mod1`);
	return ret;
}
*/

function parse_input() {
	const reg1 = new RegExp('".*"');
	const t1 = reg1.exec(inputFile); // prend tout ce qui est entre guillemets
	const t2 = t1[0].substr(1, t1[0].length - 2); // enleve 1er et dernier char : les guillemets

	console.log("input une fois traite pour ne garder que le content du file :");
	console.log(t2);


	const reg2 = new RegExp("^\([0-9]+,[0-9]+,[0-9]+\)$");

	let lineTab = t2.split("\\n");
	console.log(lineTab);
	for (let i = 0; i < lineTab.length; i++) {
		//console.log("lines : ", lineTab[i]);
		let pointsTab = lineTab[i].split(" ");
		//console.log("pointsTab", pointsTab);
		for (let j = 0; j < pointsTab.length - 1; j++) {
			if (pointsTab[j].match(reg2) !== null) console.log("match");
			else {
				console.error("STOP RIGHT THERE");
				console.log(pointsTab[j]);
			}
		}
	}
}

function calc_map_size() {}

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
	parse_input();
	//calc_map_size();
	generate_map();
}

main();

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
