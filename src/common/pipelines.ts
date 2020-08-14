import { Project } from './Config';
import { Response, StatusCode } from './api';
import { sleep } from './sleep';
import { PIPELINES_CHECK_SIZE } from '../costansts';
import { CommandRunner } from '../commands/CommandRunner';
import { getPipelineByRef } from './api-compex';
import { IPipeline } from './iPipeline';

export abstract class PipelineCommand extends CommandRunner {
  protected getPipeline(project: Project, ref: string): Promise<Response<IPipeline>> {
    return getPipelineByRef(this.config.uri, project.id, ref).then(
      data => {
        if (!data) {
          const message = `Not Found in last ${PIPELINES_CHECK_SIZE} triggered pipelines`;
          this.screenPrinter.setProjectWarn(project, message);
          return { status: StatusCode.Warn, message };
        }
        return {
          status: StatusCode.Success,
          data: data,
        };
      },
      error => {
        this.screenPrinter.setProjectError(project, error.message);
        return { status: StatusCode.Error, message: error.message };
      },
    );
  }

  protected async awaitPipelineCompletion(project: Project, ref: string): Promise<Response<any>> {
    this.screenPrinter.setProjectSpinner(project, 'Awaiting pipeline...');
    let resp;
    while (1) {
      resp = await this.getPipeline(project, ref);
      if (resp.status === StatusCode.Success && resp.data.status === 'pending') {
        this.screenPrinter.setProjectSpinner(project, 'Pipeline pending...');
      } else if (resp.status === StatusCode.Success && resp.data.status === 'running') {
        this.screenPrinter.setProjectSpinner(project, 'Pipeline running...');
      } else if (resp.status === StatusCode.Success && resp.data.status === 'success') {
        this.screenPrinter.setProjectSuccess(project, 'Pipeline done!');
        break;
      } else if (resp.status === StatusCode.Success) {
        const message = `Pipeline status: ${resp.data.status}`;
        this.screenPrinter.setProjectError(project, message);
        resp.status = StatusCode.Error;
        resp.message = message;
        break;
      } else {
        break;
      }
      await sleep(this.config.refreshTime);
    }
    return resp;
  }
}
