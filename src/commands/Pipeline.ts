import { Project } from '../common/Config';
import { PipelineRunner } from './abstract/PipelineRunner';
import { createPipeline, Response, StatusCode } from '../common/api/api';
import { IPipeline } from '../common/api/model/iPipeline';
import { CommandModule } from 'yargs';

export class Pipeline extends PipelineRunner {
  protected async runPerProject(project: Project) {
    const resp = await this.triggerPipeline(project);
    if (this.yargs.await && resp.status === StatusCode.Success) {
      return await this.awaitPipelineCompletion(project, resp.data);
    }
    return resp;
  }

  private triggerPipeline(project: Project): Promise<Response<IPipeline>> {
    return createPipeline(this.config.uri, project.id, this.yargs.ref).then(
      (data) => {
        this.screenPrinter.setProjectSuccess(project, 'Pipeline crated');
        return {
          status: StatusCode.Success,
          data,
        };
      },
      (err) => {
        this.screenPrinter.setProjectError(project, 'Pipeline not created ' + err);
        return {
          status: StatusCode.Error,
        };
      },
    );
  }
}

export const pipelineCommand: CommandModule = {
  command: 'pipeline <ref> [projects]',
  describe: 'trigger pipeline',
  aliases: ['redeploy'],
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
        default: true,
        description: 'awaits pipeline completion',
      }),
  handler: (argv) => new Pipeline(argv).run(),
};