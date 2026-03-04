import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { registerLocaleData } from '@angular/common';
import localeNg from '@angular/common/locales/en-NG';

bootstrapApplication(App, appConfig).catch((err) => console.error(err));

registerLocaleData(localeNg);
