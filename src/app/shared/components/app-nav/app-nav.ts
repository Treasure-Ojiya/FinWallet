import { Component, inject, ElementRef, HostListener } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../../../core/service/user/user-service';

@Component({
  selector: 'app-app-nav',
  imports: [RouterLink],
  templateUrl: './app-nav.html',
  styleUrl: './app-nav.css',
})
export class AppNav {
  constructor(private el: ElementRef) {}
  private userService = inject(UserService);
  private router = inject(Router);

  mobileNavOpen = false;
  profileOpen = false;
  userName = '';

  ngOnInit(): void {
    this.userService.getUserDetail().subscribe({
      next: (res) => {
        this.userName = res.data.lastName ?? 'User';
      },
    });
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
    this.router.navigate(['/auth/login']);
  }
}
