import { Config, Project } from '../common/Config';
import { ScreenPrinter } from '../console/ScreenPrinter';
import { awaitPipelineCompletion } from '../common/pipelines';
import { createPipeline, Response, StatusCode } from '../common/api';
import { Yargs } from '../common/Yargs';

export function runPipeline(args) {
  const yargs = new Yargs(args);
  const config = new Config(yargs);
  const screenPrinter = new ScreenPrinter();

  const promises = config.projects.map(async function(project) {
    screenPrinter.addProject(project);
    screenPrinter.print();
    const resp = await triggerPipeline(project, config, yargs, screenPrinter);
    if (resp.status === StatusCode.Success && yargs.await) {
      return await awaitPipelineCompletion(project, config, yargs.ref, screenPrinter);
    }
    return resp;
  });

  screenPrinter.onEnd(promises);
}

function triggerPipeline(
  project: Project,
  config: Config,
  yargs: Yargs,
  screenPrinter: ScreenPrinter,
): Promise<Response<any>> {
  return createPipeline(config.uri, project.id, yargs.ref).then(
    data => {
      screenPrinter.setProjectSuccess(project, 'Pipeline crated');
      return {
        status: StatusCode.Success,
        data,
      };
    },
    err => {
      screenPrinter.setProjectError(project, 'Pipeline not created ' + err);
      return {
        status: StatusCode.Error,
      };
    },
  );
}
