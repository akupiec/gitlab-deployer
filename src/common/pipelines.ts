import { Project } from './Config';
import { getPipeline, Response, StatusCode } from './api';
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

  protected async awaitPipelineCompletion(
    project: Project,
    pipeline: IPipeline,
  ): Promise<Response<IPipeline>> {
    this.screenPrinter.setProjectSpinner(project, 'Awaiting pipeline...');
    let resp: IPipeline;
    let lastMessage;
    let lastStatus;

    while (1) {
      resp = await getPipeline(this.config.uri, project.id, pipeline.id);
      if (resp.status === 'pending') {
        this.screenPrinter.setProjectSpinner(project, 'Pipeline pending...');
      } else if (resp.status === 'running') {
        this.screenPrinter.setProjectSpinner(project, 'Pipeline running...');
      } else if (resp.status === 'success') {
        this.screenPrinter.setProjectSuccess(project, 'Pipeline done!');
        lastMessage = 'Pipeline done!';
        lastStatus = StatusCode.Success;
        break;
      } else if (resp.status) {
        const message = `Pipeline status: ${resp.status}`;
        this.screenPrinter.setProjectError(project, message);
        lastMessage = message;
        lastStatus = StatusCode.Error;
        break;
      } else {
        lastMessage = 'Pipeline not Found!';
        lastStatus = StatusCode.Error;
        break;
      }
      await sleep(this.config.refreshTime);
    }
    return {
      message: lastMessage,
      status: lastStatus,
      data: resp,
    };
  }
}
