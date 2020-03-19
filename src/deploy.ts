import { Config, Project, Yargs } from './common/config';
import { ScreenPrinter } from './console/ScreenPrinter';
import { awaitPipelineCompletion, getPipeline, Pipeline } from './common/pipelines';
import { findJob, playJob, StatusCode } from './common/api';
import { Job } from './common/job';

export function runDeploy(args) {
  const yargs = new Yargs(args);
  const config = new Config(yargs);
  const screenPrinter = new ScreenPrinter();

  const promises = config.projects.map(async function(project) {
    screenPrinter.addProject(project);
    screenPrinter.print();
    const pipeline = (await getPipeline(project, yargs.ref, screenPrinter)) as Pipeline;
    if (!pipeline.id) return;
    const stage = config.getStage(project);
    const job = (await getJob(project, pipeline, stage, screenPrinter)) as Job;
    if (!job.id) return;
    const trigJob = await triggerJob(project, job, screenPrinter) as Job;
    if (!trigJob.id) return;
    return awaitComplete(project, config, yargs, screenPrinter);
  });

  screenPrinter.onEnd(promises);
}

async function awaitComplete(
  project: Project,
  config: Config,
  yargs: Yargs,
  screenPrinter: ScreenPrinter,
) {
  if (!yargs.await) return;
  await awaitPipelineCompletion(project, yargs.ref, screenPrinter, config.refreshTime);
}

export async function getJob(
  project: Project,
  pipeline: Pipeline,
  stage: string,
  screenPrinter: ScreenPrinter,
): Promise<StatusCode | Job> {
  return findJob(project.id, pipeline.id, stage).then(
    data => {
      if (!data) {
        screenPrinter.setProjectWarn(project, 'Job Not Found');
        return StatusCode.Warn;
      } else {
        screenPrinter.updateProjectSpinner(project, 'Job in progress...');
        return data;
      }
    },
    error => {
      screenPrinter.setProjectError(project, error.message);
      return StatusCode.Error;
    },
  );
}

export async function triggerJob(project: Project, job: Job, screenPrinter: ScreenPrinter) {
  return playJob(project.id, job.id).then(
    (data) => {
      screenPrinter.setProjectSuccess(project, 'Job Started');
      return data;
    },
    err => {
      screenPrinter.setProjectError(project, err.response.data.message);
      return StatusCode.Error;
    },
  );
}
