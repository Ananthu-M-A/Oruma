import {
  Body,
  Controller,
  Get,
  Header,
  Headers,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtPayload } from '../auth/strategies/jwt.strategy';
import { Role } from '../user/entities/user.entity';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { CreateRazorpayOrderDto } from './dto/create-razorpay-order.dto';
import { RefundPaymentDto } from './dto/refund-payment.dto';
import { VerifyRazorpayPaymentDto } from './dto/verify-razorpay-payment.dto';
import { PaymentService } from './payment.service';

type AuthenticatedRequest = {
  user: JwtPayload;
};

type RawBodyRequest = {
  rawBody?: Buffer;
};

@Controller('payments')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  findAll() {
    return this.paymentService.findAll();
  }

  @Get('admin/webhooks')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  findWebhookEvents() {
    return this.paymentService.findWebhookEvents();
  }

  @Patch('admin/webhooks/:id/retry')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  retryWebhookEvent(@Param('id') id: string) {
    return this.paymentService.retryWebhookEvent(id);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.PATIENT)
  findMine(@Req() req: AuthenticatedRequest) {
    return this.paymentService.findForPatient(req.user);
  }

  @Get(':id/invoice')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.PATIENT)
  @Header('Content-Type', 'text/html; charset=utf-8')
  getInvoice(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.paymentService.getInvoice(id, req.user);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  create(@Body() dto: CreatePaymentDto) {
    return this.paymentService.create(dto);
  }

  @Post('razorpay/order')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.PATIENT)
  createRazorpayOrder(
    @Body() dto: CreateRazorpayOrderDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.paymentService.createRazorpayOrder(dto, req.user);
  }

  @Post('development/complete')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.PATIENT)
  completeDevelopmentPayment(
    @Body() dto: CreateRazorpayOrderDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.paymentService.completeDevelopmentPayment(dto, req.user);
  }

  @Post('razorpay/verify')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.PATIENT)
  verifyRazorpayPayment(
    @Body() dto: VerifyRazorpayPaymentDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.paymentService.verifyRazorpayPayment(dto, req.user);
  }

  @Post('razorpay/webhook')
  handleRazorpayWebhook(
    @Req() req: RawBodyRequest,
    @Body() payload: unknown,
    @Headers('x-razorpay-signature') signature?: string,
  ) {
    return this.paymentService.handleRazorpayWebhook({
      payload,
      rawBody: req.rawBody,
      signature,
    });
  }

  @Patch(':id/refund')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  refund(@Param('id') id: string, @Body() dto: RefundPaymentDto) {
    return this.paymentService.refund(id, dto);
  }
}
