import { GcsSystemMock } from "./gcs_system_mock";
jest.mock('./gcs_system_mock');

describe("gcs_wraper", function() {
    it("mocks", function() {
        var gcs = new GcsSystemMock();
        expect(gcs.params_size()).toBe(undefined);

        expect(gcs.params_size).toBeCalled();
    });
});