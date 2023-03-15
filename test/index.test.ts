import { it, describe, expect } from 'vitest';
import { GcsWrapper, make_gcs_wrapper } from "..";

describe('make_gcs_wrapper', () => {
    it('should return a GcsWrapper', async () => {
        const gcs = await make_gcs_wrapper();
        expect(gcs).toBeInstanceOf(GcsWrapper);
    });
});