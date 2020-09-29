import { Yargs } from '../../common/Yargs';
import { Config, Project } from '../../common/Config';
import { ScreenPrinter } from '../../console/ScreenPrinter';
import { Response } from '../../common/api/api.adapter';

export abstract class CommandRunner {
  protected yargs!: Yargs;
  protected config!: Config;
  protected screenPrinter = new ScreenPrinter();

  public constructor(args) {
    this.yargs = new Yargs(args);
    this.config = new Config(this.yargs);
  }

  public run() {
    const promises = this.config.projects.map(async (project) => {
      this.screenPrinter.addProject(project);
      this.screenPrinter.print();

      return this.runPerProject(project);
    });

    this.screenPrinter.onEnd(promises).then(this.postRun);
  }

  protected postRun(promises: Promise<Response<any>>[]) {}

  protected abstract runPerProject(project: Project): Promise<Response<any>>;
}
