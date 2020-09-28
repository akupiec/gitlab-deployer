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
    resp = await this.combine(resp, stage);
    resp = await this.push(resp);

    return resp;
  }
}

export const batmobilCommand: CommandModule = {
  command: 'batmobil',
  describe: 'Call batmobil to update all stages!',
  builder: (yargs) =>
    yargs.usage(
      `+------------------
|  Updated all stages. Combine together stages in descending order.
|  
|  
|  For example if you have defined in config:
|    stages:
|      - release/dev
|      - release/qa
|      - release/uat
|    
|  Will basically: 
|    rebase release/qa over release/uat, then rebase release/dev over release/qa
|
|  Notes:
|    - command useful only at "branch deployment flow"
|    - command use local config directory to clone & rebase stuff.
+------------------ 
`,
    ),
  handler: (argv) => {
    new Batmobil(argv).run();
  },
};
