import { Config, Project } from './config';
import { ScreenPrinter } from '../console/ScreenPrinter';
import { getPipelineByRef, StatusCode } from './api';
import { sleep } from './sleep';

export interface Pipeline {
  id: string;
  status: string;
  created_at: string;
}

export async function getPipeline(
  project: Project,
  config: Config,
  ref: string,
  screenPrinter: ScreenPrinter,
): Promise<StatusCode | Pipeline> {
  return getPipelineByRef(config.uri, project.id, ref).then(
    data => {
      if (!data) {
        screenPrinter.setProjectWarn(project, 'Pipeline Not Found');
        return StatusCode.Warn;
      } else {
        screenPrinter.updateProjectSpinner(project, 'Pipeline in progress...');
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
      (resp as Pipeline).status === 'success';

    if ((resp as Pipeline).status === 'pending') {
      screenPrinter.updateProjectSpinner(project, 'Pipeline in progress...');
    }
  }
  if (resp !== StatusCode.Error && resp !== StatusCode.Warn) {
    screenPrinter.setProjectSuccess(project, 'Congrats! Pipeline done!');
  }
}

