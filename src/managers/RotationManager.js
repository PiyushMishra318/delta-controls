import { Matrix4, Spherical, Vector3 } from "math-ds";

/**
 * Two PI.
 *
 * @type {Number}
 * @private
 */

const TWO_PI = Math.PI * 2;

/**
 * A vector.
 *
 * @type {Vector3}
 * @private
 */

const v = new Vector3();

/**
 * A matrix.
 *
 * @type {Matrix4}
 * @private
 */

const m = new Matrix4();

/**
 * A rotation manager.
 */

export class RotationManager {

	/**
	 * Constructs a new rotation manager.
	 *
	 * @param {Vector3} position - A position.
	 * @param {Quaternion} quaternion - A quaternion.
	 * @param {Vector3} target - A target.
	 * @param {Settings} settings - The settings.
	 */

	constructor(position, quaternion, target, settings) {

		/**
		 * The position that will be modified.
		 *
		 * @type {Vector3}
		 * @private
		 */

		this.position = position;

		/**
		 * The quaternion that will be modified.
		 *
		 * @type {Quaternion}
		 * @private
		 */

		this.quaternion = quaternion;

		/**
		 * A target.
		 *
		 * @type {Vector3}
		 * @private
		 */

		this.target = target;

		/**
		 * The settings.
		 *
		 * @type {Settings}
		 * @private
		 */

		this.settings = settings;

		/**
		 * A spherical coordinate system.
		 *
		 * @type {Spherical}
		 */

		this.spherical = new Spherical();

	}

	/**
	 * Sets the position.
	 *
	 * @param {Vector3} position - A position.
	 * @return {RotationManager} This manager.
	 */

	setPosition(position) {

		this.position = position;

		return this;

	}

	/**
	 * Sets the quaternion.
	 *
	 * @param {Quaternion} quaternion - A quaternion.
	 * @return {RotationManager} This manager.
	 */

	setQuaternion(quaternion) {

		this.quaternion = quaternion;

		return this;

	}

	/**
	 * Sets the target.
	 *
	 * @param {Vector3} target - A target.
	 * @return {RotationManager} This manager.
	 */

	setTarget(target) {

		this.target = target;

		return this;

	}

	/**
	 * Updates the quaternion.
	 *
	 * @return {RotationManager} This manager.
	 */

	updateQuaternion() {

		const settings = this.settings;
		const rotation = settings.rotation;

		if(settings.general.orbit) {

			m.lookAt(v.subVectors(this.position, this.target), rotation.pivotOffset, rotation.up);

		} else {

			m.lookAt(v.set(0, 0, 0), this.target.setFromSpherical(this.spherical), rotation.up);

		}

		this.quaternion.setFromRotationMatrix(m);

		return this;

	}

	/**
	 * Adjusts the spherical system.
	 *
	 * @param {Number} theta - The angle to add to theta in radians.
	 * @param {Number} phi - The angle to add to phi in radians.
	 * @return {RotationManager} This manager.
	 */

	adjustSpherical(theta, phi) {

		const settings = this.settings;
		const orbit = settings.general.orbit;
		const rotation = settings.rotation;
		const s = this.spherical;

		s.theta = !rotation.invertX ? s.theta - theta : s.theta + theta;
		s.phi = ((orbit || rotation.invertY) && !(orbit && rotation.invertY)) ? s.phi - phi : s.phi + phi;

		// Restrict theta and phi.
		s.theta = Math.min(Math.max(s.theta, rotation.minAzimuthalAngle), rotation.maxAzimuthalAngle);
		s.phi = Math.min(Math.max(s.phi, rotation.minPolarAngle), rotation.maxPolarAngle);
		s.theta %= TWO_PI;
		s.makeSafe();

		if(orbit) {

			// Keep the position up-to-date.
			this.position.setFromSpherical(s).add(this.target);

		}

		return this;

	}

	/**
	 * Zooms in or out.
	 *
	 * @param {Number} sign - The zoom sign. Possible values are [-1, 0, 1].
	 * @return {RotationManager} This manager.
	 */

	zoom(sign) {

		const settings = this.settings;
		const general = settings.general;
		const sensitivity = settings.sensitivity;
		const zoom = settings.zoom;
		const s = this.spherical;

		let amount, min, max;

		if(general.orbit && zoom.enabled) {

			amount = sign * sensitivity.zoom;

			if(zoom.invert) {

				amount = -amount;

			}

			min = Math.max(zoom.minDistance, 1e-6);
			max = Math.min(zoom.maxDistance, Infinity);

			s.radius = Math.min(Math.max(s.radius + amount, min), max);
			this.position.setFromSpherical(s).add(this.target);

		}

		return this;

	}

	/**
	 * Updates rotation calculations based on time.
	 *
	 * @param {Number} delta - The time since the last update in seconds.
	 */

	update(delta) {

	}

	/**
	 * Looks at the given point.
	 *
	 * @param {Vector3} point - The target point.
	 * @return {RotationManager} This manager.
	 */

	lookAt(point) {

		const spherical = this.spherical;
		const position = this.position;
		const target = this.target;

		target.copy(point);

		if(this.settings.general.orbit) {

			v.subVectors(position, target);

		} else {

			v.subVectors(target, position).normalize();

		}

		spherical.setFromVector3(v);
		spherical.radius = Math.max(spherical.radius, 1e-6);
		this.updateQuaternion();

		return this;

	}

	/**
	 * Returns the current view direction.
	 *
	 * @param {Vector3} [view] - A vector to store the direction in. If none is provided, a new vector will be created.
	 * @return {Vector3} The normalized view direction.
	 */

	getViewDirection(view = new Vector3()) {

		view.setFromSpherical(this.spherical).normalize();

		if(this.settings.general.orbit) {

			view.negate();

		}

		return view;

	}

}
