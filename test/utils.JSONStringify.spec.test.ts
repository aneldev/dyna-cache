declare let describe:any, expect:any, it: any;
import {JSONStringify} from "../src/utils";

describe('utils.JSONStringify', () => {
  it('should return string length 7', () => {
    expect(JSONStringify("hello").length).toBe(7);
  });

  let o:any = {name:'John', age: 32};

  it('should stringify object without circular references', () => {
    expect(JSONStringify(o)).toBe('{"name":"John","age":32}');
  });

  o.ref = o;

  it('should stringify object with circular references', () => {
    expect(JSONStringify(o, 'circularReference')).toBe('{"name":"John","age":32,"ref":"circularReference"}');
  });
});
