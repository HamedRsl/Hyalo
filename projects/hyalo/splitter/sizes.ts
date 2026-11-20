export interface HyPaneConstraint{readonly min?:number;readonly max?:number;}
export function constrainHyPaneSizes(sizes:readonly number[],constraints:readonly HyPaneConstraint[]):readonly number[]{
 if(!constraints.length)return [];
 const bounds=constraints.map(item=>({min:item.min??0,max:item.max??100}));
 if(bounds.some(item=>!Number.isFinite(item.min)||!Number.isFinite(item.max)||item.min<0||item.max>100||item.min>item.max)||bounds.reduce((sum,item)=>sum+item.min,0)>100+1e-8||bounds.reduce((sum,item)=>sum+item.max,0)<100-1e-8)throw new Error('Splitter constraints cannot allocate 100 percent');
 const result=normalizeHyPaneSizes(sizes,bounds.length).map((value,index)=>Math.min(bounds[index]?.max??100,Math.max(bounds[index]?.min??0,value)));
 for(let pass=0;pass<=bounds.length;pass++){
  const remaining=100-result.reduce((sum,value)=>sum+value,0);if(Math.abs(remaining)<1e-8)break;
  const eligible=result.map((value,index)=>({index,capacity:remaining>0?(bounds[index]?.max??100)-value:value-(bounds[index]?.min??0)})).filter(item=>item.capacity>1e-8);
  if(!eligible.length)break;const share=remaining/eligible.length;
  for(const item of eligible)result[item.index]=(result[item.index]??0)+Math.sign(remaining)*Math.min(Math.abs(share),item.capacity);
 }
 return result;
}
export function normalizeHyPaneSizes(sizes:readonly number[],count:number):readonly number[]{
 if(count<1)return [];const values=Array.from({length:count},(_,i)=>Number.isFinite(sizes[i])?Math.max(0,sizes[i]??0):1);const total=values.reduce((sum,value)=>sum+value,0);
 return total?values.map(value=>value/total*100):values.map(()=>100/count);
}
export function resizeHyPanes(sizes:readonly number[],index:number,delta:number,constraints:readonly HyPaneConstraint[]):readonly number[]{
 if(index<0||index>=sizes.length-1||!Number.isFinite(delta))return sizes;
 const a=sizes[index]??0,b=sizes[index+1]??0;
 const lower=Math.max((constraints[index]?.min??0)-a,b-(constraints[index+1]?.max??100));
 const upper=Math.min((constraints[index]?.max??100)-a,b-(constraints[index+1]?.min??0));
 if(lower>upper)return sizes;
 const amount=Math.min(upper,Math.max(lower,delta));return Math.abs(amount)<1e-8?sizes:sizes.map((size,i)=>i===index?size+amount:i===index+1?size-amount:size);
}
