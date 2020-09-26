import { Project } from '../common/Config';
import { PipelineRunner } from './abstract/PipelineRunner';
import { createPipeline } from '../common/api/api';
import { IPipeline } from '../common/api/model/iPipeline';
import { CommandModule } from 'yargs';
import { errorsAreOk, parseNative, parsePipeline, Response } from '../common/api/api.adapter';
import { compose } from 'ramda';

export class Pipeline extends PipelineRunner {
  protected async runPerProject(project: Project) {
    let resp = await this.triggerPipeline(project);
    resp = await this.awaitIfNeeded(resp, this.yargs.ref);
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
  command: 'pipeline <ref>',
  describe: 'trigger pipeline',
  aliases: ['redeploy'],
  builder: (yargs) =>
    yargs
      .positional('ref', {
        describe: 'git ref position can be tag, branch or hash',
      })
      .option('await', {
        alias: 'a',
        type: 'boolean',
        default: true,
        description: 'awaits pipeline completion',
      }),
  handler: (argv) => new Pipeline(argv).run(),
};
