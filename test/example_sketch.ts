import type { SketchObject, SketchParam } from '../sketch/sketch_object';

export const sketch: SketchObject[] = [
	{
		id: 1,
		type: 'point',
		x: 0,
		y: 300,
		fixed: true
	},
	{
		id: 2,
		type: 'point',
		x: 1000,
		y: 300,
		fixed: false
	},
	{
		id: 3,
		type: 'line',
		p1_id: 1,
		p2_id: 2
	},
	{
		id: 4,
		type: 'point',
		x: 1000,
		y: 1000,
		fixed: false
	},
	{
		id: 5,
		type: 'point',
		x: 1700,
		y: 1000,
		fixed: false
	},
	{
		id: 6,
		type: 'arc',
		start_id: 2,
		c_id: 4,
		end_id: 5,
		angle: Math.PI / 2
	},
	{
		id: 7,
		type: 'point',
		x: 2400,
		y: 1000,
		fixed: false
	},
	{
		id: 8,
		type: 'point',
		x: 2400,
		y: 1700,
		fixed: false
	},
	{
		id: 9,
		type: 'arc',
		start_id: 8,
		c_id: 7,
		end_id: 5,
		angle: Math.PI / 2
	},
	{
		id: 10,
		type: 'point',
		x: 4000,
		y: 1700,
		fixed: false
	},
	{
		id: 11,
		type: 'line',
		p1_id: 8,
		p2_id: 10
	},
	{
		id: 12,
		type: 'difference',
		o1_id: 1,
		o1_i: 1,
		o2_id: 2,
		o2_i: 1,
		difference: 0 // horizontal
	},
	{
		id: 13,
		type: 'difference',
		o1_id: 2,
		o1_i: 0,
		o2_id: 25,
		o2_i: 0,
		difference: 3500 // groove width
	},
	{
		id: 14,
		type: 'difference',
		o1_id: 1,
		o1_i: 0,
		o2_id: 26,
		o2_i: 0,
		difference: 6000 // total width
	},
	{
		id: 15,
		type: 'difference',
		o1_id: 1,
		o1_i: 1,
		o2_id: 8,
		o2_i: 1,
		difference: 700 // groove depth
	},
	{
		id: 16,
		type: 'difference',
		o1_id: 8,
		o1_i: 1,
		o2_id: 10,
		o2_i: 1,
		difference: 0 // horizontal
	},
	{
		id: 17,
		type: 'angle_via_point_line_arc',
		l_id: 3,
		a_id: 6,
		p_id: 2,
		angle: 0
	},
	{
		id: 18,
		type: 'angle_via_point_arc_arc',
		a1_id: 6,
		a2_id: 9,
		p_id: 5,
		angle: Math.PI
	},
	{
		id: 19,
		type: 'difference',
		o1_id: 6,
		o1_i: 2,
		o2_id: 9,
		o2_i: 2,
		difference: 0 // equal radius
	},
	{
		id: 20,
		type: 'angle_via_point_line_arc',
		l_id: 11,
		a_id: 9,
		p_id: 8,
		angle: Math.PI
	},
	{
		id: 21,
		type: 'equal',
		o_id: 6,
		o_i: 2,
		value: 800 // radius value
	},
	{
		id: 22,
		type: 'point',
		x: 4000,
		y: 1000,
		fixed: false
	},
	{
		id: 23,
		type: 'point',
		x: 4700,
		y: 1000,
		fixed: false
	},
	{
		id: 24,
		type: 'point',
		x: 5400,
		y: 1000,
		fixed: false
	},
	{
		id: 25,
		type: 'point',
		x: 5400,
		y: 300,
		fixed: false
	},
	{
		id: 26,
		type: 'point',
		x: 6400,
		y: 300,
		fixed: false
	},
	{
		id: 27,
		type: 'arc',
		start_id: 23,
		c_id: 22,
		end_id: 10,
		angle: Math.PI / 2
	},
	{
		id: 28,
		type: 'arc',
		start_id: 23,
		c_id: 24,
		end_id: 25,
		angle: Math.PI / 2
	},
	{
		id: 29,
		type: 'line',
		p1_id: 25,
		p2_id: 26
	},
	{
		id: 30,
		type: 'difference',
		o1_id: 6,
		o1_i: 2,
		o2_id: 27,
		o2_i: 2,
		difference: 0 // equal radius
	},
	{
		id: 31,
		type: 'difference',
		o1_id: 6,
		o1_i: 2,
		o2_id: 28,
		o2_i: 2,
		difference: 0 // equal radius
	},
	{
		id: 32,
		type: 'angle_via_point_line_arc',
		l_id: 11,
		a_id: 27,
		p_id: 10,
		angle: Math.PI
	},
	{
		id: 33,
		type: 'angle_via_point_arc_arc',
		a1_id: 27,
		a2_id: 28,
		p_id: 23,
		angle: Math.PI
	},
	{
		id: 34,
		type: 'angle_via_point_line_arc',
		l_id: 29,
		a_id: 28,
		p_id: 25,
		angle: 0
	},
	{
		id: 35,
		type: 'difference',
		o1_id: 25,
		o1_i: 1,
		o2_id: 26,
		o2_i: 1,
		difference: 0 // horizontal
	},
	{
		id: 36,
		type: 'difference',
		o1_id: 1,
		o1_i: 1,
		o2_id: 26,
		o2_i: 1,
		difference: 0 // horizontal
	},
	{
		id: 37,
		type: 'equal_length',
		l1_id: 3,
		l2_id: 29
	}
];

export const sketch_params: SketchParam[] = [
	{
		name: 'Radius',
		o_id: 21,
		o_i: 0
	},
	{
		name: 'Groove depth',
		o_id: 15,
		o_i: 0
	},
	{
		name: 'Groove width',
		o_id: 13,
		o_i: 0
	},
	{
		name: 'Total width',
		o_id: 14,
		o_i: 0
	}
];
