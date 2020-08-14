import { Project } from '../common/Config';
import { PipelineCommand } from '../common/pipelines';
import { createPipeline, Response, StatusCode } from '../common/api';

export class Pipeline extends PipelineCommand {
  protected async runPerProject<T>(project: Project): Promise<Response<T>> {
    const resp = await this.triggerPipeline(project);
    if (resp.status === StatusCode.Success && this.yargs.await) {
      return await this.awaitPipelineCompletion(project, this.yargs.ref);
    }
    return resp;
  }

  private triggerPipeline(
    project: Project,
  ): Promise<Response<any>> {
    return createPipeline(this.config.uri, project.id, this.yargs.ref).then(
      data => {
        this.screenPrinter.setProjectSuccess(project, 'Pipeline crated');
        return {
          status: StatusCode.Success,
          data,
        };
      },
      err => {
        this.screenPrinter.setProjectError(project, 'Pipeline not created ' + err);
        return {
          status: StatusCode.Error,
        };
      },
    );
  }
}
