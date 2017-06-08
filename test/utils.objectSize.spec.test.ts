declare let describe:any, expect:any, it: any;
import {objectSize} from "./../src/utils";

describe('utils.objectSize', () => {
  it('should return correct objectSize for string', () => {
    expect(objectSize("hello")).toBe(7);
  });
});
