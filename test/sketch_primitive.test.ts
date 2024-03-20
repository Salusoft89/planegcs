import { test, expect } from "vitest";
import { get_constrained_primitive_ids, get_referenced_sketch_params } from "../sketch/sketch_primitive";

test('get_constrained_primitive_ids', () => {
    const ids = get_constrained_primitive_ids({
        type: 'p2p_distance',
        p1_id: '1',
        p2_id: '2',
        distance: 1,
        id: '0',
    });

    expect(ids).toHaveLength(2);
    expect(ids).toContain('1');
    expect(ids).toContain('2');
});

test('get_referenced_sketch_params', () => {
    const params = get_referenced_sketch_params({
        id: '0',
        type: 'p2p_distance',
        p1_id: '1',
        p2_id: '2',
        distance: 'dist_param',
    });

    expect(params).toHaveLength(1);
    expect(params).toContain('dist_param');
}); 