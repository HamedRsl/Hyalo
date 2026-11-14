// Generate copyable sources from live demos, without loading a source parser in the browser.
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import ts from 'typescript';
import { parseTemplate } from '@angular/compiler';
import { format } from 'prettier';

const phase2 = new Set([
  'carousel',
  'lightbox',
  'image-compare',
  'marquee',
  'split-text',
  'refraction',
  'hotspot',
  'mesh',
  'timeline',
  'stepper',
  'badge',
  'avatar',
  'skeleton',
  'button-group',
  'link',
  'divider',
  'aspect-ratio',
  'chapter-nav',
  'scroll-to-top',
]);
const root = 'projects/docs/src/app/pages';
const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
const print = (node, source) => printer.printNode(ts.EmitHint.Unspecified, node, source);
const property = (metadata, name) =>
  metadata.properties.find((node) => node.name?.getText() === name)?.initializer;
const metadataOf = (node) =>
  ts
    .getDecorators(node)
    ?.find(
      (decorator) =>
        ts.isCallExpression(decorator.expression) &&
        decorator.expression.expression.getText() === 'Component',
    )?.expression.arguments[0];
const write = (file, text) => {
  if (!existsSync(file) || readFileSync(file, 'utf8') !== text) writeFileSync(file, text);
};

function stylesOf(metadata) {
  const styles = property(metadata, 'styles');
  const inline = styles && 'text' in styles ? styles.text : '';
  const url = property(metadata, 'styleUrl');
  return (
    inline +
    '\n' +
    (url && existsSync(join(root, url.text)) ? readFileSync(join(root, url.text), 'utf8') : '')
  );
}

// Preserve conditional wrappers when selecting CSS needed by the demo.
function relevantCss(source, html) {
  const classes = new Set(
    [...html.matchAll(/class="([^"]+)"/g)].flatMap((match) => match[1].split(/\s+/)),
  );
  const tags = new Set([...html.matchAll(/<([a-z][\w-]*)\b/g)].map((match) => match[1]));
  const matches = (selector) => {
    const names = [...selector.matchAll(/\.([\w-]+)/g)].map((match) => match[1]);
    return names.length
      ? names.every((name) => classes.has(name))
      : tags.has(selector.split(/[:\s[]/)[0]);
  };
  const parse = (text) => {
    const rules = [];
    let cursor = 0;
    while (cursor < text.length) {
      const start = text.indexOf('{', cursor);
      if (start < 0) break;
      const selector = text.slice(cursor, start).trim();
      let end = start + 1,
        depth = 1;
      while (end < text.length && depth) {
        if (text[end] === '{') depth++;
        if (text[end] === '}') depth--;
        end++;
      }
      const body = text.slice(start + 1, end - 1);
      if (/^@(media|supports|container)\b/.test(selector)) {
        const inner = parse(body);
        if (inner) rules.push(`${selector} {\n${inner}\n}`);
      } else if (!selector.startsWith('@')) {
        const selected = selector
          .split(',')
          .map((value) => value.trim())
          .filter(matches);
        if (selected.length) rules.push(`${selected.join(',\n')} {${body}}`);
      }
      cursor = end;
    }
    return rules.join('\n');
  };
  return parse(source.replace(/\/\*[\s\S]*?\*\//g, ''));
}

for (const name of readdirSync(root).filter((name) => name.endsWith('.html'))) {
  const slug = name.slice(0, -5),
    file = join(root, `${slug}.ts`);
  const template = readFileSync(join(root, name), 'utf8');
  if (!template.includes('<docs-example') || !existsSync(file)) continue;
  const text = readFileSync(file, 'utf8');
  const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);
  const component = source.statements.find(
    (node) =>
      ts.isClassDeclaration(node) &&
      node.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.DefaultKeyword),
  );
  const metadata = component && metadataOf(component);
  if (!metadata) throw new Error(`Missing component in ${file}`);
  const parsed = parseTemplate(template, name, { preserveWhitespaces: true });
  if (parsed.errors?.length)
    throw new Error(parsed.errors.map((error) => error.toString()).join('\n'));
  const demos = [],
    extraTemplates = [];
  const find = (nodes) => {
    for (const node of nodes) {
      if (node.name === 'docs-example') demos.push(node);
      else if (node.tagName === 'ng-template')
        extraTemplates.push(
          template.slice(node.sourceSpan.start.offset, node.sourceSpan.end.offset),
        );
      else find(node.children ?? []);
    }
  };
  find(parsed.nodes);
  const imports = property(metadata, 'imports')
    .elements.filter((node) => !node.getText(source).startsWith('Docs'))
    .map((node) => node.getText(source));
  const members = component.members.filter(
    (node) =>
      !(
        /(?:[Cc]ode|[Rr]ows)$/.test(node.name?.getText(source) ?? '') ||
        ['example', 'examples'].includes(node.name?.getText(source))
      ),
  );
  const body = members.map((node) => print(node, source)).join('\n');
  const importsText = source.statements
    .filter(
      (node) =>
        ts.isImportDeclaration(node) && /^(@angular\/|@hyalo\/)/.test(node.moduleSpecifier.text),
    )
    .map((node) => node.getText(source))
    .join('\n');
  let helperHtml = '';
  const helpers = source.statements
    .filter((node) => ts.isClassDeclaration(node) && node !== component)
    .map((node) => {
      let code = node.getText(source);
      const helper = metadataOf(node);
      if (helper) {
        const html = property(helper, 'templateUrl');
        if (html) {
          const content = readFileSync(join(root, html.text), 'utf8');
          helperHtml += content;
          code = code.replace(
            `templateUrl: ${html.getText(source)}`,
            `template: ${JSON.stringify(content)}`,
          );
        }
        const css = property(helper, 'styleUrl');
        if (css)
          code = code.replace(
            `styleUrl: ${css.getText(source)}`,
            `styles: ${JSON.stringify(stylesOf(helper))}`,
          );
      }
      return code;
    })
    .join('\n\n');
  const namePart = slug
    .split('-')
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join('');
  const snippets = demos.map((demo, index) => {
    const html =
      template.slice(demo.startSourceSpan.end.offset, demo.endSourceSpan.start.offset).trim() +
      (extraTemplates.length ? '\n' + extraTemplates.join('\n') : '');
    const css = relevantCss(
      stylesOf(metadata) + '\n' + readFileSync('projects/docs/src/styles.css', 'utf8'),
      html + helperHtml,
    );
    const code = `${importsText}\n\n${helpers ? helpers + '\n\n' : ''}@Component({\n  selector: 'app-${slug}-example',\n  imports: [${imports.join(', ')}],\n  changeDetection: ChangeDetectionStrategy.OnPush,\n  templateUrl: './example.html',${css ? "\n  styleUrl: './example.css'," : ''}\n})\nexport class ${namePart}Example${index || ''} {\n${body}\n}\n`;
    return { html, ts: code, css };
  });
  for (const snippet of snippets) {
    snippet.html = (await format(snippet.html, { parser: 'angular', printWidth: 88 })).trim();
    snippet.ts = await format(snippet.ts, {
      parser: 'typescript',
      singleQuote: true,
      printWidth: 88,
    });
    if (snippet.css) snippet.css = await format(snippet.css, { parser: 'css', printWidth: 88 });
  }
  const single = phase2.has(slug),
    symbol = single ? 'EXAMPLE' : 'EXAMPLES',
    member = single ? 'example' : 'examples';
  const target = join(root, 'examples', `${slug}.ts`);
  mkdirSync(dirname(target), { recursive: true });
  const generated = `// Generated by tools/sync-example-sources.mjs. Edit the live demo, then regenerate.\nexport const ${symbol} = ${JSON.stringify(single ? { ...snippets[0], variants: snippets.slice(1) } : snippets, null, 2)} as const;\n`;
  write(
    target,
    await format(generated, { parser: 'typescript', singleQuote: true, printWidth: 88 }),
  );
  if (!text.includes(`from './examples/${slug}'`)) {
    const added =
      text.slice(0, component.members.pos) +
      `\n  protected readonly ${member} = ${symbol};\n` +
      text.slice(component.members.pos);
    write(file, `import { ${symbol} } from './examples/${slug}';\n` + added);
    let html = template;
    for (let index = demos.length - 1; index >= 0; index--) {
      const demo = demos[index],
        binding = single ? member : `${member}[${index}]`;
      const original = template.slice(
        demo.startSourceSpan.start.offset,
        demo.startSourceSpan.end.offset,
      );
      const updated = original.replace(
        /\[code\]="[^"]*"/,
        `[code]="${binding}.html" [tsCode]="${binding}.ts" [cssCode]="${binding}.css"`,
      );
      html =
        html.slice(0, demo.startSourceSpan.start.offset) +
        updated +
        html.slice(demo.startSourceSpan.end.offset);
    }
    write(join(root, name), html);
  } else {
    // Remove hand-maintained snippets once no rendered documentation uses them.
    const obsolete = component.members.filter((node) => {
      const name = node.name?.getText(source) ?? '';
      return /[Cc]ode$/.test(name) && !template.includes(name) && !body.includes(name);
    });
    let updated = text;
    for (const node of obsolete.reverse())
      updated = updated.slice(0, node.getStart(source)) + updated.slice(node.end);
    if (obsolete.length) write(file, updated);
  }
}
