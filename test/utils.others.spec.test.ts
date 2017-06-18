declare let describe:any, expect:any, it: any;
import {getNowAsNumber} from "../src/utils";

// help: https://facebook.github.io/jest/docs/expect.html

describe('utils.getNowAsNumber', () => {
  it('should calculate the milliseconds', () => {
    expect(typeof getNowAsNumber() == 'number').toBe(true);
  });
});
