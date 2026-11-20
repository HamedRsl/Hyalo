
import {aggregateHyGrid,compareHyGridValues,filterHyGridValue,exportHyGridCsv,encodeHyGridState,decodeHyGridState,type HyGridColumn,type HyGridState} from './grid-model';
describe('grid data contracts',()=>{
 const columns:readonly HyGridColumn<{name:string;amount:number}>[]=[{id:'name',header:'Name',cell:row=>row.name},{id:'amount',header:'Amount',cell:row=>row.amount,aggregate:'avg'}];
 const state:HyGridState={version:1,query:{page:2,pageSize:10,first:10,sorts:[{column:'amount',direction:'desc'}],filters:[{column:'amount',operator:'between',value:[1,5]}],search:'team',groupBy:['name']},widths:{name:240},order:['amount','name'],hidden:[],selected:['one',2]};
 it('round trips query, column layout, and typed stable keys',()=>{expect(decodeHyGridState(encodeHyGridState(state),['name','amount'])).toEqual(state);});
 it.each([
 {...state,version:2},{...state,widths:{name:0}},{...state,hidden:['unknown']},{...state,order:['name','name']},
 {...state,query:{...state.query,filters:[{column:'amount',operator:'between',value:[5,1]}]}},
 {...state,query:{...state.query,filters:[{column:'name',operator:'unknown',value:'x'}]}}
 ])('rejects incompatible persisted state %j',value=>{expect(()=>decodeHyGridState(JSON.stringify(value),['name','amount'])).toThrow();});
 it('supports Persian matching, missing values, range operators, and collation',()=>{
  expect(filterHyGridValue('كتاب',{column:'name',operator:'contains',value:'کتاب'},'fa')).toBe(true);
  expect(filterHyGridValue(5,{column:'amount',operator:'between',value:[1,5]},'en')).toBe(true);
  expect(filterHyGridValue(null,{column:'name',operator:'eq',value:null},'en')).toBe(true);
  expect(compareHyGridValues('item 2','item 10',new Intl.Collator('en',{numeric:true}))).toBeLessThan(0);
 });
 it('exports raw values with quotes, newlines, and spreadsheet formula protection',()=>{
  const csv=exportHyGridCsv([{name:'=SUM(A1)',amount:2},{name:'a,"b"\nc',amount:4}],columns,{delimiter:';',bom:true});
  expect(csv).toContain("=SUM(A1)");expect(csv).toContain('"a,""b""\\nc"'.replace('\\n','\n'));expect(csv.charCodeAt(0)).toBe(0xfeff);
 });
 it('aggregates finite values without changing the source',()=>{const rows=Object.freeze([{name:'a',amount:2},{name:'b',amount:4}]);expect(aggregateHyGrid(rows,columns[1]!)).toBe(3);});
});
