import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { PortfolioModule } from './modules/portfolio/portfolio.module';
import { SkillsModule } from './modules/skills/skills.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { ExperienceModule } from './modules/experience/experience.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    AuthModule,
    UsersModule,
    PortfolioModule,
    SkillsModule,
    ProjectsModule,
    ExperienceModule,
  ],
})
export class AppModule {}
