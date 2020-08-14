import { Project } from '../common/Config';
import { PipelineCommand } from '../common/pipelines';
import { createNewBranch, Response, StatusCode } from '../common/api';

export class Branch extends PipelineCommand {
  protected async runPerProject(project: Project) {
    const promise = await this.createBranch(project);
    if (this.yargs.await) {
      return await this.awaitForFuturePipe(project, this.yargs.branchName);
    } else {
      return promise;
    }
  }

  private async createBranch(project: Project): Promise<Response<any>> {
    this.screenPrinter.setProjectSpinner(project, 'Creating New Branch');
    return createNewBranch(this.config.uri, project.id, this.yargs.ref, this.yargs.branchName).then(
      () => {
        this.screenPrinter.setProjectSuccess(project, 'New Branch crated');
        return { status: StatusCode.Success };
      },
      error => {
        const message = 'Cant create branch (already exists ?): ' + error;
        this.screenPrinter.setProjectError(project, message);
        return { status: StatusCode.Error, message };
      },
    );
  }
}
