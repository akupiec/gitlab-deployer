import { Yargs } from '../common/Yargs';
import { Config, Project } from '../common/Config';
import { ScreenPrinter } from '../console/ScreenPrinter';
import { Response } from '../common/api';

export abstract class CommandRunner {
  protected yargs!: Yargs;
  protected config!: Config;
  protected screenPrinter = new ScreenPrinter();

  public constructor(args) {
    this.yargs = new Yargs(args);
    this.config = new Config(this.yargs);
  }

  public run() {
    const promises = this.config.projects.map(async project => {
      this.screenPrinter.addProject(project);
      this.screenPrinter.print();

      return this.runPerProject(project);
    });

    this.screenPrinter.onEnd(promises);
  }

  protected abstract runPerProject<T>(project: Project): Promise<Response<T>>
}


