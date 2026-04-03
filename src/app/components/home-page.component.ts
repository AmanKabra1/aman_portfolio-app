import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header.component';
import { HeroComponent } from './hero.component';
import { AboutComponent } from './about.component';
import { SkillsComponent } from './skills.component';
import { ProjectsComponent } from './projects.component';
import { ExperienceComponent } from './experience.component';
import { ContactComponent } from './contact.component';
import { FooterComponent } from './footer.component';

@Component({
  selector: 'app-home-page',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    HeroComponent,
    AboutComponent,
    SkillsComponent,
    ProjectsComponent,
    ExperienceComponent,
    ContactComponent,
    FooterComponent,
  ],
  template: `
    <app-header></app-header>
    <app-hero></app-hero>
    <app-about></app-about>
    <app-skills></app-skills>
    <app-projects></app-projects>
    <app-experience></app-experience>
    <app-contact></app-contact>

    <app-footer></app-footer>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePageComponent {}
