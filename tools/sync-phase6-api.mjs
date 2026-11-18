import {readdirSync,readFileSync,writeFileSync,existsSync} from 'node:fs';
import ts from 'typescript';
import {format} from 'prettier';
const entries=['data-grid','tree','tree-table','virtual-scroller','kanban','scheduler','splitter','dashboard-layout','context-menu','rich-text','gauge'];
const inventory={},types=[],tick=String.fromCharCode(96);
for(const entry of entries){
 const rows=[];
 const paths=readdirSync('projects/hyalo/'+entry).filter(file=>file.endsWith('.ts')&&!file.endsWith('.spec.ts')&&!['public-api.ts','engine.ts'].includes(file)).map(file=>'projects/hyalo/'+entry+'/'+file);
 if(entry==='rich-text')paths.push('projects/hyalo/field/value-control.ts');
 for(const file of paths){
  const source=ts.createSourceFile(file,readFileSync(file,'utf8'),ts.ScriptTarget.Latest,true),text=node=>node.getText(source);
  for(const node of source.statements){
   if(!node.modifiers?.some(modifier=>modifier.kind===ts.SyntaxKind.ExportKeyword))continue;
   if(ts.isClassDeclaration(node)){
    for(const member of node.members){
     if(!member.name||member.modifiers?.some(modifier=>[ts.SyntaxKind.PrivateKeyword,ts.SyntaxKind.ProtectedKeyword].includes(modifier.kind)))continue;
     const name=node.name.text+'.'+text(member.name),description=ts.getJSDocCommentsAndTags(member).map(item=>item.comment??'').join(' ');
     if(ts.isPropertyDeclaration(member)&&member.initializer&&ts.isCallExpression(member.initializer)){
      const call=member.initializer,kind=text(call.expression),argument=call.arguments[0],isSignal=/^(input|model|output)(\.required)?$/.test(kind);
      if(!isSignal&&!['computed','signal'].includes(kind)&&!kind.endsWith('.asReadonly'))continue;
      const type=call.typeArguments?.map(text).join(', ')??(argument?text(argument):'void');
      rows.push({name,type,default:kind.includes('required')?'required':isSignal&&argument?text(argument):undefined,description:description||(kind.startsWith('model')?'Two-way model; also exposes '+text(member.name)+'Change.':kind==='output'?'Typed event.':kind.startsWith('input')?'Input.':'Read-only derived state.')});
     }else if(ts.isMethodDeclaration(member)){
      const signature=text(member).slice(0,member.body?member.body.pos-member.pos:undefined).trim().replace(/^(public|override|async)\s+/g,'');
      rows.push({name,type:signature,description:description||'Public method.'});
     }
    }
    for(const decorator of ts.getDecorators(node)??[]){
     if(!ts.isCallExpression(decorator.expression))continue;const metadata=decorator.expression.arguments[0];if(!metadata||!ts.isObjectLiteralExpression(metadata))continue;
     const hosts=metadata.properties.find(item=>item.name&&text(item.name)==='hostDirectives')?.initializer;if(!hosts)continue;
     const visit=child=>{if(ts.isPropertyAssignment(child)&&['inputs','outputs'].includes(text(child.name))&&ts.isArrayLiteralExpression(child.initializer))for(const binding of child.initializer.elements){if(!ts.isStringLiteral(binding))continue;const [original,alias]=binding.text.split(':');rows.push({name:node.name.text+'.'+(alias??original),type:original,description:'Forwarded '+text(child.name)+' from the CDK/material host directive.'});}ts.forEachChild(child,visit);};visit(hosts);
    }
   }else if(ts.isInterfaceDeclaration(node)||ts.isTypeAliasDeclaration(node))types.push({entry,name:node.name.text,source:text(node)});
   else if(ts.isFunctionDeclaration(node))types.push({entry,name:node.name.text,source:text(node).slice(0,node.body.pos-node.pos).trim()+';'});
   else if(ts.isVariableStatement(node))for(const declaration of node.declarationList.declarations)if(text(declaration.name).startsWith('HY_'))types.push({entry,name:text(declaration.name),source:text(declaration)});
  }
 }
 inventory[entry]=rows;
}
const generated=await format('import type {ApiRow} from "../shared/api-table";\nexport const PHASE6_API:Readonly<Record<string,readonly ApiRow[]>>='+JSON.stringify(inventory)+';\n',{parser:'typescript',singleQuote:true,printWidth:95});
const markdown='# Phase 6 public API inventory\n\nGenerated from exported source with '+tick+'node tools/sync-phase6-api.mjs'+tick+'. Includes declared inputs, models, outputs, public methods, derived state, inherited field metadata, forwarded host-directive input/output, exported data/configuration types, and utility signatures. Engine-native options remain typed by FullCalendar and TipTap.\n\n'+entries.map(entry=>'## '+entry+'\n\n'+inventory[entry].map(row=>'- '+tick+row.name+tick+': '+tick+row.type.replace(/\n/g,' ')+tick+(row.default!==undefined?' (default: '+tick+row.default.replace(/\n/g,' ')+tick+')':'')+' — '+row.description).join('\n')+'\n\n'+types.filter(type=>type.entry===entry).map(type=>'~~~ts\n'+type.source+'\n~~~').join('\n\n')).join('\n\n')+'\n';
for(const [file,content]of Object.entries({'projects/docs/src/app/pages/phase6-api.ts':generated,'docs/phase-6-api.md':markdown})){
 if(process.argv.includes('--check')){if(!existsSync(file)||readFileSync(file,'utf8')!==content)throw new Error('Stale API inventory: '+file);}
 else writeFileSync(file,content);
}
console.log('Phase 6 API inventory: '+Object.values(inventory).reduce((sum,rows)=>sum+rows.length,0)+' members; '+types.length+' exported type/utility/configuration declarations');
