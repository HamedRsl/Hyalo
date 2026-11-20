
export interface HyTileRect{readonly id:string;readonly x:number;readonly y:number;readonly width:number;readonly height:number;}
export interface HyTileBounds{readonly columns:number;readonly maxRows?:number;}
export function hyTilesOverlap(a:HyTileRect,b:HyTileRect):boolean{return a.id!==b.id&&a.x<b.x+b.width&&a.x+a.width>b.x&&a.y<b.y+b.height&&a.y+a.height>b.y;}
export function validateHyDashboardLayout(layout:readonly HyTileRect[],bounds:HyTileBounds):boolean{
 if(!Number.isInteger(bounds.columns)||bounds.columns<1)return false;const ids=new Set<string>();
 return layout.every(tile=>{if(ids.has(tile.id))return false;ids.add(tile.id);return [tile.x,tile.y,tile.width,tile.height].every(Number.isInteger)&&tile.x>=0&&tile.y>=0&&tile.width>=1&&tile.height>=1&&tile.x+tile.width<=bounds.columns&&tile.y+tile.height<=(bounds.maxRows??1000)&&!layout.some(other=>hyTilesOverlap(tile,other));});
}
export function decodeHyDashboardLayout(text:string,bounds:HyTileBounds,ids:readonly string[]):readonly HyTileRect[]{
 const state:unknown=JSON.parse(text);if(!state||typeof state!=='object'||!('version'in state)||state.version!==1||!('tiles'in state)||!Array.isArray(state.tiles)||state.tiles.length!==ids.length||!state.tiles.every((item:unknown)=>!!item&&typeof item==='object'&&'id'in item&&ids.includes(String(item.id))))throw new Error('Invalid dashboard layout state');
 const tiles=state.tiles as HyTileRect[];if(!validateHyDashboardLayout(tiles,bounds))throw new Error('Dashboard layout overlaps or exceeds its bounds');return tiles.map(({id,x,y,width,height})=>({id,x,y,width,height}));
}
export function compactHyDashboardLayout(layout:readonly HyTileRect[]):readonly HyTileRect[]{
 const result:HyTileRect[]=[];for(const tile of [...layout].sort((a,b)=>a.y-b.y||a.x-b.x)){let candidate={...tile,y:0};while(candidate.y<tile.y&&result.some(other=>hyTilesOverlap(candidate,other)))candidate={...candidate,y:candidate.y+1};result.push(candidate);}return layout.map(tile=>result.find(item=>item.id===tile.id)??tile);
}
