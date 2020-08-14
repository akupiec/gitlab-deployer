import { Project } from '../common/Config';
import { PipelineCommand } from '../common/pipelines';
import { Response, StatusCode } from '../common/api';
import { IPipeline } from '../common/iPipeline';

export class Check extends PipelineCommand {
  protected async runPerProject(project: Project) {
    const pipeline = await this.getPipeline(project, this.yargs.ref);
    if (this.yargs.await) {
      return await this.awaitPipelineCompletion(project, pipeline.data);
    } else {
      return await this.checkStatus(project, pipeline);
    }
  }

  private async checkStatus(project: Project, pipeline: Response<IPipeline>) {
    const data = pipeline.data;
    if (pipeline.status === StatusCode.Success) {
      const msg = `Pipeline status: ${data.status} last update ${data.created_at}`;
      this.screenPrinter.setProjectSuccess(project, msg);
    }
    return pipeline;
  }
}
