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

  get branchName() {
    return this._args.branchName;
  }

  get projects() {
    return this._args.projects || 'all';
  }

  set await(value: boolean) {
    this._args.await = value;
  }
  get await() {
    return this._args.await;
  }

  get stage() {
    return this._args.stage;
  }

  set sourceRef(value: string) {
    this._args.sourceRef = value;
  }
  get sourceRef() {
    return this._args.sourceRef;
  }

  set targetRef(value: string) {
    this._args.targetRef = value;
  }
  get targetRef() {
    return this._args.targetRef;
  }

  set title(value: string) {
    this._args.title = value;
  }
  get title() {
    return this._args.title;
  }

  get rebase(): boolean {
    return this._args.rebase;
  }
}
