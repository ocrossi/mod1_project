export class Vector3 {
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

	multiply_this(v) {
		this.x = this.x * v.x;
		this.y = this.y * v.y;
		this.z = this.z * v.z;

	}

	multiply(v) {
		return new Vector3(v.x * this.x, v.y * this.y, v.z * this.z);
	}
	
	divide_scalar(scalar) {
		return new Vector3(this.x / scalar, this.y / scalar, this.z / scalar);
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

export class Ball {
	// pos & old_pos class Vector3
	constructor(pos, old_pos, radius, vel, mass) {
//		console.log(pos);
//		console.log(old_pos);
//		console.log(vel);
		this.pos = pos;
		this.old_pos = old_pos;
		this.radius = radius;
		this.vel = vel;
		this.mass = mass;
	}
}
