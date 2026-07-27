import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

const statusLabels: Record<string, string> = {
  CONFIRMED: 'Confirmed',
  PACKED: 'Packed',
  SHIPPED: 'Shipped',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
};

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.order.findMany({
      where: { userId },
      include: { items: { include: { product: { select: { name: true, images: true } } } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findById(id: string, userId?: string) {
    const where: any = { id };
    if (userId) where.userId = userId;
    const order = await this.prisma.order.findFirst({
      where,
      include: { items: { include: { product: { select: { name: true, images: true } } } } },
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async create(userId: string, data: any) {
    const { items, subtotal, total, shippingAddress, paymentId } = data;

    return this.prisma.$transaction(async (tx) => {
      for (const item of items) {
        if (item.variantId) {
          const variant = await tx.productVariant.findUnique({ where: { id: item.variantId } });
          if (!variant || variant.stock < item.quantity) {
            throw new BadRequestException(`Insufficient stock for ${item.productName}`);
          }
          await tx.productVariant.update({
            where: { id: item.variantId },
            data: { stock: { decrement: item.quantity } },
          });
        }
      }

      return tx.order.create({
        data: {
          userId,
          subtotal,
          total,
          shippingAddress,
          paymentId,
          status: 'CONFIRMED',
          items: {
            create: items.map((i: any) => ({
              productId: i.productId,
              variantId: i.variantId || null,
              productName: i.productName || i.name,
              variantName: i.variantName || null,
              quantity: i.quantity,
              unitPrice: i.unitPrice || i.price,
              totalPrice: (i.unitPrice || i.price) * i.quantity,
            })),
          },
        },
        include: { items: { include: { product: { select: { name: true, images: true } } } } },
      });
    });
  }

  async updateStatus(id: string, status: string) {
    return this.prisma.order.update({
      where: { id },
      data: { status: status as any },
      include: { items: true },
    });
  }

  async findAllAdmin(params: { page?: number; limit?: number; status?: string }) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;
    const where: any = {};
    if (params.status) where.status = params.status;

    const [items, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        include: { items: true, user: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.order.count({ where }),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async generateInvoiceHtml(id: string, userId?: string) {
    const where: any = { id };
    if (userId) where.userId = userId;
    const order = await this.prisma.order.findFirst({
      where,
      include: {
        items: true,
        user: { select: { id: true, name: true, email: true } },
      },
    });
    if (!order) throw new NotFoundException('Order not found');
    if (order.status !== 'DELIVERED') throw new BadRequestException('Invoice available only for delivered orders');

    const itemsHtml = order.items.map((item, i) => `
      <tr>
        <td style="padding:12px;border-bottom:1px solid #e5e7eb;text-align:center;color:#6b7280;">${i + 1}</td>
        <td style="padding:12px;border-bottom:1px solid #e5e7eb;color:#111827;font-weight:500;">${item.productName}</td>
        <td style="padding:12px;border-bottom:1px solid #e5e7eb;text-align:center;color:#374151;">${item.quantity}</td>
        <td style="padding:12px;border-bottom:1px solid #e5e7eb;text-align:right;color:#374151;">₹${Number(item.unitPrice).toLocaleString('en-IN')}</td>
        <td style="padding:12px;border-bottom:1px solid #e5e7eb;text-align:right;color:#111827;font-weight:600;">₹${Number(item.totalPrice).toLocaleString('en-IN')}</td>
      </tr>
    `).join('');

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Invoice #${order.id.slice(0, 8)}</title>
  <style>
    @page { margin: 20mm; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', system-ui, -apple-system, sans-serif; background: #f3f4f6; padding: 40px; color: #111827; }
    .invoice { max-width: 800px; margin: 0 auto; background: #fff; border-radius: 16px; box-shadow: 0 4px 24px rgba(0,0,0,0.06); overflow: hidden; }
    .header { padding: 40px 48px 32px; border-bottom: 2px solid #f3f4f6; }
    .header-top { display: flex; justify-content: space-between; align-items: flex-start; }
    .brand { display: flex; align-items: center; gap: 12px; }
    .brand-icon { width: 44px; height: 44px; background: #111827; border-radius: 12px; display: flex; align-items: center; justify-content: center; color: #fff; font-weight: 800; font-size: 18px; }
    .brand-text { }
    .brand-text h1 { font-size: 22px; font-weight: 700; color: #111827; letter-spacing: -0.5px; }
    .brand-text p { font-size: 11px; color: #9ca3af; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 600; }
    .invoice-title { text-align: right; }
    .invoice-title h2 { font-size: 28px; font-weight: 700; color: #111827; letter-spacing: -0.5px; }
    .invoice-title p { font-size: 13px; color: #6b7280; margin-top: 4px; }
    .badge { display: inline-block; padding: 4px 16px; background: #d1fae5; color: #065f46; font-size: 12px; font-weight: 600; border-radius: 20px; margin-top: 8px; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; padding: 32px 48px; background: #f9fafb; }
    .info-box h3 { font-size: 11px; font-weight: 600; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
    .info-box p { font-size: 14px; color: #374151; line-height: 1.6; }
    .info-box .name { font-weight: 600; color: #111827; }
    table { width: 100%; border-collapse: collapse; padding: 0 48px; }
    thead th { padding: 12px; font-size: 11px; font-weight: 600; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px; border-bottom: 2px solid #e5e7eb; }
    tbody tr:last-child td { border-bottom: none; }
    .totals { padding: 24px 48px 40px; border-top: 2px solid #f3f4f6; }
    .totals-table { width: 280px; margin-left: auto; }
    .totals-table tr td { padding: 6px 0; font-size: 14px; }
    .totals-table tr td:last-child { text-align: right; font-weight: 600; }
    .totals-table .grand-total td { padding-top: 12px; font-size: 18px; font-weight: 700; color: #111827; border-top: 2px solid #111827; }
    .footer { padding: 24px 48px; background: #f9fafb; text-align: center; }
    .footer p { font-size: 12px; color: #9ca3af; }
  </style>
</head>
<body>
  <div class="invoice">
    <div class="header">
      <div class="header-top">
        <div class="brand">
          <div class="brand-icon">SP</div>
          <div class="brand-text">
            <h1>StorePulse</h1>
            <p>Invoice</p>
          </div>
        </div>
        <div class="invoice-title">
          <h2>INV-${order.id.slice(0, 8).toUpperCase()}</h2>
          <p>${new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          <span class="badge">${statusLabels[order.status] || order.status}</span>
        </div>
      </div>
    </div>

    <div class="info-grid">
      <div class="info-box">
        <h3>Bill To</h3>
        <p class="name">${order.user?.name || 'Customer'}</p>
        <p>${order.user?.email || ''}</p>
        ${order.shippingAddress ? `<p>${order.shippingAddress}</p>` : ''}
      </div>
      <div class="info-box">
        <h3>Order Details</h3>
        <p><strong>Order ID:</strong> ${order.id}</p>
        <p><strong>Payment ID:</strong> ${order.paymentId || 'N/A'}</p>
        <p><strong>Items:</strong> ${order.items.length} item(s)</p>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th style="text-align:center;width:40px;">#</th>
          <th style="text-align:left;">Product</th>
          <th style="text-align:center;width:60px;">Qty</th>
          <th style="text-align:right;width:120px;">Unit Price</th>
          <th style="text-align:right;width:120px;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>

    <div class="totals">
      <table class="totals-table">
        <tr>
          <td>Subtotal</td>
          <td>₹${Number(order.subtotal || order.total).toLocaleString('en-IN')}</td>
        </tr>
        <tr class="grand-total">
          <td>Total</td>
          <td>₹${Number(order.total).toLocaleString('en-IN')}</td>
        </tr>
      </table>
    </div>

    <div class="footer">
      <p>Thank you for shopping with StorePulse! &bull; This is a computer-generated invoice.</p>
    </div>
  </div>
</body>
</html>`;
  }
}
