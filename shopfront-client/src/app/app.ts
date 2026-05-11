import { Component, OnInit } from '@angular/core';
import { Router, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { PageViewService } from './services/page-view.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: `<router-outlet />`
})
export class App implements OnInit {
  constructor(private router: Router, private pageViews: PageViewService) {}

  ngOnInit() {
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe((e: any) => {
      const url: string = e.urlAfterRedirects ?? e.url;
      // skip admin routes
      if (!url.startsWith('/admin')) {
        this.pageViews.track(url);
      }
    });
  }
}
