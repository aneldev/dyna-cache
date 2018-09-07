declare let describe:any, expect:any, it: any;
import {expireIn} from "../../src/utils";

// help: https://facebook.github.io/jest/docs/expect.html

describe('utils.expireIn', () => {
  it('should calculate milliseconds', () => {
    expect(expireIn(4000)).toBe(4000);
  });
  it('should calculate seconds', () => {
    expect(expireIn('10s')).toBe(10 * 1000);
  });
  it('should calculate minutes', () => {
    expect(expireIn('2m')).toBe(2 * 1000 * 60);
  });
  it('should calculate hours', () => {
    expect(expireIn('2h')).toBe(2 * 1000 * 60 * 60);
  });
  it('should calculate days', () => {
    expect(expireIn('2D')).toBe(2 * 1000 * 60 * 60 * 24);
  });
  it('should calculate weeks', () => {
    expect(expireIn('2W')).toBe(2 * 1000 * 60 * 60 * 24 * 7);
  });
  it('should calculate months', () => {
    expect(expireIn('2Mo')).toBe(2 * 1000 * 60 * 60 * 24 * 7 * 4);
  });
  it('should calculate months (decimal value)', () => {
    expect(expireIn('2.5Mo')).toBe(2.5 * 1000 * 60 * 60 * 24 * 7 * 4);
  });
  it('should calculate years', () => {
    expect(expireIn('2Y')).toBe(2 * 1000 * 60 * 60 * 24 * 7 * 4 * 12);
  });
  it('should calculate wrong values as -1', () => {
    expect(expireIn('2Yxxx')).toBe(-1);
  });
});
