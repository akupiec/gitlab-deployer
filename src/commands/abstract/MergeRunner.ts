import { PipelineRunner } from './PipelineRunner';
import { Project } from '../../common/Config';
import {
  diffParser,
  errorsAreOk,
  parseAcceptMR,
  parseMerge,
  parseNative,
  Response,
  StatusCode,
} from '../../common/api/api.adapter';
import { ICompare } from '../../common/api/model/iCompare';
import { createNewMergeRequest, checkDiff, autoMergeMR } from '../../common/api/api';
import { compose } from 'ramda';
import { IMerge } from '../../common/api/model/iMerge';

export abstract class MergeRunner extends PipelineRunner {
  protected checkDiff(project: Project): Promise<Response<ICompare>> {
    this.screenPrinter.setProjectSpinner(project, 'Checking diff for MR');
    const fetch = compose(
      this.responsePrinter.bind(this),
      errorsAreOk,
      diffParser,
      parseNative(project),
      checkDiff,
    );
    return fetch(this.config.uri, project.id, this.yargs.sourceRef, this.yargs.targetRef);
  }

  protected async createMR<T>(resp: Response<T>): Promise<Response<T>> {
    if (resp.status !== StatusCode.Success) {
      return resp;
    }
    this.screenPrinter.setProjectSpinner(resp.project, 'Creating New MergeRequest');
    const fetch = compose(
      this.responsePrinter.bind(this),
      errorsAreOk,
      parseMerge,
      parseNative(resp.project),
      createNewMergeRequest,
    );
    return await fetch(
      this.config.uri,
      resp.project.id,
      this.yargs.sourceRef,
      this.yargs.targetRef,
      this.yargs.title,
    );
  }

  protected async mergeMR(resp: Response<IMerge>): Promise<Response<IMerge>> {
    if (resp.status !== StatusCode.Success) {
      return resp;
    }
    this.screenPrinter.setProjectSpinner(resp.project, 'AcceptingMRs');
    const fetch = compose(
      this.responsePrinter.bind(this),
      errorsAreOk,
      parseAcceptMR,
      parseNative(resp.project),
      autoMergeMR,
    );
    return await fetch(this.config.uri, resp.project.id, resp.data.iid);
  }
}
