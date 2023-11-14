// This library provides WebAssembly bindings for the FreeCAD's geometric solver library planegcs.
// Copyright (C) 2023  Miroslav Šerý, Salusoft89 <miroslav.sery@salusoft89.cz>  

// This library is free software; you can redistribute it and/or
// modify it under the terms of the GNU Lesser General Public
// License as published by the Free Software Foundation; either
// version 2.1 of the License, or (at your option) any later version.

// This library is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
// Lesser General Public License for more details.

// You should have received a copy of the GNU Lesser General Public
// License along with this library; if not, write to the Free Software
// Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA

import type { Constraint } from '../planegcs_dist/constraints';

// object id type
export type oid = number;

interface Id {
	id: oid;
}
interface IArc {
	start_id: oid;
	end_id: oid;
	start_angle: number;
	end_angle: number;
}

export interface SketchPoint extends Id {
	type: 'point';
	x: number;
	y: number;
	fixed: boolean;
}
export interface SketchLine extends Id {
	type: 'line';
	p1_id: oid;
	p2_id: oid;
}
export interface SketchCircle extends Id {
	type: 'circle';
	c_id: oid;
	radius: number;
}
export interface SketchArc extends Id, IArc {
	type: 'arc';
	c_id: oid;
	radius: number;
}

export interface SketchEllipse extends Id {
	type: 'ellipse';
	c_id: oid;
	focus1_id: oid;
	radmin: number;
}

export interface SketchArcOfEllipse extends Id, IArc {
	type: 'arc_of_ellipse';
	c_id: oid;
	focus1_id: oid;
	radmin: number;
}

export type SketchGeometry = SketchPoint | SketchLine | SketchCircle | SketchArc | SketchEllipse | SketchArcOfEllipse;
export type SketchPrimitive = SketchGeometry | Constraint;

export interface SketchParam {
	type: 'param';
	name: string;
	value: number;
}

export function is_sketch_geometry(primitive: SketchPrimitive | SketchParam | undefined): primitive is SketchGeometry {
	if (primitive === undefined) {
		return false;
	}
	return ['point', 'line', 'circle', 'arc', 'ellipse', 'arc_of_ellipse'].includes(primitive.type);
}

export function is_sketch_constraint(primitive: SketchPrimitive | SketchParam | undefined): primitive is Constraint {
	if (primitive === undefined) {
		return false;
	}
	return !is_sketch_geometry(primitive);
}

export function get_referenced_sketch_params(p: SketchPrimitive): string[] {
	const params: string[] = [];
	for (const [key, val] of Object.entries(p)) {
		if (key === 'type') {
			continue;
		}
		if (typeof val === 'string') {
			params.push(val);
		}
	}
	return params;
}

export function get_constrained_primitive_ids(p: SketchPrimitive): number[] {
	if (!is_sketch_constraint(p)) {
		return [];
	}
	const constrained_primitive_ids: number[] = [];

	for (const [key, val] of Object.entries(p)) {
		if (key.endsWith('_id') && typeof val === 'number') {
			constrained_primitive_ids.push(val);
		} else if (
			// some constraints have the o_id inside the object
			// see e.g. difference constraint in horizontal/vertical distance tool
			typeof val === 'object' &&
			val !== null &&
			'o_id' in val &&
			typeof val['o_id'] === 'number'
		) {
			constrained_primitive_ids.push(val.o_id);
		}
	}

	return constrained_primitive_ids;
}

export function get_primitive_with_replaced_ids(p: SketchPrimitive, old_id: number, new_id: number): SketchPrimitive {
	const copy = JSON.parse(JSON.stringify(p));
	for (const [key, val] of Object.entries(copy)) {
		if (key.endsWith('_id') && typeof val === 'number' && val === old_id) {
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			(p as any)[key] = new_id;
		} else if (typeof val === 'object' && val !== null && 'o_id' in val && typeof val['o_id'] === 'number') {
			if (val.o_id === old_id) {
				val.o_id = new_id;
			}
		}
	}
	return copy;
}

// todo: add SketchHyperbola and SketchArcOfHyperbola
