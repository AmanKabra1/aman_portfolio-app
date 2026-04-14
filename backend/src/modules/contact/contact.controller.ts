import { Controller, Get, Put, Body, UseGuards, Request, Req } from '@nestjs/common';
import { ContactService } from './contact.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('contact')
@UseGuards(JwtAuthGuard)
export class ContactController {
  constructor(private readonly contactService: ContactService) {}

  @Get()
  findOne(@Req() req) {
    return this.contactService.getContact(req.user.id);
  }

  @Put()
  update(@Req() req, @Body() updateData: any) {
    return this.contactService.updateContact(req.user.id, updateData);
  }
}
