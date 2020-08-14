import { Project } from '../common/Config';
import { PipelineCommand } from '../common/pipelines';
import { StatusCode } from '../common/api';

export class Check extends PipelineCommand {
  protected async runPerProject(project: Project) {
    const pipeline = await this.getPipeline(project, this.yargs.ref);
    if (this.yargs.await) {
      return await this.awaitPipelineCompletion(project, pipeline.data);
    } else {
      return await this.checkStatus(project);
    }
  }

  private async checkStatus(project: Project) {
    this.screenPrinter.setProjectSpinner(project, 'Searching pipeline...');

    const resp = await this.getPipeline(project, this.yargs.ref);
    const data = resp.data;
    if (resp.status === StatusCode.Success) {
      const msg = `Pipeline status: ${data.status} last update ${data.created_at}`;
      this.screenPrinter.setProjectSuccess(project, msg);
    }
    return resp;
  }
}
