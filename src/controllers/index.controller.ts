import {Controller, Get} from "routing-controllers";

@Controller()
export class IndexController {

  @Get('/')
  async index() {
    return `IndexController ${new Date().toLocaleDateString()}`
  }
}
