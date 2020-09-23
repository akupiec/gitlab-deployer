import { Project } from '../common/Config';
import { PipelineRunner } from './abstract/PipelineRunner';
import { Response, StatusCode } from '../common/api/api';
import { IPipeline, IPipelineStatus } from '../common/api/model/iPipeline';
import { bold } from 'chalk';
import { CommandModule } from 'yargs';

export class Check extends PipelineRunner {
  protected async runPerProject(project: Project) {
    const pipeline = await this.getPipeline(project, this.yargs.ref);
    if (this.yargs.await && pipeline.status === StatusCode.Success) {
      return await this.awaitPipelineCompletion(project, pipeline.data);
    } else {
      return await this.checkStatus(project, pipeline);
    }
  }

  private async checkStatus(project: Project, pipeline: Response<IPipeline>) {
    const data = pipeline.data;
    if (pipeline.status === StatusCode.Success) {
      let msg = `Pipeline status: ${bold(data.status)}`;
      if (data.status === IPipelineStatus.SUCCESS) {
        this.screenPrinter.setProjectSuccess(project, msg);
      } else if (data.status === IPipelineStatus.FAILED) {
        msg += `\nLink: ${data.web_url}`;
        this.screenPrinter.setProjectError(project, msg);
      } else {
        msg += `\nLink: ${data.web_url}`;
        this.screenPrinter.setProjectWarn(project, msg);
      }
    }
    return pipeline;
  }
}

export const checkCommand: CommandModule = {
  command: 'check <ref> [projects]',
  describe: 'check status of pipeline',
  builder: (yargs) =>
    yargs
      .positional('ref', {
        describe: 'git ref position can be tag, branch or hash',
      })
      .positional('projects', {
        default: 'all',
        describe: 'name of affected projects separated by ,(comma)',
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