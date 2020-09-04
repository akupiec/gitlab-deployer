import { Project } from './Config';
import { getPipeline, Response, StatusCode } from './api';
import { sleep } from './sleep';
import { PIPELINES_CHECK_SIZE } from '../costansts';
import { CommandRunner } from '../commands/CommandRunner';
import { getPipelineByRef } from './api-compex';
import { IPipeline, IPipelineStatus } from './iPipeline';
import { bold } from 'chalk';

export abstract class PipelineCommand extends CommandRunner {
  protected getPipeline(project: Project, ref: string): Promise<Response<IPipeline>> {
    this.screenPrinter.setProjectSpinner(project, 'Searching pipeline...');
    return getPipelineByRef(this.config.uri, project.id, ref).then(
      (data) => {
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
      (error) => {
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

    while (1 && !!pipeline) {
      resp = await getPipeline(this.config.uri, project.id, pipeline.id);
      if (resp.status === 'pending') {
        this.screenPrinter.setProjectSpinner(project, 'Pipeline pending...');
      } else if (resp.status === 'running') {
        this.screenPrinter.setProjectSpinner(project, 'Pipeline running...');
      } else {
        return this.parsePipelineResp(project, resp);
      }
      await sleep(this.config.refreshTime);
    }
    return {
      message: 'Pipeline not Found!',
      status: StatusCode.Error,
      data: resp,
    };
  }

  protected async awaitForFuturePipe(project: Project, ref: string) {
    this.screenPrinter.setProjectSpinner(project, 'Awaiting pipeline creation...');
    await sleep(15000);
    const pipeline = await this.getPipeline(project, ref);
    if (pipeline.status !== StatusCode.Success) {
      return pipeline;
    }
    return await this.awaitPipelineCompletion(project, pipeline.data);
  }

  protected parsePipelineResp(project: Project, resp: IPipeline): Response<IPipeline> {
    let lastMessage;
    let lastStatus;

    if (resp.status === 'success') {
      this.screenPrinter.setProjectSuccess(project, 'Pipeline done!');
      lastMessage = 'Pipeline done!';
      lastStatus = StatusCode.Success;
    } else if (resp.status === IPipelineStatus.FAILED) {
      let message = `Pipeline: ${bold(resp.status)}`;
      message += `\nLink: ${resp.web_url}`;
      this.screenPrinter.setProjectError(project, message);
      lastMessage = message;
      lastStatus = StatusCode.Error;
    } else if (resp.status) {
      let message = `Pipeline: ${bold(resp.status)}`;
      message += `\nLink: ${resp.web_url}`;
      this.screenPrinter.setProjectWarn(project, message);
      lastMessage = message;
      lastStatus = StatusCode.Warn;
    } else {
      lastMessage = 'Pipeline not Found!';
      lastStatus = StatusCode.Error;
    }

    return {
      message: lastMessage,
      status: lastStatus,
      data: resp,
    };
  }
}
