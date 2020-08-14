import { Project } from '../common/Config';
import { createTagOnRef, Response, StatusCode } from '../common/api';
import { PipelineCommand } from '../common/pipelines';

export class Tags extends PipelineCommand {
  protected async runPerProject(project: Project) {
    const tag = await this.crateTag(project);

    if (this.yargs.await && tag.status === StatusCode.Success) {
      return await this.awaitForFuturePipe(project, this.yargs.tagName);
    }
    return tag;
  }

  private async crateTag(project: Project): Promise<Response<any>> {
    this.screenPrinter.setProjectSpinner(project, 'Creating Tag');
    return createTagOnRef(this.config.uri, project.id, this.yargs.tagName, this.yargs.ref).then(
      () => {
        this.screenPrinter.setProjectSuccess(project, 'New Tag crated');
        return { status: StatusCode.Success };
      },
      (error) => {
        const message = 'Cant create tag (already exists ?): ' + error;
        this.screenPrinter.setProjectError(project, message);
        return { status: StatusCode.Error, message };
      },
    );
  }
}
