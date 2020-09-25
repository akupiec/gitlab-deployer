import { Project } from '../../common/Config';
import { getPipeline } from '../../common/api/api';
import { sleep } from '../../common/sleep';
import { CommandRunner } from './CommandRunner';
import { getPipelineByRef } from '../../common/api/api-compex';
import { IPipeline, IPipelineStatus } from '../../common/api/model/iPipeline';
import { bold } from 'chalk';
import {
  errorsAreOk,
  parseNative,
  parsePipelineFind,
  Response,
  StatusCode,
} from '../../common/api/api.adapter';
import { compose } from 'ramda';
import { IBranch } from '../../common/api/model/iBranch';

export abstract class PipelineRunner extends CommandRunner {
  protected getPipeline(project: Project, ref: string): Promise<Response<IPipeline>> {
    this.screenPrinter.setProjectSpinner(project, 'Searching pipeline...');

    const fetch = compose(
      this.responsePrinter.bind(this),
      errorsAreOk,
      parsePipelineFind,
      parseNative(project),
      getPipelineByRef,
    );
    return fetch(this.config.uri, project.id, ref);
  }

  private async awaitCompletion(
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

  private async findAndAwait(project: Project, ref: string) {
    this.screenPrinter.setProjectSpinner(project, 'More waiting....');
    await sleep(15000);
    const pipeline = await this.getPipeline(project, ref);
    if (pipeline.status === StatusCode.Error) {
      return pipeline;
    }
    return await this.awaitCompletion(project, pipeline.data);
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

  protected responsePrinter(promise: Promise<Response<IBranch>>) {
    promise.then((data) => this.screenPrinter.setRespMsg(data));
    return promise;
  }

  protected async awaitIfNeeded(resp: Response<any>, ref: string): Promise<Response<any>> {
    if (this.yargs.await && resp.status !== StatusCode.Error) {
      return await this.findAndAwait(resp.project, ref);
    }
    return resp;
  }
}
