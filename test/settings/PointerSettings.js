import test from "ava";
import { PointerSettings } from "../../build/delta-controls.js";

test("can be instantiated", t => {

	const object = new PointerSettings();

	t.truthy(object);

});

test("can be cloned", t => {

	const object = new PointerSettings();

	t.truthy(object.clone());

});
