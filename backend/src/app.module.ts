import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { PortfoliosModule } from './modules/portfolios/portfolios.module';
import { SkillsModule } from './modules/skills/skills.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { ExperienceModule } from './modules/experience/experience.module';
import { UsersModule } from './modules/users/users.module';
import { ThemesModule } from './modules/themes/themes.module';
import { ResumeModule } from './modules/resume/resume.module';
import { AdminModule } from './modules/admin/admin.module';
import { SocialLinksModule } from './modules/social-links/social-links.module';
import { EducationModule } from './modules/education/education.module';
import { AboutModule } from './modules/about/about.module';
import { ContactModule } from './modules/contact/contact.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    PortfoliosModule,
    ThemesModule,
    ResumeModule,
    AdminModule,
    SkillsModule,
    ProjectsModule,
    ExperienceModule,
    EducationModule,
    SkillsModule,
    SocialLinksModule,
    AboutModule,
    ContactModule,
  ],
})
export class AppModule {}
