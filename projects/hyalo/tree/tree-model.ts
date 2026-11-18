export type HyTreeKey=string|number;
export interface HyTreeNode<T=unknown>{
 readonly key:HyTreeKey;readonly label:string;readonly data?:T;readonly children?:readonly HyTreeNode<T>[];
 readonly leaf?:boolean;readonly disabled?:boolean;readonly selectable?:boolean;readonly checkable?:boolean;readonly icon?:string;readonly hidden?:boolean;
}
export interface HyFlatTreeNode<T>{readonly node:HyTreeNode<T>;readonly parent:HyTreeKey|null;readonly level:number;readonly position:number;readonly siblingCount:number;}
/** Stable keys make expansion, selection, lazy results, and tree-table rows share one identity. */
export function flattenHyTree<T>(nodes:readonly HyTreeNode<T>[],expanded?:ReadonlySet<HyTreeKey>):readonly HyFlatTreeNode<T>[]{
 const seen=new Set<HyTreeKey>(),result:HyFlatTreeNode<T>[]=[];
 const visit=(items:readonly HyTreeNode<T>[],parent:HyTreeKey|null,level:number,visible:boolean):void=>{
  const siblings=items.filter(node=>!node.hidden);
  siblings.forEach((node,index)=>{if(seen.has(node.key))throw new Error('Tree keys must be unique and acyclic: '+node.key);seen.add(node.key);
   if(visible)result.push({node,parent,level,position:index+1,siblingCount:siblings.length});
   visit(node.children??[],node.key,level+1,visible&&(!expanded||expanded.has(node.key)));
  });
 };visit(nodes,null,1,true);return result;
}
export function setHyTreeChecked<T>(nodes:readonly HyTreeNode<T>[],current:readonly HyTreeKey[],key:HyTreeKey,checked:boolean,cascade=true):readonly HyTreeKey[]{
 const all=flattenHyTree(nodes),target=all.find(entry=>entry.node.key===key)?.node;
 if(!target||target.disabled||target.checkable===false)return current;
 const next=new Set(current);
 const set=(node:HyTreeNode<T>):void=>{if(node.disabled||node.checkable===false)return;if(checked)next.add(node.key);else next.delete(node.key);if(cascade)node.children?.forEach(set);};
 set(target);
 if(cascade)for(const entry of [...all].reverse()){const children=entry.node.children?.filter(child=>!child.disabled&&child.checkable!==false&&!child.hidden);if(!children?.length||entry.node.disabled||entry.node.checkable===false)continue;if(children.every(child=>next.has(child.key)))next.add(entry.node.key);else next.delete(entry.node.key);}
 return [...next];
}
export interface HyTreeMove{readonly key:HyTreeKey;readonly parent:HyTreeKey|null;readonly index:number;}
export function canMoveHyTreeNode<T>(nodes:readonly HyTreeNode<T>[],move:HyTreeMove):boolean{
 const all=flattenHyTree(nodes),node=all.find(item=>item.node.key===move.key)?.node;
 if(!node||node.disabled||move.key===move.parent||!Number.isInteger(move.index)||move.index<0)return false;
 if(move.parent===null)return move.index<=nodes.length;
 const parent=all.find(item=>item.node.key===move.parent)?.node;
 if(!parent||parent.disabled||parent.leaf)return false;
 const descendants=flattenHyTree(node.children??[]);
 return !descendants.some(item=>item.node.key===move.parent)&&move.index<=(parent.children?.length??0);
}
