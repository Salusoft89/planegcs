import { Constraint } from '../planegcs/bin/constraints';

// object id type
export type oid = number;

interface Id {
	id: oid;
}
export interface SketchPoint extends Id {
	type: 'point';
	x: number;
	y: number;
	fixed: boolean;
}
export interface SketchLine extends Id {
	type: 'line';
	p1_id: number;
	p2_id: number;
}
export interface SketchCircle extends Id {
	type: 'circle';
	c_id: number;
	radius: number;
}
export interface SketchArc extends Id {
	type: 'arc';
	c_id: number;
	start_id: number;
	end_id: number;
	start_angle: number;
	end_angle: number;
	radius: number;
}

export type SketchGeometry = SketchPoint | SketchLine | SketchCircle | SketchArc;
export type SketchObject = SketchGeometry | Constraint;

export interface SketchParam {
	name: string;
	o_id: number;
	o_i: number;
}

export function is_sketch_geometry(o: SketchObject): o is SketchGeometry {
	return o.type === 'point' || o.type === 'line' || o.type === 'circle' || o.type === 'arc';
}