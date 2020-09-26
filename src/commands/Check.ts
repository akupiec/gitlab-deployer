import { Project } from '../common/Config';
import { PipelineRunner } from './abstract/PipelineRunner';
import { CommandModule } from 'yargs';

export class Check extends PipelineRunner {
  protected async runPerProject(project: Project) {
    const pipeline = await this.getPipeline(project, this.yargs.ref);
    return await this.awaitIfNeeded(pipeline, this.yargs.ref);
  }
}

export const checkCommand: CommandModule = {
  command: 'check <ref>',
  describe: 'check status of pipeline',
  builder: (yargs) =>
    yargs
      .positional('ref', {
        describe: 'git ref position can be tag, branch or hash',
      })
      .option('await', {
        alias: 'a',
        type: 'boolean',
        default: false,
        description: 'awaits pipeline completion',
      }),
  handler: (argv) => {
    new Check(argv).run();
  },
};
