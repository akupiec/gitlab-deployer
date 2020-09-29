import { Project } from '../common/Config';
import { CommandModule } from 'yargs';
import { Response, StatusCode } from '../common/api/api.adapter';
import { BatRunner } from './abstract/BatRunner';
import chalk from 'chalk';

export class Batarang extends BatRunner {
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

    this.displayLogs(resp);
    return resp;
  }

  protected postRun(promises: Promise<Response<any>>[]) {
    Promise.all(promises).then((resp) => {
      if (resp.some((r) => r.status === StatusCode.Error)) {
        const log = `To automatically resolve conflict you may try one of the commands:
- git merge -Xours release/int ${chalk.blueBright('#if this is your day')}
- git rebase -Xtheirs --empty=keep --reapply-cherry-picks release/int ${chalk.blueBright(
          '#you will exhaust all your luck at least for a week',
        )}
- git rebase -Xtheirs --empty=drop ${chalk.blueBright('#go play lotto instead, this is the day!')}
`;
        console.log(chalk.yellow(log));
      }
    });
  }

  private async runPerStage(resp: Response<any>, stage: string, lowerStage: string) {
    if (resp.status !== StatusCode.Success) {
      return resp;
    }
    resp = await this.checkout(resp, lowerStage);
    resp = await this.pull(resp);
    resp = await this.combine(resp, stage);
    this.keepsLogs(resp, stage, lowerStage);
    resp = await this.push(resp);
    resp = await this.awaitIfNeeded(resp, lowerStage);

    return resp;
  }

  logs = [];

  private keepsLogs(resp: Response<any>, stage: string, lowerStage: string) {
    this.logs.push({
      status: resp.status,
      message: resp.message,
      project: resp.project,
      lowerStage,
      stage,
    });
  }

  private displayLogs(resp: Response<any>) {
    if (resp.status !== StatusCode.Success) {
      return resp;
    }
    const msg = this.logs
      .filter((l) => l.project === resp.project)
      .map((l) => {
        switch (l.status) {
          case StatusCode.Success:
            const ok = chalk.green.bold('[OK] ') + l.message.trim();
            return `${ok} From: ${l.stage} into: ${l.lowerStage}`;
          case StatusCode.Warn:
            const warn = chalk.yellow.bold('[Warn] ') + l.message.trim();
            return `${warn} From: ${l.stage} into: ${l.lowerStage}`;
          case StatusCode.Error:
            const err = chalk.red.bold('[ERR] ') + l.message.trim();
            return `${err} From: ${l.stage} into: ${l.lowerStage}`;
        }
      });
    this.screenPrinter.setProjectMessage(resp.project, msg.join('\n'));
  }
}

export const batarangCommand: CommandModule = {
  command: 'batarang',
  describe: 'Call batarang to update all stages!',
  builder: (yargs) =>
    yargs
      .usage(
        `gitlab-deployer batarang
        
+------------------
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
      )
      .option('rebase', {
        alias: 'r',
        description: `use 'git rebase' instead of 'git merge'`,
        default: false,
      })
      .option('await', {
        alias: 'a',
        type: 'boolean',
        default: true,
        description: 'awaits pipeline completion',
      }),

  handler: (argv) => {
    new Batarang(argv).run();
  },
};
