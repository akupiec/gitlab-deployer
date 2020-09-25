export interface IMerge {
  id: number;
  iid: string;
  project_id: number;
  state: string; //"opened",
  has_conflicts: boolean;
  changes_count: string | null;
  sha: string;
  merge_error: null;
  web_url: string;
  // "title": "tttt",
  // "description": null,
  // "created_at": "2020-09-23T17:41:28.280Z",
  // "updated_at": "2020-09-23T17:41:28.280Z",
  // "merged_by": null,
  // "merged_at": null,
  // "closed_by": null,
  // "closed_at": null,
  // "target_branch": "master",
  // "source_branch": "release/test1",
  // "user_notes_count": number,
  // "upvotes": number,
  // "downvotes": number,
  // "author": any,
  // "assignees": [],
  // "assignee": null,
  // "source_project_id": number,
  // "target_project_id": number,
  // "labels": [],
  // "work_in_progress": false,
  // "milestone": null,
  // "merge_when_pipeline_succeeds": false,
  // "merge_status": "checking",
  // "merge_commit_sha": null,
  // "squash_commit_sha": null,
  // "discussion_locked": null,
  // "should_remove_source_branch": null,
  // "force_remove_source_branch": null,
  // "reference": "!1486",
  // "references": {
  //   "short": "!1486",
  //   "relative": "!1486",
  //   "full": "lines/lines-frontend!1486"
  // },

  // "time_stats": {
  //   "time_estimate": number,
  //   "total_time_spent": number,
  //   "human_time_estimate": null,
  //   "human_total_time_spent": null
  // },
  // "squash": false,
  // "task_completion_status": {
  //   "count": number,
  //   "completed_count": 0
  // },
  // "blocking_discussions_resolved": true,
  // "subscribed": true,
  // "latest_build_started_at": null,
  // "latest_build_finished_at": null,
  // "first_deployed_to_production_at": null,
  // "pipeline": null,
  // "head_pipeline": null,
  // "diff_refs": {
  //   "base_sha": "d3a69a362d8af5ba4fe36af3a3fb771df7576622",
  //   "head_sha": "d3a69a362d8af5ba4fe36af3a3fb771df7576622",
  //   "start_sha": "20860ebffb5c6b7b4b5a01aa5e62edb09982cde1"
  // },
  // "merge_error": null,
  // "user": {
  //   "can_merge": true
  // }
}
