import * as fs from 'fs';

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

  private initConfig() {
    let path = this._yargs.configPath;
    if (fs.existsSync(path)) {
      const file = fs.readFileSync(path, 'utf8');
      this._config = YAML.parse(file);
    }
  }
}

export class Yargs {
  private _args;

  constructor(args) {
    this._args = args;
  }

  get configPath(): string {
    return this._args.config;
  }

  get ref() {
    return this._args.ref;
  }

  get tagName() {
    return this._args.tagName;
  }

  get project() {
    return this._args.project || 'all';
  }

  get await() {
    return this._args.await;
  }
}
