import { PIPELINES_CHECK_SIZE, PIPELINES_PAGE_SIZE } from '../../costansts';
import { getPipelines } from './api';
import { IPipeline } from './model/iPipeline';

function getPipelinesByRef(
  URI: string,
  projectId: number,
  ref: string,
  page = 0,
): Promise<IPipeline[]> {
  return getPipelines(URI, projectId, PIPELINES_PAGE_SIZE, page).then((data) => {
    return data.filter((t) => t.ref === ref || String(t.sha).includes(ref));
  });
}

function getNewestPipeline(pipelines: IPipeline[]): IPipeline {
  pipelines.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  return pipelines[0];
}

export async function getPipelineByRef(
  URI: string,
  projectId: number,
  ref: string,
): Promise<IPipeline | null> {
  for (let page = 0; page < PIPELINES_CHECK_SIZE / PIPELINES_PAGE_SIZE; page++) {
    const pipelines = await getPipelinesByRef(URI, projectId, ref, page);
    if (pipelines.length) {
      return getNewestPipeline(pipelines);
    }
  }

  return null;
}
