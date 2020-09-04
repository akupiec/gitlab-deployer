export enum IPipelineStatus {
  CREATED = 'created',
  WAITING_FOR_RESOURCE = 'waiting_for_resource',
  PREPARING = 'preparing',
  PENDING = 'pending',
  RUNNING = 'running',
  SUCCESS = 'success',
  FAILED = 'failed',
  CANCELED = 'canceled',
  SKIPPED = 'skipped',
  MANUAL = 'manual',
  SCHEDULED = 'scheduled'
}

export interface IPipeline {
  id: string;
  status: IPipelineStatus;
  created_at: string;
  ref: string;
  sha: string;
  updated_at: string;
  web_url: string;
}
