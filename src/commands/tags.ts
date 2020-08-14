import { Project } from '../common/Config';
import { createTagOnRef, Response, StatusCode } from '../common/api';
import { PipelineCommand } from '../common/pipelines';
import { sleep } from '../common/sleep';

export class Tags extends PipelineCommand {
  protected async runPerProject(project: Project) {
    const tag = await this.crateTag(project);

    if (this.yargs.await && tag.status === StatusCode.Success) {
      return await this.awaitTagCreation(project);
    }
    return tag;
  }

  private async awaitTagCreation(project: Project) {
    this.screenPrinter.setProjectSpinner(project, 'Awaiting pipeline creation...');
    await sleep(15000);
    const pipeline = await this.getPipeline(project, this.yargs.tagName);
    if (pipeline.status !== StatusCode.Success) {
      return pipeline;
    }
    return await this.awaitPipelineCompletion(project, pipeline.data);
  }

  private async crateTag(project: Project): Promise<Response<any>> {
    this.screenPrinter.setProjectSpinner(project, 'Creating Tag');
    return createTagOnRef(this.config.uri, project.id, this.yargs.tagName, this.yargs.ref).then(
      () => {
        this.screenPrinter.setProjectSuccess(project, 'New Tag crated');
        return { status: StatusCode.Success };
      },
      error => {
        const message = 'Cant create tag (already exists ?): ' + error;
        this.screenPrinter.setProjectError(project, message);
        return { status: StatusCode.Error, message };
      },
    );
  }
}
