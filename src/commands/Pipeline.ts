import { Project } from '../common/Config';
import { PipelineRunner } from './abstract/PipelineRunner';
import { createPipeline } from '../common/api/api';
import { IPipeline } from '../common/api/model/iPipeline';
import { CommandModule } from 'yargs';
import {
  errorsAreOk,
  parseNative,
  parsePipeline,
  Response,
  StatusCode,
} from '../common/api/api.adapter';
import { compose } from 'ramda';

export class Pipeline extends PipelineRunner {
  protected async runPerProject(project: Project) {
    const resp = await this.triggerPipeline(project);
    if (this.yargs.await && resp.status === StatusCode.Success) {
      return await this.awaitPipelineCompletion(project, resp.data);
    }
    return resp;
  }

  private triggerPipeline(project: Project): Promise<Response<IPipeline>> {
    const fetch = compose(
      this.responsePrinter.bind(this),
      errorsAreOk,
      parsePipeline,
      parseNative(project),
      createPipeline,
    );
    return fetch(this.config.uri, project.id, this.yargs.ref);
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
