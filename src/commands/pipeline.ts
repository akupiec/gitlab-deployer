import { Project } from '../common/Config';
import { PipelineCommand } from '../common/pipelines';
import { createPipeline, Response, StatusCode } from '../common/api';
import { IPipeline } from '../common/iPipeline';

export class Pipeline extends PipelineCommand {
  protected async runPerProject(project: Project) {
    const resp = await this.triggerPipeline(project);
    if (resp.status === StatusCode.Success && this.yargs.await) {
      return await this.awaitPipelineCompletion(project, resp.data);
    }
    return resp;
  }

  private triggerPipeline(project: Project): Promise<Response<IPipeline>> {
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
