import { Project } from '../common/Config';
import { PipelineRunner } from './abstract/PipelineRunner';
import { findJob, playJob, Response, StatusCode } from '../common/api/api';
import { IJob } from '../common/api/model/iJob';
import { IPipeline } from '../common/api/model/iPipeline';
import { CommandModule } from 'yargs';

export class Job extends PipelineRunner {
  protected async runPerProject(project: Project) {
    const pipeline = await this.getPipeline(project, this.yargs.ref);
    if (pipeline.status !== StatusCode.Success) {
      return pipeline;
    }
    const deployPromise = await this.job(pipeline, project);

    if (this.yargs.await && deployPromise.status === StatusCode.Success) {
      return await this.awaitPipelineCompletion(project, pipeline.data);
    } else {
      return deployPromise;
    }
  }

  private async job(pipeline: Response<IPipeline>, project: Project) {
    if (pipeline.status !== StatusCode.Success || !pipeline.data.id) {
      return pipeline;
    }
    const job = await this.getJob(project, pipeline.data);
    if (job.status !== StatusCode.Success) {
      return job;
    }
    return await this.triggerJob(project, job.data);
  }

  private async getJob(project: Project, pipeline: IPipeline): Promise<Response<IJob>> {
    const stage = this.config.getStage(project);
    const uri = this.config.uri;
    return findJob(uri, project.id, pipeline.id, stage).then(
      (data) => {
        if (!data) {
          const message = 'IJob Not Found';
          this.screenPrinter.setProjectWarn(project, message);
          return {
            status: StatusCode.Warn,
            message,
          };
        }
        this.screenPrinter.setProjectSpinner(project, 'IJob in progress...');
        return {
          status: StatusCode.Success,
          data,
        };
      },
      (error) => {
        this.screenPrinter.setProjectError(project, error.message);
        return {
          status: StatusCode.Error,
          message: error.message,
        };
      },
    );
  }

  private async triggerJob(project: Project, job: IJob): Promise<Response<any>> {
    return playJob(this.config.uri, project.id, job.id).then(
      (data) => {
        this.screenPrinter.setProjectSuccess(project, 'IJob Started');
        return {
          status: StatusCode.Success,
          data,
        };
      },
      (err) => {
        this.screenPrinter.setProjectError(project, err.response.data.message);
        return {
          status: StatusCode.Error,
          message: err.response.data.message,
        };
      },
    );
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