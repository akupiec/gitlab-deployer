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
  get refB() {
    return this._args.refB;
  }
  get tagName() {
    return this._args.tagName;
  }
  get branchName() {
    return this._args.branchName;
  }
  get projects() {
    return this._args.projects || 'all';
  }
  get await() {
    return this._args.await;
  }
  get stage() {
    return this._args.stage;
  }
  get sourceRef() {
    return this._args.sourceRef;
  }
  get targetRef() {
    return this._args.targetRef;
  }
  get rebase(): boolean {
    return this._args.rebase;
  }
  get ffOnly(): boolean {
    return this._args.ffOnly;
  }
}
