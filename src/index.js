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

const planeSource = vtkPlaneSource.newInstance();


function fillPolyData() {
	var polyData  = vtkPolyData.newInstance();
	var nbPoints = 3 * 1;
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

	return polyData;
}

const polyData = fillPolyData();



const mapper = vtkMapper.newInstance();
//mapper.setInputConnection(planeSource.getOutputPort());

mapper.setInputData(polyData);



const actor = vtkActor.newInstance();

actor.getProperty().setRepresentation(Representation.WIREFRAME);

actor.setMapper(mapper);

renderer.addActor(actor);
renderer.resetCamera();
renderWindow.render();

global.polyData = polyData;
global.planeSource = planeSource;
console.log("hoho");
