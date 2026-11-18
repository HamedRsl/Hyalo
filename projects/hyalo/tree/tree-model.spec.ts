
import {flattenHyTree,setHyTreeChecked,canMoveHyTreeNode,type HyTreeNode} from './tree-model';
describe('tree hierarchy',()=>{
 const nodes:readonly HyTreeNode[]=[{key:'root',label:'Root',children:[{key:'a',label:'A',leaf:true},{key:'b',label:'B',checkable:false},{key:'locked',label:'Locked',disabled:true}]}];
 it('retains complete validation while flattening only expanded nodes',()=>{expect(flattenHyTree(nodes,new Set()).map(item=>item.node.key)).toEqual(['root']);expect(flattenHyTree(nodes,new Set(['root']))[1]).toMatchObject({parent:'root',level:2,position:1,siblingCount:3});});
 it('rejects duplicate keys and cyclic trees',()=>{expect(()=>flattenHyTree([...nodes,{key:'root',label:'Again'}])).toThrow();const cycle:HyTreeNode[]=[];cycle.push({key:1,label:'Loop',children:cycle});expect(()=>flattenHyTree(cycle)).toThrow();});
 it('cascades checks only through enabled checkable nodes and reconciles parents',()=>{expect(setHyTreeChecked(nodes,[],'root',true)).toEqual(['root','a']);expect(setHyTreeChecked(nodes,['root','a'],'a',false)).toEqual([]);});
 it('rejects moving a node into its descendants or a disabled parent',()=>{expect(canMoveHyTreeNode(nodes,{key:'root',parent:'a',index:0})).toBe(false);expect(canMoveHyTreeNode(nodes,{key:'a',parent:'locked',index:0})).toBe(false);expect(canMoveHyTreeNode(nodes,{key:'a',parent:null,index:1})).toBe(true);});
});
