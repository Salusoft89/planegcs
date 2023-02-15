import type { GcsSystem, IntVector, DoubleVector } from "../planegcs/bin/planegcs";

export class NumberVector implements IntVector, DoubleVector {
    private arr: number[];

    constructor(arr: number[]) {
        this.arr = arr;
    }

    get(i: number): number {
        return this.arr[i];
    }

    size(): number {
        return this.arr.length;
    }

    delete(): void {
        this.arr = [];
    }
}

export class GcsSystemMock implements GcsSystem {
    private params: number[] = [];
    private fixed: boolean[] = [];
 
    constructor() {
    }

    params_size(): number {
        return this.params.length;
    }

    get_param(i: number): number {
        return this.params[i];
    }

    get_params(): DoubleVector {
        return new NumberVector(this.params);
    }

    set_param(i: number, value: number, fixed: boolean): void {
        this.params[i] = value;
        this.fixed[i] = fixed;
    }

    push_param(value: number, fixed: boolean): void {
        this.params.push(value);
        this.fixed.push(fixed);
    }

    get_is_fixed(i: number): boolean {
        return this.fixed[i];
    }

    solve_system(): number {
        return 0;
    }

    get_conflicting(): IntVector {
        return new NumberVector([]);
    }

    clear(): void {
        this.params = [];
        this.fixed = [];
    }

    apply_solution(): void {
    }

    dof(): number {
        return 0;
    }

    has_conflicting(): boolean {
        return false;
    }

    has_redundant(): boolean {
        return false;
    }

    clear_by_id(id: number): void {
    }

    delete(): void {
    }

    add_constraint_difference(x_i: number, y_i: number, difference_i: number, id: number): void {}
    add_constraint_equal(x_i: number, value_i: number, id: number): void {}
    add_constraint_arc_rules(cx_i: number, cy_i: number, startx_i: number, starty_i: number, endx_i: number, endy_i: number, startangle_i: number, endangle_i: number, rad_i: number, id: number): void {}
    add_constraint_angle_via_point_line_arc(x_i: number, y_i: number, l1x_i: number, l1y_i: number, l2x_i: number, l2y_i: number, cx_i: number, cy_i: number, startx_i: number, starty_i: number, endx_i: number, endy_i: number, startangle_i: number, endangle_i: number, rad_i: number, angle_i: number, id: number): void {}
    add_constraint_angle_via_point_arc_arc(x_i: number, y_i: number, cx1_i: number, cy1_i: number, startx1_i: number, starty1_i: number, endx1_i: number, endy1_i: number, startangle1_i: number, endangle1_i: number, rad1_i: number, cx2_i: number, cy2_i: number, startx2_i: number, starty2_i: number, endx2_i: number, endy2_i: number, startangle2_i: number, endangle2_i: number, rad2_i: number, angle_i: number, id: number): void {}
    add_constraint_equal_length(l1x_i: number, l1y_i: number, l2x_i: number, l2y_i: number, id: number): void {}
    add_constraint_p2p_coincident(x1_i: number, y1_i: number, x2_i: number, y2_i: number, id: number): void {}
    add_constraint_p2p_distance(x1_i: number, y1_i: number, x2_i: number, y2_i: number, distance_i: number, id: number): void {}
}