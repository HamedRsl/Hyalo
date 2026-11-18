
import {TestBed} from '@angular/core/testing';
import {HyTreeTable} from './tree-table';
import type {HyTreeNode} from '@hyalo/angular/tree';
describe('HyTreeTable',()=>{
 it('preserves ancestors, edits nested nodes, and restores its full wrapper query',async()=>{
  const f=TestBed.createComponent(HyTreeTable);f.componentRef.setInput('caption','Files');f.componentRef.setInput('nodes',[{key:'root',label:'Workspace',children:[{key:'child',label:'Notes',leaf:true}]}]);
  f.componentRef.setInput('columns',[{id:'name',header:'Name',cell:(node:HyTreeNode)=>node.label,write:(node:HyTreeNode,value:unknown)=>({...node,label:String(value)})}]);f.componentRef.setInput('expandedKeys',['root']);await f.whenStable();
  const table=f.componentInstance;table.search.set('Notes');await f.whenStable();const grid=table.grid()!;expect(grid.data().map(node=>node.key)).toEqual(['root','child']);const saved=table.saveState();table.search.set('missing');table.expandedKeys.set([]);table.restoreState(saved);await f.whenStable();expect(table.search()).toBe('Notes');expect(table.expandedKeys()).toEqual(['root']);
  grid.beginEdit(grid.data()[1]!,'name');grid.updateEdit('name','Updated');expect(await grid.commitEdit()).toBe(true);expect(table.nodes()[0]?.children?.[0]?.label).toBe('Updated');
 });
});
