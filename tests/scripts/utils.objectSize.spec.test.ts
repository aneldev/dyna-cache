declare let describe:any, expect:any, it: any;
import {objectSize} from "../../src/utils";

describe('utils.objectSize', () => {
  it('should return correct objectSize for string', () => {
    expect(objectSize("hello")).toBe(7);
  });
  it('should return correct objectSize for undefined or null', () => {
    expect(objectSize(undefined)).toBe(0);
    expect(objectSize(null)).toBe(0);
  });
});
