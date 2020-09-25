// type DateString = string; //ex.: '2020-09-21T16:44:25.000+02:00';

export interface ICommit {
  id: string;
  // "short_id": string
  // "created_at": DateString,
  // "parent_ids": string[],
  // "title": string
  // "message": string
  // "author_name": string,
  // "author_email": string,
  // "authored_date": DateString,
  // "committer_name": string,
  // "committer_email": string,
  // "committed_date": DateString,
  // "web_url": string,
}
export interface IBranch {
  name: string;
  commit: ICommit;
  merged: boolean;
  protected: boolean;
}
