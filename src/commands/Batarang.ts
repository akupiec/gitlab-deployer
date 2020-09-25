import { Project } from '../common/Config';
import { CommandModule } from 'yargs';
import { BatRunner } from './abstract/BatRunner';
import { Response, StatusCode } from '../common/api/api.adapter';

export class Batarang extends BatRunner {
  protected async runPerProject(project: Project) {
    let resp = await this.cloneIfNeeded(project);
    resp = await this.stashChanges(resp);
    resp = await this.fetch(resp);
    resp = await this.checkout(resp, this.yargs.stage);
    resp = await this.pull(resp);
    resp = await this.mergeFFOnly(resp);
    resp = await this.push(resp);
    return resp;
  }

  private async mergeFFOnly(resp: Response<any>): Promise<Response<any>> {
    let stageIdx = this.config.stages.findIndex((s) => s === this.yargs.stage);
    const prevStage = this.config.stages[stageIdx - 1];
    if (!prevStage) {
      return {
        message: `invalid stage or config: ${this.yargs.stage}`,
        project: resp.project,
        status: StatusCode.Error,
      };
    }
    return await this.merge(resp, prevStage, true);
  }
}

export const batarangCommand: CommandModule = {
  command: 'batarang <stage> [projects]',
  describe:
    'Update given <stage> using ff-only merge.\nex.: git checkout prod; git merge --ff-only uat',
  builder: (yargs) =>
    yargs
      .positional('stage', {
        describe: 'git branch name that will be updated with preview stage',
      })
      .positional('projects', {
        default: 'all',
        describe: 'name of affected projects separated by ,(comma)',
      }),
  handler: (argv) => {
    new Batarang(argv).run();
  },
};
