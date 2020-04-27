import { Project } from '../common/Config';

export enum LineType {
  String,
  Spinner,
}

export interface LineData {
  type?: LineType;
  message?: any;
}

export interface InkProps {
  name: string;
  projects: Map<Project, LineData>;
}
