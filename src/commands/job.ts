import { Project } from '../common/Config';
import { PipelineCommand } from '../common/pipelines';
import { findJob, playJob, Response, StatusCode } from '../common/api';
import { IJob } from '../common/iJob';
import { IPipeline } from '../common/iPipeline';

export class Job extends PipelineCommand {
  protected async runPerProject(project: Project) {
    const pipeline = await this.getPipeline(project, this.yargs.ref);
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
      data => {
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
      error => {
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
      data => {
        this.screenPrinter.setProjectSuccess(project, 'IJob Started');
        return {
          status: StatusCode.Success,
          data,
        };
      },
      err => {
        this.screenPrinter.setProjectError(project, err.response.data.message);
        return {
          status: StatusCode.Error,
          message: err.response.data.message,
        };
      },
    );
  }
}
