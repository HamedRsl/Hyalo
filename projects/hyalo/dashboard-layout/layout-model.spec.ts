
import {compactHyDashboardLayout,decodeHyDashboardLayout,validateHyDashboardLayout} from './layout-model';
describe('dashboard geometry',()=>{
 const tiles=[{id:'a',x:0,y:3,width:6,height:2},{id:'b',x:6,y:2,width:6,height:2}];
 it('compacts without collisions or mutating saved coordinates',()=>{const next=compactHyDashboardLayout(tiles);expect(next.map(tile=>tile.y)).toEqual([0,0]);expect(tiles[0]?.y).toBe(3);expect(validateHyDashboardLayout(next,{columns:12})).toBe(true);});
 it('rejects overlapping, fractional, duplicate, and unknown persisted tiles',()=>{expect(validateHyDashboardLayout([{...tiles[0]!,y:0},{...tiles[1]!,x:5,y:0}],{columns:12})).toBe(false);expect(()=>decodeHyDashboardLayout(JSON.stringify({version:1,tiles}),{columns:12},['wrong','b'])).toThrow();expect(validateHyDashboardLayout([{...tiles[0]!,x:.5}],{columns:12})).toBe(false);});
});
