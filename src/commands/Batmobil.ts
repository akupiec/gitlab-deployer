import { Project } from '../common/Config';
import { CommandModule } from 'yargs';
import { Response, StatusCode } from '../common/api/api.adapter';
import { BatRunner } from './abstract/BatRunner';

export class Batmobil extends BatRunner {
  protected async runPerProject(project: Project) {
    let resp = await this.cloneIfNeeded(project);
    resp = await this.stashChanges(resp);
    resp = await this.fetch(resp);

    let stages = this.config.stages.reverse();
    resp = await this.checkout(resp, stages[0]);
    resp = await this.pull(resp);

    for (let i = 0; i < stages.length - 1; i++) {
      resp = await this.runPerStage(resp, stages[i], stages[i + 1]);
    }
    return resp;
  }

  private async runPerStage(resp: Response<any>, stage: string, lowerStage: string) {
    if (resp.status === StatusCode.Error) {
      return resp;
    }
    resp = await this.checkout(resp, lowerStage);
    resp = await this.pull(resp);
    resp = await this.merge(resp, stage);
    resp = await this.push(resp);

    return resp;
  }
}

export const batmobilCommand: CommandModule = {
  command: 'batmobil [projects]',
  describe:
    'Updated all stages. Merge together stages in descending order ex prod -> uat -> qa -> dev.\n Command use local config directory to clone & merge stuff',
  builder: (yargs) =>
    yargs.positional('projects', {
      default: 'all',
      describe: 'name of affected projects separated by ,(comma)',
    }),
  handler: (argv) => {
    new Batmobil(argv).run();
  },
};
