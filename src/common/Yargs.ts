import * as chalk from 'chalk';

export class Yargs {
  private _args;

  constructor(args) {
    this._args = args;
    if (!this._args.config.endsWith('.yml')) {
      console.error(
        chalk.red(`[ERROR] Config file extension is invalid, only '.yml' are accepted!`),
      );
      process.exit(-1);
    }
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

  get stage() {
    return this._args.stage;
  }
}
