import * as vtkMath from '@kitware/vtk.js/Common/Core/Math/';


class Vector3 {
	  constructor(x, y, z) {
    this.x = x;
    this.y = y;
		this.z = z;
  }

  magnitude_squared() {
    return this.x * this.x + this.y * this.y + this.z * this.z;
  }

  magnitude() {
    return Math.sqrt(this.magnitude_squared());
  }

  unit_vector() {
    return new Vector3(this.x / this.magnitude(), this.y / this.magnitude(), this.z / this.magnitude());
  }

  add(v) {
    return new Vector3(this.x + v.x, this.y + v.y, this.z + v.z);
  }

  add_to_this(v) {
    this.x = this.x + v.x;
    this.y = this.y + v.y;
    this.z = this.z + v.z;
  }

  subtract(v) {
    return new Vector3(this.x - v.x, this.y - v.y, this.z - v.z);
  }

  subtract_from_this(v) {
    this.x = this.x - v.x;
    this.y = this.y - v.y;
    this.z = this.z - v.z;
  }

  scale(scalar) {
    return new Vector3(scalar * this.x, scalar * this.y, scalar * this.z);
  }

  scale_this(scalar) {
    this.x = scalar * this.x;
    this.y = scalar * this.y;
    this.z = scalar * this.z;
  }

  set_to(v) {
    this.x = v.x;
    this.y = v.y;
    this.z = v.z;
  }

  set_to_zero() {
    this.x = 0;
    this.y = 0;
    this.z = 0;
  }

  rotate_about(v, angle) {
    let x, y, z;
    x = v.x + (this.x - v.x) * Math.cos(angle) - (this.y - v.y) * Math.sin(angle);
    y = v.y + (this.x - v.x) * Math.sin(angle) + (this.y - v.y) * Math.cos(angle);
    z = v.z + (this.x - v.x) * Math.sin(angle) + (this.z - v.z) * Math.cos(angle);
		return new Vector3(x, y, z);
  }

  distance_from_squared(v) {
    return (v.x - this.x) * (v.x - this.x) + (v.y - this.y) * (v.y - this.y) + (v.z - this.z) * (v.z - this.z);
  }

  distance_from(v) {
    return Math.sqrt(this.distance_from_squared(v));
  }
}

class AbstractWorldElement {

  constructor() {
    // The length of time that the world element has been in existence (number of simulation steps)
    this.age = 0;
    // The age at which the world element will be deleted, null if infinite life
    this.lifetime = null;
  }

  // Check to see whether the age of a world element has reached its life
  has_life_expired() {
    if ((this.lifetime !== null) && (this.age >= this.lifetime)) {
      return true;
    } else {
      return false;
    }
  }

}

// Particle class
class Particle extends AbstractWorldElement {

  constructor(px, py, pz, vx, vy, vz, ax, ay, az, fx, fy, fz, mass, radius, fixed) {
    super();
    // The mass of the particle
    this.mass = mass;
    this.inv_mass = 1 / mass;
    // The radius of the particle
    this.radius = radius;
    // This property defines whether the particle is allowed to move
    this.fixed = fixed;
    // A vector representing the current position of the particle
    this.pos = new Vector3(px, py, pz);
    // A vector representing the previous position of the particle (necessary for Verlet integration)
    this.pos_previous = new Vector3(px, py, pz);
    // A vector representing the current velocity of the particle (can also be determined implicitly from pos and prev_pos)
    his.vel = new Vector3(vx, vy, vz);
    // A vector representing the current acceleration of the particle (necessary for Verlet integration)
    this.acc = new Vector3(ax, ay, az);
    // A vector representing the net force acting on the particle
    this.force = new Vector3(fx, fy, fz); // Note: this is actually not being used at this time
    // Temporary integration variable (slight optimisation)
    this.temp_pos = new Vector3(px, py);
    // Represents whether a particle is permitted to collide with anything
    this.collides = true;
    // The lifetime of the particle
    this.lifetime = null;
    // Co-efficient of restitution (particle-boundary)
    this.coefficient_of_restitution = 0.3;
    // Indicates whether the particle is a SPH fluid particle
    this.SPH_particle = false;
    // List of SPH fluid neighbours
    this.SPH_neighbours = [];
    // Interpolated density at SPH fluid particle
    this.SPH_density = 0;
  }

  integrate(time_step) {
    if (!this.fixed) {
      // Verlet integration based on mutable vector operations
      this.force.scale_this(this.inv_mass);
      this.acc.add_to_this(this.force);
      this.temp_pos.x = this.pos.x;
      this.temp_pos.y = this.pos.y;
      this.temp_pos.z = this.pos.z;
      this.acc.scale_this(time_step * time_step);
      this.acc.subtract_from_this(this.pos_previous);
      this.acc.add_to_this(this.pos);
      this.acc.add_to_this(this.pos);
      this.pos.set_to(this.acc);
      this.pos_previous.set_to(this.temp_pos);
    }
  }

  calculate_velocity(time_step) {
    this.vel = (this.pos.subtract(this.pos_previous)).scale(1 / time_step);
  }

}

class AbstractConstraint extends AbstractWorldElement {

  constructor() {
    super();
    // Defines whether the constraint can be broken
    this.breakable = false;
    // The maximum allowable breaking strain of the constraint
    this.breaking_strain = 2.0;
  }

  has_broken() {
    return false;
  }

}

class DistanceConstraint extends AbstractConstraint {

  constructor(p1, p2, distance, stiffness) {
    super();
    this.p1 = p1;
    this.p2 = p2;
    this.distance = distance;
    this.stiffness = stiffness;
    this.current_distance = this.p2.pos.distance_from(this.p1.pos);
  }

  enforce(constraint_solver_iterations) {
    let adjusted_stiffness,
      delta,
      deltad,
      deltad1,
      deltad2,
      direction_unit_vector;
    this.current_distance = this.p2.pos.distance_from(this.p1.pos);
    if (this.current_distance !== this.distance) {
      delta = this.current_distance - this.distance;
      adjusted_stiffness = 1 - Math.pow(1 - this.stiffness, 1 / constraint_solver_iterations);
      deltad = (this.current_distance - this.distance) * adjusted_stiffness;
      direction_unit_vector = new Vector3(this.p2.pos.x - this.p1.pos.x, this.p2.pos.y - this.p1.pos.y, this.p2.pos.z - this.p1.pos.z).unit_vector();
      if (this.p2.fixed && !this.p1.fixed) {
        this.p1.pos = this.p1.pos.add(direction_unit_vector.scale(deltad));
      } else if (this.p1.fixed && !this.p2.fixed) {
        this.p2.pos = this.p2.pos.add(direction_unit_vector.scale(-deltad));
      } else if (!this.p2.fixed && !this.p1.fixed) {
        deltad1 = deltad * this.p1.mass / (this.p1.mass + this.p2.mass);
        deltad2 = deltad * this.p2.mass / (this.p1.mass + this.p2.mass);
        this.p1.pos = this.p1.pos.add(direction_unit_vector.scale(deltad2));
        this.p2.pos = this.p2.pos.add(direction_unit_vector.scale(-deltad1));
      }
    }

  }

  has_broken() {
    let delta,
      strain;
    if (this.breakable) {
      delta = this.current_distance - this.distance;
      strain = Math.abs(delta) / this.distance;
      if (strain > this.breaking_strain) {
        return true;
      }
    } else {
      return false;
    }
  }
}

class ParticleContactConstraint extends DistanceConstraint {

  constructor(p1, p2) {
    super(p1, p2, p1.radius + p2.radius, 1.0);
    this.lifetime = this.age;
    this.stiffness = 0.9;
  }

  enforce(constraint_solver_iterations) {
    let adjusted_stiffness,
      delta,
      deltad,
      deltad1,
      deltad2,
      direction_unit_vector;
    this.current_distance = this.p2.pos.distance_from(this.p1.pos);
    // Model as an inequality constraint, i.e. only enforce if the distance is less than the constraint distance
    if (this.current_distance <= this.distance) {
      delta = this.current_distance - this.distance;
      adjusted_stiffness = 1 - Math.pow(1 - this.stiffness, 1 / constraint_solver_iterations);
      deltad = (this.current_distance - this.distance) * adjusted_stiffness;
      direction_unit_vector = new Vector3(this.p2.pos.x - this.p1.pos.x, this.p2.pos.y - this.p1.pos.y, this.p2.pos.z - this.p1.pos.z).unit_vector();
      if (this.p2.fixed && !this.p1.fixed) {
        this.p1.pos = this.p1.pos.add(direction_unit_vector.scale(deltad));
      } else if (this.p1.fixed && !this.p2.fixed) {
        this.p2.pos = this.p2.pos.add(direction_unit_vector.scale(-deltad));
      } else if (!this.p2.fixed && !this.p1.fixed) {
        deltad1 = deltad * this.p1.mass / (this.p1.mass + this.p2.mass);
        deltad2 = deltad * this.p2.mass / (this.p1.mass + this.p2.mass);
        this.p1.pos = this.p1.pos.add(direction_unit_vector.scale(deltad2));
        this.p2.pos = this.p2.pos.add(direction_unit_vector.scale(-deltad1));
      }
    }
  }

}

class PointConstraint extends AbstractConstraint {

  constructor(p1, x, y, z, stiffness) {
    super();
    this.p1 = p1;
    this.stiffness = stiffness;
    this.anchor = new Vector3(x, y, z);
  }

  enforce(constraint_solver_iterations) {
    let adjusted_stiffness,
      current_distance,
      deltad,
      direction_unit_vector,
      strain;
    current_distance = this.p1.pos.distance_from(this.anchor);
    if (current_distance !== 0) {
      adjusted_stiffness = 1 - Math.pow(1 - this.stiffness, 1 / constraint_solver_iterations);
      deltad = current_distance * adjusted_stiffness;
      direction_unit_vector = new Vector3(this.p1.pos.x - this.anchor.x, this.p1.pos.y - this.anchor.y, this.p1.pos.z - this.p1.anchor.z).unit_vector();
      this.p1.pos = this.p1.pos.add(direction_unit_vector.scale(-deltad));
    }
  }

  has_broken() {
    let current_distance = this.p1.pos.distance_from(this.anchor);
    if (current_distance !== 0) {
      let strain = Math.abs(current_distance);
      if (this.breakable && (strain > this.breaking_strain)) {
        return true;
      }
    }

  }

}

class Grid {

  constructor(grid_size, length, height, mapData, fluidData) {
    this.grid_size = grid_size;
		//this.grid_size = mapData.unit_length;
		this.height = height;
		//this.height = mapData.height ??;
    this.grid_size_squared = this.grid_size * this.grid_size;
    //this.grid_count_x = Math.ceil(length / this.grid_size); // rate le tableau d etage est en 1d
    this.grid_count_x = mapData.size_map; // rate le tableau d etage est en 1d
    //this.grid_count_y = Math.ceil(length / this.grid_size);
    this.grid_count_y = mapData.size_map;
		//this.grid_count_z = Math.ceil(height / this.height)
		this.grid_count_z = fluidData.map_topo.length;
		this.elements = fluidData.map_topo;
		//for (let i = 0; i < )

		/*
		this.elements = [];
    for (let i = 0; i < this.grid_count_x; i++) {
      this.elements[i] = new Array(this.grid_count_y);
      for (let j = 0; j < this.grid_count_y; j++) {
        this.elements[i][j] = { particles: [], size: 0 };
      }
    }
		*/
  }

	// il faut transformer le map_topo en tableau 3D, ce sera bcp plus factile pr la suite
  add_item(particle) {
    //let grid_index_x = Math.floor(particle.pos.x / this.grid_size);
    //let grid_index_y = Math.floor(particle.pos.y / this.grid_size);
		let grid_idx_floor = Math.floor(particle.pos_x) * (this.grid_count_x) + Math.floor(particle.pos_y);
		let grid_idx_height = particle.pos_z;

		//let grid_index_z = Math.floor(particle.pos_z / this.height);
		let grid_index_z = Math.floor(particle.pos_z);
    // cdo to force particles in the grid
		if (typeof this.elements[grid_idx_height][grid_idx_floor] ===  'number' && this.elements[grid_index_x][grid_index_y][grid_index_z] === 3)
			console.log('probelm add item dans une cellule terrain plein');
/*
		if (grid_index_x < 0) {
      grid_index_x = 0;
    } else if (grid_index_x > (this.grid_count_x - 1)) {
      grid_index_x = this.grid_count_x - 1;
    }
    if (grid_index_y < 0) {
      grid_index_y = 0;
    }
    else if (grid_index_y > (this.grid_count_y - 1)) {
      grid_index_y = this.grid_count_y - 1;
    }
		if (grid_index_z < 0) {
			grid_index_z = 0;
		}
		else if (grid_index_z < (this.grid_count_z - 1))
			grid_index_z = this.grid_count_z - 1;
 */
		if (grid_idx_floor < 0)
			grid_idx_floor

		if (this.elements[grid_index_x][grid_index_y][grid_index_z].particles.length < this.elements[grid_index_x][grid_index_y][grid_index_z].size) {
      this.elements[grid_index_x][grid_index_x][grid_index_z].particles.push(particle);
    } else {
      this.elements[grid_index_x][grid_index_y][grid_index_z].particles[this.elements[grid_index_x][grid_index_y][grid_index_z].size] = particle;
    }
    this.elements[grid_index_x][grid_index_y][grid_index_z].size = this.elements[grid_index_x][grid_index_y][grid_index_z].size + 1;
  }

  clear() {
    for (let i = 0; i < this.grid_count_z; i++) {
      for (let j = 0; j < this.grid_size_squared; j++) {
				if (typeof this.elements[i][j] === 'object')
					this.elements[i][j].size = 0; // Don't clear array, just overwrite and keep track of virtual end of array
      }
    }
  }

  retrieve_items(p) {
    let x = Math.floor(p.pos.x / this.grid_size);
    let y = Math.floor(p.pos.y / this.grid_size);
    if (x < 0) {
      x = 0;
    } else if (x > (this.grid_count_x - 1)) {
      x = this.grid_count_x - 1;
    }
    if (y < 0) {
      y = 0;
    } else if (y > (this.grid_count_y - 1)) {
      y = this.grid_count_y - 1;
    }
    for (let i = 0; i < this.elements[x][y].size; i++) {
      let distance_apart_squared = Math.pow(p.pos.x - this.elements[x][y].particles[i].pos.x, 2) + Math.pow(p.pos.y - this.elements[x][y].particles[i].pos.y, 2);
      if (distance_apart_squared < this.grid_size_squared) {
        p.SPH_neighbours.push(this.elements[x][y].particles[i]);
      }
    }
    let x_limit_min = (x == 0);
    let x_limit_max = (x == (this.grid_count_x - 1));
    let y_limit_min = (y == 0);
    let y_limit_max = (y == (this.grid_count_y - 1));
    if (!x_limit_min) {
      for (let i = 0; i < this.elements[x - 1][y].size; i++) {
        let distance_apart_squared = Math.pow(p.pos.x - this.elements[x - 1][y].particles[i].pos.x, 2) + Math.pow(p.pos.y - this.elements[x - 1][y].particles[i].pos.y, 2);
        if (distance_apart_squared < this.grid_size_squared) {
          p.SPH_neighbours.push(this.elements[x - 1][y].particles[i]);
        }
      }
    }
    if (!x_limit_max) {
      for (let i = 0; i < this.elements[x + 1][y].size; i++) {
        let distance_apart_squared = Math.pow(p.pos.x - this.elements[x + 1][y].particles[i].pos.x, 2) + Math.pow(p.pos.y - this.elements[x + 1][y].particles[i].pos.y, 2);
        if (distance_apart_squared < this.grid_size_squared) {
          p.SPH_neighbours.push(this.elements[x + 1][y].particles[i]);
        }
      }
    }
    if (!y_limit_min) {
      for (let i = 0; i < this.elements[x][y - 1].size; i++) {
        let distance_apart_squared = Math.pow(p.pos.x - this.elements[x][y - 1].particles[i].pos.x, 2) + Math.pow(p.pos.y - this.elements[x][y - 1].particles[i].pos.y, 2);
        if (distance_apart_squared < this.grid_size_squared) {
          p.SPH_neighbours.push(this.elements[x][y - 1].particles[i]);
        }
      }
    }
    if (!y_limit_max) {
      for (let i = 0; i < this.elements[x][y + 1].size; i++) {
        let distance_apart_squared = Math.pow(p.pos.x - this.elements[x][y + 1].particles[i].pos.x, 2) + Math.pow(p.pos.y - this.elements[x][y + 1].particles[i].pos.y, 2);
        if (distance_apart_squared < this.grid_size_squared) {
          p.SPH_neighbours.push(this.elements[x][y + 1].particles[i]);
        }
      }
    }
    if (!y_limit_max && !x_limit_max) {
      for (let i = 0; i < this.elements[x + 1][y + 1].size; i++) {
        let distance_apart_squared = Math.pow(p.pos.x - this.elements[x + 1][y + 1].particles[i].pos.x, 2) + Math.pow(p.pos.y - this.elements[x + 1][y + 1].particles[i].pos.y, 2);
        if (distance_apart_squared < this.grid_size_squared) {
          p.SPH_neighbours.push(this.elements[x + 1][y + 1].particles[i]);
        }
      }
    }
    if (!y_limit_min && !x_limit_max) {
      for (let i = 0; i < this.elements[x + 1][y - 1].size; i++) {
        let distance_apart_squared = Math.pow(p.pos.x - this.elements[x + 1][y - 1].particles[i].pos.x, 2) + Math.pow(p.pos.y - this.elements[x + 1][y - 1].particles[i].pos.y, 2);
        if (distance_apart_squared < this.grid_size_squared) {
          p.SPH_neighbours.push(this.elements[x + 1][y - 1].particles[i]);
        }
      }
    }
    if (!y_limit_min && !x_limit_min) {
      for (let i = 0; i < this.elements[x - 1][y - 1].size; i++) {
        let distance_apart_squared = Math.pow(p.pos.x - this.elements[x - 1][y - 1].particles[i].pos.x, 2) + Math.pow(p.pos.y - this.elements[x - 1][y - 1].particles[i].pos.y, 2);
        if (distance_apart_squared < this.grid_size_squared) {
          p.SPH_neighbours.push(this.elements[x - 1][y - 1].particles[i]);
        }
      }
    }
    if (!y_limit_max && !x_limit_min) {
      for (let i = 0; i < this.elements[x - 1][y + 1].size; i++) {
        let distance_apart_squared = Math.pow(p.pos.x - this.elements[x - 1][y + 1].particles[i].pos.x, 2) + Math.pow(p.pos.y - this.elements[x - 1][y + 1].particles[i].pos.y, 2);
        if (distance_apart_squared < this.grid_size_squared) {
          p.SPH_neighbours.push(this.elements[x - 1][y + 1].particles[i]);
        }
      }
    }
  }
}
