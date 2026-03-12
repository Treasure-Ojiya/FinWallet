import { Component, inject, ElementRef, HostListener } from '@angular/core';
import {
  Router,
  RouterLink,
  NavigationEnd,
  ActivatedRoute,
} from '@angular/router';
import { filter } from 'rxjs/operators';
import { UserService } from '../../../core/service/user/user-service';
import { routes } from '../../../app.routes';

@Component({
  selector: 'app-app-nav',
  imports: [RouterLink],
  templateUrl: './app-nav.html',
  styleUrl: './app-nav.css',
})
export class AppNav {
  currentRoute: any;
  constructor(private el: ElementRef) {}
  private userService = inject(UserService);
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  mobileNavOpen = false;
  profileOpen = false;
  showNav = true;
  userName = '';
  firstName = '';
  lastName = '';

  ngOnInit(): void {
    this.userService.getUserDetail().subscribe({
      next: (res) => {
        this.firstName = res.data.firstName ?? '';
        this.lastName = res.data.lastName ?? 'User';
      },
    });

    this.router.events
      .pipe(
        filter(
          (event): event is NavigationEnd => event instanceof NavigationEnd,
        ),
      )
      .subscribe(() => {
        const currentRoute = this.getDeepestChild(this.activatedRoute);
        const hideLayout = currentRoute.snapshot.data['hideLayout'];

        this.showNav = !hideLayout;
      });
  }
  private getDeepestChild(route: ActivatedRoute): ActivatedRoute {
    while (route.firstChild) {
      route = route.firstChild;
    }
    return route;
  }

  createInitials(): string {
    const firstInitial = this.firstName
      ? this.firstName.charAt(0).toUpperCase()
      : '';
    const lastInitial = this.lastName
      ? this.lastName.charAt(0).toUpperCase()
      : '';
    return firstInitial + lastInitial;
  }

  navigateAccountDetails() {
    this.router.navigate(['/account-details']);
  }

  toggleMobileNav() {
    this.mobileNavOpen = !this.mobileNavOpen;
  }

  toggleProfile() {
    this.profileOpen = !this.profileOpen;
  }

  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    const clickedInside = this.el.nativeElement.contains(event.target);

    if (!clickedInside) {
      this.profileOpen = false;
      this.mobileNavOpen = false;
    }
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['/auth']);
  }
}
