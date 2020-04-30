import { Config, Project } from '../common/Config';
import { ScreenPrinter } from '../console/ScreenPrinter';
import { awaitPipelineCompletion, getPipeline, IPipeline } from '../common/pipelines';
import { findJob, playJob, Response, StatusCode } from '../common/api';
import { IJob } from '../common/iJob';
import { Yargs } from '../common/Yargs';

export function runDeploy(args) {
  const yargs = new Yargs(args);
  const config = new Config(yargs);
  const screenPrinter = new ScreenPrinter();

  const promises = config.projects.map(async function(project) {
    screenPrinter.addProject(project);
    screenPrinter.print();
    const deployPromise = await deploy(project, config, yargs, screenPrinter);

    if (yargs.await && deployPromise.status === StatusCode.Success) {
      return await awaitPipelineCompletion(project, config, yargs.ref, screenPrinter);
    } else {
      return deployPromise;
    }
  });

  screenPrinter.onEnd(promises);
}

async function deploy(project: Project, config: Config, yargs: Yargs, painter: ScreenPrinter) {
  const pipeline = await getPipeline(project, config, yargs.ref, painter);
  if (pipeline.status !== StatusCode.Success || !pipeline.data.id) {
    return pipeline;
  }
  const job = await getJob(project, pipeline.data, config, painter);
  if (job.status !== StatusCode.Success) {
    return job;
  }
  return await triggerJob(project, job.data, config, painter);
}

export async function getJob(
  project: Project,
  pipeline: IPipeline,
  config: Config,
  screenPrinter: ScreenPrinter,
): Promise<Response<IJob>> {
  const stage = config.getStage(project);
  const uri = config.uri;
  return findJob(uri, project.id, pipeline.id, stage).then(
    data => {
      if (!data) {
        const message = 'IJob Not Found';
        screenPrinter.setProjectWarn(project, message);
        return {
          status: StatusCode.Warn,
          message,
        };
      }
      screenPrinter.setProjectSpinner(project, 'IJob in progress...');
      return {
        status: StatusCode.Success,
        data,
      };
    },
    error => {
      screenPrinter.setProjectError(project, error.message);
      return {
        status: StatusCode.Error,
        message: error.message,
      };
    },
  );
}

export async function triggerJob(
  project: Project,
  job: IJob,
  config: Config,
  screenPrinter: ScreenPrinter,
): Promise<Response<any>> {
  return playJob(config.uri, project.id, job.id).then(
    data => {
      screenPrinter.setProjectSuccess(project, 'IJob Started');
      return {
        status: StatusCode.Success,
        data,
      };
    },
    err => {
      screenPrinter.setProjectError(project, err.response.data.message);
      return {
        status: StatusCode.Error,
        message: err.response.data.message,
      };
    },
  );
}
