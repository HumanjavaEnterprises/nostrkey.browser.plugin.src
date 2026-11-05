import { describe, it, expect } from 'vitest';
import { grantTimeLeft, grantValue } from '../src/utilities/consent-policy.js';

const NOW = 1_800_000_000;

describe('grantTimeLeft', () => {
  it('a Forever allow has no time left shown', () => {
    expect(grantTimeLeft('allow', NOW)).toBeNull();
    expect(grantTimeLeft('deny', NOW)).toBeNull();
  });
  it('an expiring allow says days, hours or minutes left', () => {
    expect(grantTimeLeft(grantValue('30d', NOW), NOW)).toBe('30 days left');
    expect(grantTimeLeft(grantValue('1d', NOW), NOW + 1)).toBe('23 hours left');
    expect(grantTimeLeft(grantValue('1h', NOW), NOW)).toBe('1 hour left');
    expect(grantTimeLeft(grantValue('1h', NOW), NOW + 3600 - 30)).toBe('1 min left');
    expect(grantTimeLeft({ v: 'allow', exp: NOW + 86400 + 5, d: '30d' }, NOW)).toBe('1 day left');
  });
  it('an expired or malformed grant shows nothing (it reads as ask)', () => {
    expect(grantTimeLeft(grantValue('1h', NOW), NOW + 3600)).toBeNull();
    expect(grantTimeLeft({ v: 'allow', exp: NOW + 99 * 86400, d: '1h' }, NOW)).toBeNull();
    expect(grantTimeLeft(null, NOW)).toBeNull();
  });
});
