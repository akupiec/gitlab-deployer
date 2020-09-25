import { Project } from '../common/Config';
import { PipelineRunner } from './abstract/PipelineRunner';
import { findJob, playJob } from '../common/api/api';
import { IJob } from '../common/api/model/iJob';
import { IPipeline } from '../common/api/model/iPipeline';
import { CommandModule } from 'yargs';
import {
  errorsAreOk,
  parseJob,
  parseJobTrigger,
  parseNative,
  Response,
  StatusCode,
} from '../common/api/api.adapter';
import { compose } from 'ramda';

export class Job extends PipelineRunner {
  protected async runPerProject(project: Project) {
    let resp = await this.getPipeline(project, this.yargs.ref);
    if (resp.status !== StatusCode.Success) {
      return resp;
    }
    resp = await this.findJob(resp, project);
    resp = await this.triggerJob(project, resp);
    return await this.awaitIfNeeded(resp, this.yargs.ref);
  }

  private async findJob(pipeline: Response<IPipeline>, project: Project) {
    const fetch = compose(
      this.responsePrinter.bind(this),
      errorsAreOk,
      parseJob,
      parseNative(project),
      findJob,
    );
    return fetch(this.config.uri, project.id, pipeline.data.id, this.config.getStage(project));
  }

  private async triggerJob(
    project: Project,
    job: Response<IJob | IPipeline>,
  ): Promise<Response<any>> {
    if (job.status !== StatusCode.Success) {
      return job;
    }
    const fetch = compose(
      this.responsePrinter.bind(this),
      errorsAreOk,
      parseJobTrigger,
      parseNative(project),
      playJob,
    );
    return fetch(this.config.uri, project.id, job.data.id);
  }
}

export const jobCommand: CommandModule = {
  command: 'job <ref> [jobName] [projects]',
  describe: 'runs single pipeline job',
  aliases: ['deploy'],
  builder: (yargs) =>
    yargs
      .positional('ref', {
        describe: 'git ref position what should be deployed',
      })
      .positional('jobName', {
        alias: 'stage',
        default: 'dev',
        describe: 'name of stage job that will be triggered',
      })
      .positional('projects', {
        default: 'all',
        describe: 'name of affected projects separated by ,(comma)',
        type: 'string',
      })
      .option('await', {
        alias: 'a',
        type: 'boolean',
        default: true,
        description: 'awaits pipeline completion',
      }),
  handler: (argv) => {
    new Job(argv).run();
  },
};
