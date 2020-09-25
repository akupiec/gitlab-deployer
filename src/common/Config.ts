import * as fs from 'fs';
import { isConfigOld, validateConfig } from './validateConfig';
import { Yargs } from './Yargs';
import { execSync } from 'child_process';

const chalk = require('chalk');
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
      if (this.isMatchingYargsSelector(projectKey)) {
        projects.push({
          name: projectKey,
          id: this._config.projects[projectKey].id,
          repo: this._config.projects[projectKey].repo,
        });
      }
    }
    return projects;
  }

  private isMatchingYargsSelector(projectKey: string): boolean {
    if (this._yargs.projects === 'all') {
      return true;
    }
    const projectSelector = this._yargs.projects.split(',');
    return projectSelector.some((selector) => projectKey.includes(selector));
  }

  get refreshTime() {
    let time = this._config['refresh-time'];
    return time < 5000 ? 5000 : time;
  }

  get uri(): string {
    return this._config['base-api'];
  }

  get stages(): string[] {
    return this._config['stages'];
  }

  get tempPath(): string {
    return this._config['temp-path'];
  }

  getStage(project: Project) {
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
      if (isConfigOld(this._config)) {
        console.error(chalk.red('[ERROR] configuration file is to old try using config creator'));
        process.exit(-1);
      }
      if (!validateConfig(this._config)) {
        console.error(chalk.red('[ERROR] configuration file is invalid try using config creator'));
        process.exit(-1);
      }
      execSync(`mkdir -p ${this.tempPath}`);
    } else {
      console.error(chalk.red('[ERROR] configuration file is required, try using config creator'));
      process.exit(-1);
    }
  }
}
