import { Project } from '../common/Config';
import { PipelineCommand } from '../common/pipelines';
import { Response, StatusCode } from '../common/api';
import { IPipeline, IPipelineStatus } from '../common/iPipeline';
import { bold } from 'chalk';

export class Check extends PipelineCommand {
  protected async runPerProject(project: Project) {
    const pipeline = await this.getPipeline(project, this.yargs.ref);
    if (this.yargs.await && pipeline.status === StatusCode.Success) {
      return await this.awaitPipelineCompletion(project, pipeline.data);
    } else {
      return await this.checkStatus(project, pipeline);
    }
  }

  private async checkStatus(project: Project, pipeline: Response<IPipeline>) {
    const data = pipeline.data;
    if (pipeline.status === StatusCode.Success) {
      let msg = `Pipeline status: ${bold(data.status)}`;
      if (data.status === IPipelineStatus.SUCCESS) {
        this.screenPrinter.setProjectSuccess(project, msg);
      } else if (data.status === IPipelineStatus.FAILED) {
        msg += `\nLink: ${data.web_url}`;
        this.screenPrinter.setProjectError(project, msg);
      } else {
        msg += `\nLink: ${data.web_url}`;
        this.screenPrinter.setProjectWarn(project, msg);
      }
    }
    return pipeline;
  }
}
