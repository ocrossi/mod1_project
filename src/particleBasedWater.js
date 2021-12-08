/**
 * References
 *
 * https://www.cs.ubc.ca/~rbridson/fluidsimulation/fluids_notes.pdf
 * https://matthias-research.github.io/pages/publications/hfFluid.pdf
 */

class HeightMap {
    /**
     * 2D height-map
     * @param {number} dim_x Width
     * @param {number} dim_y Length
     * @param {number} base_height Initial height
     */
    constructor(dim_x, dim_y, base_height) {
        // Set base height to 0 by default
        base_height = (typeof b !== 'undefined') ? b : 0;

        // Set dimensions
        this.dim.x = dim_x;
        this.dim.y = dim_y;
        
        // Allocate data
        this.data = new Array(dim_x * dim_y);

        // Init to base height
        Arrays.fill(this.data, base_height);
    }
}


class Fluid {
    /**
     * Fluid Properties
     * @param {number} density The fluid's density in kg / m^3
     * @param {number} viscosity The fluid's viscosity factor
     * @param {number} derivative_op The fluid's material derivative operator
     */
    constructor(density, viscosity, derivative_op) {
        this.density = density;
        this.viscosity = viscosity;
        this.derivative_op = derivative_op;
    }
}

class Water extends Fluid {
    /**
     * Water properties
     * 
     * density: 1000
     * derivative_operator: TODO
     */
    constructor() {
        super(1000, 1);
    }
}

class FluidSimulator {
    /**
     * Abstract Fluid Simulator
     * @param {Fluid} fluid Fluid properties
     * @param {number} g Gravity acceleration in m / s
     */
    constructor(fluid, g) {
        if (this.constructor === FluidSimulator) {
            throw new TypeError('Abstract class "FluidSimulator" cannot be instantiated directly');
        }

        this.fluid = fluid;

        // Default to earth's gravity acceleration
        this.g = (typeof g !== 'undefined') ? g : -9.81;
    }

    /**
     * Simulate the fluid's surface after a time step.
     * @param {number} delta_time The duration of the time step.
     */
    simulate(_delta_time) {
        throw new Error('You must implement this function');
    }

    get_actor() {
        throw new Error('You must implement this function');
    }
}

class HeightMapFluidSimulator extends FluidSimulator {
    /**
     * Height Map based Fluid Simulator
     * @param {number} dim_x Surface width
     * @param {number} dim_y Surface length
     * @param {Fluid} fluid Fluid properties
     * @param {number} g Gravity acceleration in m / s
     */
    constructor(dim_x, dim_y, fluid, g) {
        super(fluid, g);

        // Initialize the fluid surface.
        this.surface = new HeightMap(dim_x, dim_y);
    }


    /** Algorithm steps
     * 1. Simulate height field fluid, taking external forces and boundaries into account.
     * 2. Simulate the solids.
     * 3. Take forces of the solids against the water into account.
     * 4. Generate particles to replace busy regions.
     * 5. Simulate and remove particles fallen onto the height field.
     * 6. Render the height field with an additional displacement map for waves smaller than the resolution permits. 
     * 7. Render splash particles.
    */


    /**
     *  Simulate height field fluid, taking external forces and boundaries into account.
     * @param {number} delta_time The duration of the time step. 
    */
    simulate_height_field(delta_time) {
        // Employ the SWE to a height-field of the liquid surface.

        // Using explicit intergration we can skip the iterative method.
        // We can discretize the simulation domain with a grid 

    }
    

    simulate() {
        simulate_height_field()
    }
}
