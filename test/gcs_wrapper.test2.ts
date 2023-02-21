import { GcsSystemMock } from "./gcs_system_mock";
jest.mock('./gcs_system_mock');
import { SketchIndex } from "../sketch/sketch_index";
import { GcsWrapper } from "../sketch/gcs_wrapper";

var gcs_wrapper: GcsWrapper;
var gcs: GcsSystemMock;

describe("gcs_wrapper", () => {
    beforeAll(() => {
        gcs = new GcsSystemMock();
        gcs_wrapper = new GcsWrapper(gcs, new SketchIndex());
    });

    beforeEach(() => {
        jest.clearAllMocks();
        gcs_wrapper.param_index = new Map();
        gcs_wrapper.sketch_index = new SketchIndex();
    });

    it("calls gcs when pushing a point", () => {
        gcs_wrapper.push_object({type: 'point', id: 1, x: 3, y: 4, fixed: true});
        expect(gcs.push_param).toHaveBeenNthCalledWith(1, 3, true)
        expect(gcs.push_param).toHaveBeenNthCalledWith(2, 4, true)
        expect(gcs.push_param).toHaveBeenCalledTimes(2);
    });

    it("calls gcs when pushing a line", () => {
        gcs_wrapper.push_object({type: 'point', id: 1, x: 0, y: 0, fixed: true});
        gcs_wrapper.push_object({type: 'point', id: 2, x: 0, y: 0, fixed: true});
        gcs_wrapper.push_object({type: 'line', id: 3, p1_id: 1, p2_id: 2});
        expect(gcs.push_param).toHaveBeenCalledTimes(4);
    });

    it("calls gcs when pushing a circle", () => {
        gcs_wrapper.push_object({type: 'point', id: 1, x: 0, y: 0, fixed: true});
        gcs_wrapper.push_object({type: 'circle', id: 2, c_id: 1, radius: 3});
        expect(gcs.push_param).toHaveBeenNthCalledWith(1, 0, true)
        expect(gcs.push_param).toHaveBeenNthCalledWith(2, 0, true)
        expect(gcs.push_param).toHaveBeenNthCalledWith(3, 3, false)
        expect(gcs.push_param).toHaveBeenCalledTimes(3);
    });

    it("calls gcs when pushing an arc", () => {
        gcs_wrapper.push_object({type: 'point', id: 1, x: 0, y: 0, fixed: true});
        gcs_wrapper.push_object({type: 'point', id: 2, x: 1, y: 2, fixed: true});
        gcs_wrapper.push_object({type: 'point', id: 3, x: 10, y: 10, fixed: true});
        gcs_wrapper.push_object({type: 'arc', id: 4, c_id: 1, start_id: 2, end_id: 3, angle: Math.PI / 2});
        expect(gcs.push_param).toHaveBeenCalledTimes(3 * 2 + 3);
    });

    it("calls add_constraint_equal method when adding an equal constraint", () => {
        jest.spyOn(gcs, 'params_size').mockReturnValue(0);
        gcs_wrapper.push_object({type: 'point', id: 1, x: 0, y: 0, fixed: false});
        jest.spyOn(gcs, 'params_size').mockReturnValue(2);
        gcs_wrapper.push_object({type: 'equal', id: 2, o_id: 1, o_i: 0, value: 5});

        expect(gcs.push_param).toHaveBeenCalledTimes(3);
        expect(gcs.push_param).toHaveBeenLastCalledWith(5, true);

        const o1_p1_addr = 0;
        const value_addr = 2;
        const tag = 2;
        expect(gcs.add_constraint_equal).toHaveBeenCalledWith(o1_p1_addr, value_addr, tag);
    });

    it("calls add_constraint_angle_via_point_line_arc when adding a constraint", () => {
        jest.spyOn(gcs, 'params_size').mockReturnValue(0);
        gcs_wrapper.push_object({type: 'point', id: 1, x: 0, y: 0, fixed: false});
        jest.spyOn(gcs, 'params_size').mockReturnValue(2);
        gcs_wrapper.push_object({type: 'point', id: 2, x: 1, y: 2, fixed: false});
        jest.spyOn(gcs, 'params_size').mockReturnValue(4);
        gcs_wrapper.push_object({type: 'line', id: 3, p1_id: 1, p2_id: 2});
        gcs_wrapper.push_object({type: 'point', id: 4, x: 10, y: 10, fixed: false});
        jest.spyOn(gcs, 'params_size').mockReturnValue(6);
        gcs_wrapper.push_object({type: 'arc', id: 5, c_id: 1, start_id: 2, end_id: 4, angle: Math.PI / 2});
        jest.spyOn(gcs, 'params_size').mockReturnValue(9);

        gcs_wrapper.push_object({type: 'angle_via_point_line_arc', id: 6, l_id: 3, a_id: 5, p_id: 4, angle: Math.PI / 6});

        expect(gcs.add_constraint_angle_via_point_line_arc).toHaveBeenCalledWith(
            // line
            0, 1, 2, 3,
            // arc
            0, 1, 2, 3, 4, 5,
            // arc_params (startangle, endangle, radius)
            6, 7, 8, 
            // point
            4, 5,
            // angle
            9,
            // id
            6);
    });
});