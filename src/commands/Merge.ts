import { Project } from '../common/Config';
import { CommandModule } from 'yargs';
import { BatRunner } from './abstract/BatRunner';
import { Response, StatusCode } from '../common/api/api.adapter';
import chalk from 'chalk';

export class Merge extends BatRunner {
  protected async runPerProject(project: Project) {
    let resp = await this.cloneIfNeeded(project);
    resp = await this.stashChanges(resp);
    resp = await this.checkout(resp, this.yargs.targetRef);
    resp = await this.pull(resp);
    resp = await this.checkout(resp, this.yargs.sourceRef);
    resp = await this.pull(resp);
    resp = await this.combine(resp, this.yargs.targetRef, this.yargs.ffOnly);
    resp = await this.push(resp);
    resp = await this.awaitIfNeeded(resp, this.yargs.sourceRef);
    return resp;
  }
}

export const mergeCommand: CommandModule = {
  command: 'merge <sourceRef> <targetRef>',
  describe: 'Update given <sourceRef> using merge',
  builder: (yargs) =>
    yargs
      .usage(
        `gitlab-deployer merge <sourceRef> <targetRef>

+------------------
|  Updates given <sourceRef> using merge with <targetRef>
|  
|    
|  Usage: gitlab-deployer merge release/int tag/39-1 
|  Will basically call: git checkout release/int; git merge tag/39-1
|
|  Notes:
|    - command use local config directory to clone & merge stuff  
+------------------ 
`,
      )
      .positional('sourceRef', {
        type: 'string',
        alias: 'stage',
        describe: 'git branch name that will be updated',
      })
      .positional('targetRef', {
        type: 'string',
        alias: 'ref',
        describe: 'ref into which source will be updated',
      })
      .option('ff-only', {
        type: 'boolean',
        default: true,
        describe: 'self explanatory, use --ff-only flag',
      })
      .option('await', {
        alias: 'a',
        type: 'boolean',
        default: true,
        description: 'awaits pipeline completion',
      }),
  handler: (argv) => {
    new Merge(argv).run();
  },
};
