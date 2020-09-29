import { Project } from '../common/Config';
import { CommandModule } from 'yargs';
import { BatRunner } from './abstract/BatRunner';
import { Response, StatusCode } from '../common/api/api.adapter';

export class BatBomb extends BatRunner {
  protected async runPerProject(project: Project) {
    let resp = await this.cloneIfNeeded(project);
    resp = await this.stashChanges(resp);
    resp = await this.fetch(resp);
    resp = await this.updateRepo(resp);
    resp = await this.mergeFFOnly(resp);
    resp = await this.push(resp);
    resp = await this.awaitIfNeeded(resp, this.yargs.sourceRef);
    return resp;
  }

  private async mergeFFOnly(resp: Response<any>): Promise<Response<any>> {
    if (resp.status === StatusCode.Error) {
      return resp;
    }
    if (!this.prevStage) {
      return {
        message: `invalid stage or config: ${this.yargs.stage}`,
        project: resp.project,
        status: StatusCode.Error,
      };
    }
    return await this.combine(resp, this.prevStage, true);
  }

  private async updateRepo(resp: any) {
    if (!this.prevStage) {
      return {
        message: `invalid stage or config: ${this.yargs.stage}`,
        project: resp.project,
        status: StatusCode.Error,
      };
    }
    resp = await this.checkout(resp, this.prevStage);
    resp = await this.pull(resp);
    resp = await this.checkout(resp, this.yargs.stage);
    resp = await this.pull(resp);
    return resp;
  }

  private get prevStage() {
    let stageIdx = this.config.stages.findIndex((s) => s === this.yargs.stage);
    return this.config.stages[stageIdx - 1];
  }
}

export const batBombCommand: CommandModule = {
  command: 'batbomb <stage>',
  describe: 'Update given <stage>.',
  builder: (yargs) =>
    yargs
      .usage(
        `gitlab-deployer batbomb <stage>

+------------------
|  Updates given <stage> using merge with previews stage defined by config "stages" block.
|  
|  For example if you have defined in config:
|    stages:
|      - release/dev
|      - release/qa
|      - release/uat
|    
|  Usage: gitlab-deployer batbomb release/qa 
|  Will basically call: git checkout release/qa; git merge release/dev
|
|  Notes:
|    - command useful only at "branch deployment flow"
|    - command use local config directory to clone & merge stuff
|    - can't hit itself with 'batbomb release/dev' :}  
+------------------ 
`,
      )
      .positional('stage', {
        describe: 'git branch name that will be updated with preview stage',
      })
      .option('await', {
        alias: 'a',
        type: 'boolean',
        default: true,
        description: 'awaits pipeline completion',
      }),
  handler: (argv) => {
    new BatBomb(argv).run();
  },
};
