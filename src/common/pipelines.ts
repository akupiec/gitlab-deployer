import { Config, Project } from './Config';
import { ScreenPrinter } from '../console/ScreenPrinter';
import { getPipelineByRef, StatusCode } from './api';
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
  screenPrinter: ScreenPrinter,
): Promise<StatusCode | IPipeline> {
  return getPipelineByRef(config.uri, project.id, ref).then(
    data => {
      if (!data) {
        screenPrinter.setProjectWarn(project, `Not Found in last ${PIPELINES_PAGE_SIZE} triggered pipelines`);
        return StatusCode.Warn;
      } else {
        screenPrinter.setProjectSpinner(project, 'Pipeline in progress...');
        return data;
      }
    },
    error => {
      screenPrinter.setProjectError(project, error.message);
      return StatusCode.Error;
    },
  );
}

export async function awaitPipelineCompletion(
  project: Project,
  config: Config,
  ref: string,
  screenPrinter: ScreenPrinter,
) {
  screenPrinter.setProjectSpinner(project, 'Awaiting pipeline...');
  let isCompleted = false;
  let resp;
  while (!isCompleted) {
    await sleep(config.refreshTime);
    resp = await getPipeline(project, config, ref, screenPrinter);
    isCompleted =
      resp === StatusCode.Error ||
      resp === StatusCode.Warn ||
      (resp as IPipeline).status === 'success';

    if ((resp as IPipeline).status === 'pending') {
      screenPrinter.setProjectSpinner(project, 'Pipeline in progress...');
    }
  }
  if (resp !== StatusCode.Error && resp !== StatusCode.Warn) {
    screenPrinter.setProjectSuccess(project, 'Congrats! Pipeline done!');
  }
}

