import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
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
}
