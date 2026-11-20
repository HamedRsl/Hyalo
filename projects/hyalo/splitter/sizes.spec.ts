
import {constrainHyPaneSizes,resizeHyPanes} from './sizes';
describe('splitter allocation',()=>{
 it('normalizes all state paths within min/max bounds',()=>{const bounds=[{min:20,max:40},{min:10,max:80},{min:0,max:0}];const sizes=constrainHyPaneSizes([1,99,50],bounds);expect(sizes[0]).toBeGreaterThanOrEqual(20);expect(sizes[0]).toBeLessThanOrEqual(40);expect(sizes[2]).toBe(0);expect(sizes.reduce((sum,value)=>sum+value,0)).toBeCloseTo(100);});
 it('clamps adjacent movement and leaves other panes unchanged',()=>{expect(resizeHyPanes([25,50,25],0,100,[{min:10,max:40},{min:30,max:70},{}])).toEqual([40,35,25]);});
 it('rejects impossible, nonfinite, or reversed constraints',()=>{expect(()=>constrainHyPaneSizes([50,50],[{min:60},{min:60}])).toThrow();expect(()=>constrainHyPaneSizes([50,50],[{max:20},{max:20}])).toThrow();expect(()=>constrainHyPaneSizes([100],[{min:NaN}])).toThrow();});
});
