import { Component, signal, inject } from '@angular/core';
import {Router, RouterOutlet, ActivatedRoute, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Header } from './shared/components/header/header';
import { AppNav } from './shared/components/app-nav/app-nav';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, AppNav],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('banking-ng');
  private activatedRoute = inject(ActivatedRoute);
  private router = inject(Router);

  mobileNavOpen = false;
  showNav = true;

  toggleMobileNav() {
    this.mobileNavOpen = !this.mobileNavOpen;
  }




  ngOnInit() {

    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe(() => {
        const route = this.getDeepestChild(this.activatedRoute);
        const hideLayout = route.snapshot.data['hideLayout'];

        this.showNav = !hideLayout;
      });

  }

  private getDeepestChild(route: ActivatedRoute): ActivatedRoute {
    while (route.firstChild) {
      route = route.firstChild;
    }
    return route;
  }

}
