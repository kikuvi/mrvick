import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { DATE_PIPE_DEFAULT_OPTIONS } from '@angular/common';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
import { provideQuillConfig } from 'ngx-quill';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    provideAnimationsAsync(),
    // Force all DatePipe instances to display in East Africa Time (UTC+3)
    { provide: DATE_PIPE_DEFAULT_OPTIONS, useValue: { timezone: '+0300' } },
    providePrimeNG({ theme: { preset: Aura } }),
    provideQuillConfig({})
  ]
};
