import { test, expect } from "vitest";
import { get_constrained_primitive_ids } from "../sketch/sketch_primitive";

test('get_constrained_primitive_ids', () => {
    const ids = get_constrained_primitive_ids({
        type: 'p2p_distance',
        p1_id: 1,
        p2_id: 2,
        distance: 1,
        id: 0,
    });

    expect(ids).toContain(1);
    expect(ids).toContain(2);
});