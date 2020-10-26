import { Project } from '../common/Config';
import { PipelineRunner } from './abstract/PipelineRunner';
import { CommandModule } from 'yargs';
import { Response, StatusCode } from '../common/api/api.adapter';
import { IPipeline } from '../common/api/model/iPipeline';

export class AreEquals extends PipelineRunner {
  protected async runPerProject(project: Project) {
    let pipelineA = await this.getPipeline(project, this.yargs.ref);
    pipelineA = await this.awaitIfNeeded(pipelineA, this.yargs.ref);
    let pipelineB = await this.getPipeline(project, this.yargs.refB);
    pipelineB = await this.awaitIfNeeded(pipelineB, this.yargs.refB);

    const ret = AreEquals.compare(pipelineA, pipelineB);
    this.screenPrinter.setRespMsg(ret);
    return ret;
  }

  private static compare(
    pipelineA: Response<IPipeline>,
    pipelineB: Response<IPipeline>,
  ): Response<any> {
    if (pipelineB.data.sha == pipelineA.data.sha) {
      if (pipelineB.status != StatusCode.Success || pipelineA.status != StatusCode.Success) {
        return {
          status: pipelineB.status & pipelineA.status,
          project: pipelineA.project,
          message: 'Refs are equals, but there are some issues on pipelines',
        };
      }

      return {
        status: StatusCode.Success,
        project: pipelineA.project,
        message: 'Refs are equals',
      };
    }
    return {
      status: StatusCode.Error,
      project: pipelineA.project,
      message: 'Refs are NOT equal',
    };
  }
}

export const areEqualsCommand: CommandModule = {
  command: 'areEquals <ref> <refB>',
  describe: 'check id two refs are equals',
  builder: (yargs) =>
    yargs
      .positional('ref', {
        describe: 'git ref position can be tag, branch or hash',
      })
      .positional('refB', {
        describe: 'git ref position can be tag, branch or hash',
      })
      .option('await', {
        alias: 'a',
        type: 'boolean',
        default: false,
        description: 'awaits pipeline completion',
      }),
  handler: (argv) => {
    new AreEquals(argv).run();
  },
};
