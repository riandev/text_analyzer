declare module 'winston-dashboard' {
  import { Logger } from 'winston';
  import { Router } from 'express';

  export interface WinstonDashboardOptions {
    title?: string;
    logger: Logger;
    port?: number;
    basePath?: string;
    refreshRate?: number;
  }

  export class WinstonDashboard {
    constructor(options: WinstonDashboardOptions);
    initialize(): void;
    router: Router;
  }
}
