import { Yargs } from '../common/Yargs';
import { Config } from '../common/Config';
import { ScreenPrinter } from '../console/ScreenPrinter';

export abstract class CommandRunner {
  protected yargs!: Yargs;
  protected config!: Config;
  protected screenPrinter = new ScreenPrinter();

  public constructor(args) {
    this.yargs = new Yargs(args);
    this.config = new Config(this.yargs);
  }

  public abstract run(): void
}
