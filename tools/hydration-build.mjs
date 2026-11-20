import { Architect } from '@angular-devkit/architect';
import { WorkspaceNodeModulesArchitectHost } from '@angular-devkit/architect/node/index.js';
import { workspaces, schema } from '@angular-devkit/core';
import { NodeJsSyncHost } from '@angular-devkit/core/node/index.js';
const root = process.cwd();
const { workspace } = await workspaces.readWorkspace(
  root,
  workspaces.createWorkspaceHost(new NodeJsSyncHost()),
);
const host = new WorkspaceNodeModulesArchitectHost(workspace, root);
const architect = new Architect(host, new schema.CoreSchemaRegistry());
const run = await architect.scheduleTarget(
  { project: 'docs', target: 'build', configuration: 'development' },
  {
    browser: 'projects/docs/hydration-fixture/main.ts',
    server: 'projects/docs/hydration-fixture/server.ts',
    index: 'projects/docs/hydration-fixture/index.html',
    tsConfig: 'projects/docs/hydration-fixture/tsconfig.json',
    outputPath: 'dist/hydration-fixture',
    outputMode: 'static',
    styles: ['projects/hyalo/styles/hyalo.css'],
    optimization: false,
    sourceMap: true,
  },
  { logger: (await import('@angular-devkit/core/node/index.js')).createConsoleLogger() },
);
try {
  const result = await run.result;
  console.log(JSON.stringify({ success: result.success }));
  if (!result.success) process.exitCode = 1;
} finally {
  await run.stop();
}
