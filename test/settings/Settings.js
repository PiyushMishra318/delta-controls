import test from "ava";
import { Settings } from "../../build/delta-controls.js";

test("can be instantiated", t => {

	const object = new Settings();

	t.truthy(object);

});

test("can be cloned", t => {

	const object = new Settings();

	t.truthy(object.clone());

});
