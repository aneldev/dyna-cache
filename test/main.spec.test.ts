declare let describe:any, expect:any, it: any;
import {DynaCache} from './../src/index';

// help: https://facebook.github.io/jest/docs/expect.html

describe('My App', () => {
	it('should be loaded', () => {
		expect(DynaCache).not.toBe(undefined);
	});
});
