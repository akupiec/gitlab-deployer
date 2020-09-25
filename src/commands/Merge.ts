import { Project } from '../common/Config';
import { CommandModule } from 'yargs';
import { MergeRunner } from './abstract/MergeRunner';

export class Merge extends MergeRunner {
  protected async runPerProject(project: Project) {
    let resp: any = await this.checkDiff(project);
    resp = await this.createMR(resp);
    resp = await this.awaitIfNeeded(resp, resp.data.sha);
    return resp;
  }
}

export const mergeCommand: CommandModule = {
  command: 'merge <sourceRef> <targetRef> <title> [projects]',
  describe:
    'creates new MergeRequest from <sourece> to <target> named by <title> on given [projects]',
  builder: (yargs) =>
    yargs
      .positional('sourceRef', {
        describe: 'git ref of source branch',
        required: true,
      })
      .positional('targetRef', {
        describe: 'git ref of source branch',
        required: true,
      })
      .positional('title', {
        describe: 'title marge request',
        required: true,
      })
      .positional('projects', {
        default: 'all',
        describe: 'name of affected projects separated by ,(comma)',
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
