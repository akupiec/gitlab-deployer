import { Config, Project } from './Config';
import { ScreenPrinter } from '../console/ScreenPrinter';
import { getPipelineByRef, Response, StatusCode } from './api';
import { sleep } from './sleep';
import { PIPELINES_PAGE_SIZE } from '../costansts';

export interface IPipeline {
  id: string;
  status: string;
  created_at: string;
}

export async function getPipeline(
  project: Project,
  config: Config,
  ref: string,
  printer: ScreenPrinter,
): Promise<Response<IPipeline>> {
  return getPipelineByRef(config.uri, project.id, ref).then(
    data => {
      if (!data) {
        const message = `Not Found in last ${PIPELINES_PAGE_SIZE} triggered pipelines`;
        printer.setProjectWarn(project, message);
        return { status: StatusCode.Warn, message };
      }
      return {
        status: StatusCode.Success,
        data: data,
      };
    },
    error => {
      printer.setProjectError(project, error.message);
      return { status: StatusCode.Error, message: error.message };
    },
  );
}

export async function awaitPipelineCompletion(
  project: Project,
  config: Config,
  ref: string,
  screenPrinter: ScreenPrinter,
): Promise<Response<any>> {
  screenPrinter.setProjectSpinner(project, 'Awaiting pipeline...');
  let resp;
  while (1) {
    resp = await getPipeline(project, config, ref, screenPrinter);
    if (resp.status === StatusCode.Success && resp.data.status === 'pending') {
      screenPrinter.setProjectSpinner(project, 'Pipeline pending...');
    } else if (resp.status === StatusCode.Success && resp.data.status === 'running') {
      screenPrinter.setProjectSpinner(project, 'Pipeline running...');
    } else if (resp.status === StatusCode.Success && resp.data.status === 'success') {
      screenPrinter.setProjectSuccess(project, 'Pipeline done!');
      break;
    } else if (resp.status === StatusCode.Success) {
      const message = `Pipeline status: ${resp.data.status}`;
      screenPrinter.setProjectError(project, message);
      resp.status = StatusCode.Error;
      resp.message = message;
      break;
    } else {
      break;
    }
    await sleep(config.refreshTime);
  }
  return resp;
}
