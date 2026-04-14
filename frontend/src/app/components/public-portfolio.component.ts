import { Component, ChangeDetectionStrategy, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { PortfolioService } from '../services/portfolio.service';
import { HeaderComponent } from './header.component';
import { HeroComponent } from './hero.component';
import { AboutComponent } from './about.component';
import { SkillsComponent } from './skills.component';
import { ProjectsComponent } from './projects.component';
import { ExperienceComponent } from './experience.component';
import { EducationComponent } from './education.component';
import { ContactComponent } from './contact.component';
import { FooterComponent } from './footer.component';
import { SocialLinksComponent } from './social-links.component';

@Component({
  selector: 'app-public-portfolio',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    HeroComponent,
    AboutComponent,
    SkillsComponent,
    ProjectsComponent,
    ExperienceComponent,
    EducationComponent,
    ContactComponent,
    FooterComponent,
    SocialLinksComponent,
  ],
  template: `
    @if (isLoading()) {
      <div class="min-h-screen flex items-center justify-center">
        <div class="text-center">
          <div class="animate-spin rounded-full h-16 w-16 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p class="text-gray-600 dark:text-gray-400">Loading portfolio...</p>
        </div>
      </div>
    } @else if (error()) {
      <div class="min-h-screen flex items-center justify-center p-4">
        <div class="text-center">
          <h1 class="text-4xl font-bold text-gray-400 mb-4">404</h1>
          <p class="text-xl text-gray-600 dark:text-gray-400 mb-6">Portfolio not found</p>
          <p class="text-gray-500">The portfolio you're looking for doesn't exist or is private.</p>
        </div>
      </div>
    } @else {
      <div [style]="themeStyles()">
        <app-header></app-header>
        <app-hero></app-hero>
        <app-about></app-about>
        <app-skills></app-skills>
        <app-projects></app-projects>
        <app-experience></app-experience>
        <app-education></app-education>
        <app-social-links></app-social-links>
        <app-contact></app-contact>
        <app-footer></app-footer>
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublicPortfolioComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private portfolioService = inject(PortfolioService);

  isLoading = this.portfolioService.isLoading;
  error = this.portfolioService.error;
  portfolio = this.portfolioService.getPortfolio;
  theme = this.portfolioService.theme;

  ngOnInit() {
    const identifier = this.route.snapshot.paramMap.get('identifier');
    if (identifier) {
      this.portfolioService.loadPublicPortfolio(identifier);
    }
  }

  themeStyles() {
    const t = this.theme();
    if (!t) return '';

    return `
      --primary-color: ${t.primaryColor};
      --secondary-color: ${t.secondaryColor};
      --accent-color: ${t.accentColor};
      --background-color: ${t.backgroundColor};
      --text-color: ${t.textColor};
    `;
  }
}
