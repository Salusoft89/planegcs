import { GcsGeometryMock, GcsSystemMock } from "../planegcs/bin/gcs_system_mock";
jest.mock('../planegcs/bin/gcs_system_mock');
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
        jest.resetAllMocks();
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
        jest.spyOn(gcs, 'params_size').mockReturnValueOnce(0);
        gcs_wrapper.push_object({type: 'point', id: 1, x: 0, y: 0, fixed: true});
        jest.spyOn(gcs, 'params_size').mockReturnValueOnce(2);
        gcs_wrapper.push_object({type: 'point', id: 2, x: 1, y: 2, fixed: true});
        jest.spyOn(gcs, 'params_size').mockReturnValueOnce(4);
        gcs_wrapper.push_object({type: 'point', id: 3, x: 10, y: 10, fixed: true});

        const arc = new GcsGeometryMock();
        jest.spyOn(gcs, 'make_arc').mockReturnValueOnce(arc);

        jest.spyOn(gcs, 'params_size').mockReturnValueOnce(6);
        gcs_wrapper.push_object({type: 'arc', id: 4, c_id: 1, start_id: 2, end_id: 3, start_angle: 0, end_angle: 0, radius: 1});

        expect(gcs.push_param).toHaveBeenCalledTimes(3 * 2 + 3);
    });

    it("calls add_constraint_equal method when adding an equal constraint", () => {
        const o1_p1_addr = 0;
        jest.spyOn(gcs, 'params_size').mockReturnValue(o1_p1_addr);
        gcs_wrapper.push_object({type: 'point', id: 1, x: 0, y: 0, fixed: false});
        expect(gcs.push_param).toHaveBeenCalledTimes(2);

        const value_addr = 2;
        jest.spyOn(gcs, 'params_size').mockReturnValue(value_addr);
        gcs_wrapper.push_object({type: 'equal', id: 2, param1: { o_id: 1, param: 'x' }, param2: 5});
        expect(gcs.push_param).toHaveBeenCalledTimes(3);
        expect(gcs.push_param).toHaveBeenLastCalledWith(5, true);

        const tag = 2;
        expect(gcs.add_constraint_equal).toHaveBeenCalledWith(o1_p1_addr, value_addr, tag, true);
    });

    it("calls add_constraint_equal with driving parameter when provided", () => {
        const o1_p1_addr = 0;
        jest.spyOn(gcs, 'params_size').mockReturnValue(o1_p1_addr);
        gcs_wrapper.push_object({type: 'point', id: 1, x: 0, y: 0, fixed: false});
        const value_addr = 2;
        jest.spyOn(gcs, 'params_size').mockReturnValue(value_addr);
        gcs_wrapper.push_object({type: 'equal', id: 2, param1: { o_id: 1, param: 'x' }, param2: 5, driving: false});

        const tag = 2;
        expect(gcs.add_constraint_equal).toHaveBeenCalledWith(o1_p1_addr, value_addr, tag, false);
    });

    it("calls add_constraint_angle_via_point when adding a constraint (with shuffled arguments)", () => {
        jest.spyOn(gcs, 'params_size').mockReturnValueOnce(0);
        gcs_wrapper.push_object({type: 'point', id: 1, x: 0, y: 0, fixed: false});
        jest.spyOn(gcs, 'params_size').mockReturnValueOnce(2);
        gcs_wrapper.push_object({type: 'point', id: 2, x: 1, y: 2, fixed: false});
        jest.spyOn(gcs, 'params_size').mockReturnValue(4);
        gcs_wrapper.push_object({type: 'line', id: 3, p1_id: 1, p2_id: 2});
        gcs_wrapper.push_object({type: 'point', id: 4, x: 10, y: 10, fixed: false});
        jest.spyOn(gcs, 'params_size').mockReturnValueOnce(6);
        gcs_wrapper.push_object({type: 'arc', id: 5, c_id: 1, start_id: 2, end_id: 4, start_angle: 0, end_angle: 0, radius: 1});
        jest.spyOn(gcs, 'params_size').mockReturnValueOnce(9);
        
        const line = new GcsGeometryMock();
        const point = new GcsGeometryMock();
        const arc = new GcsGeometryMock();

        jest.spyOn(gcs, 'make_line').mockReturnValueOnce(line);
        jest.spyOn(gcs, 'make_point').mockReturnValueOnce(point);
        jest.spyOn(gcs, 'make_arc').mockReturnValueOnce(arc);

        gcs_wrapper.push_object({
            id: 6,
            crv1_id: 3, // Line
            angle: Math.PI / 2,
            crv2_id: 5, // Arc
            p_id: 4,
            type: 'angle_via_point'
        });

        expect(gcs.make_line).toHaveBeenCalledWith(0, 1, 2, 3);
        expect(gcs.make_arc).toHaveBeenCalledWith(
            // center
            0, 1, 
            // start
            2, 3, 
            // end
            4, 5,
            // start angle, end angle, radius
            6, 7, 8);
        expect(gcs.make_point).toHaveBeenCalledWith(4, 5);

        expect(line.delete).toHaveBeenCalledTimes(1);
        expect(arc.delete).toHaveBeenCalledTimes(1);
        expect(point.delete).toHaveBeenCalledTimes(1);
    });
});