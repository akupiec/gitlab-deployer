import * as fs from 'fs';
import { validateConfig } from './validateConfig';
import * as chalk from 'chalk';
import { Yargs } from './Yargs';

const YAML = require('yaml');

export interface Project {
  name: string;
  id: number;
  repo: string;
}

export class Config {
  private _yargs: Yargs;
  private _config: any;

  constructor(yargs: Yargs) {
    this._yargs = yargs;
    this.initConfig();
  }

  get projects(): Project[] {
    const projects = [];
    for (let projectKey in this._config.projects) {
      if (!this._config.projects.hasOwnProperty(projectKey)) {
        continue;
      }
      if (projectKey.includes(this._yargs.project) || this._yargs.project === 'all') {
        projects.push({
          name: projectKey,
          id: this._config.projects[projectKey],
        });
      }
    }
    return projects;
  }

  get refreshTime() {
    let time = this._config['refresh-time'];
    return time < 5000 ? 5000 : time;
  }

  get uri(): string {
    return this._config['base-api'];
  }

  public getStage(project: Project) {
    const stage = this._yargs.stage;
    if (!this._config.deploy) return stage;

    const jobName = this._config.deploy[project.name];
    if (!jobName) return stage;

    return jobName[stage] || stage;
  }

  private initConfig() {
    let path = this._yargs.configPath;
    if (fs.existsSync(path)) {
      const file = fs.readFileSync(path, 'utf8');
      this._config = YAML.parse(file);
      if (!validateConfig(this._config)) {
        console.error(chalk.red('[ERROR] configuration file is invalid try using config creator'));
        process.exit(-1);
      }
    } else {
      console.error(chalk.red('[ERROR] configuration file is required, try using config creator'));
      process.exit(-1);
    }
  }
}

