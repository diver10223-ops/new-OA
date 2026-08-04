import { describe, expect, it } from 'vitest';
import { statusType } from './status';
describe('statusType', () => {
    it('uses consistent semantic colors and a safe fallback', () => {
        expect(statusType('APPROVED')).toBe('success');
        expect(statusType('PENDING')).toBe('warning');
        expect(statusType('UNKNOWN')).toBe('info');
    });
});
