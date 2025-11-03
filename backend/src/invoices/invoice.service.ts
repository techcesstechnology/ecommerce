import PDFDocument from 'pdfkit';
import { Order } from '../types';

export class InvoiceService {
  generateInvoicePDF(order: Order): PDFKit.PDFDocument {
    const doc = new PDFDocument({ margin: 50 });

    this.generateHeader(doc);
    this.generateOrderInfo(doc, order);
    this.generateShippingInfo(doc, order);
    this.generateItemsTable(doc, order);
    this.generateFooter(doc);

    doc.end();
    return doc;
  }

  private generateHeader(doc: PDFKit.PDFDocument): void {
    doc
      .fontSize(20)
      .text('FreshRoute', 50, 45)
      .fontSize(10)
      .text('Fresh Produce E-commerce', 50, 70)
      .text('Harare, Zimbabwe', 50, 85)
      .text('Phone: +263 77 123 4567', 50, 100)
      .text('Email: info@freshroute.com', 50, 115)
      .moveDown();
  }

  private generateOrderInfo(doc: PDFKit.PDFDocument, order: Order): void {
    const invoiceTop = 160;

    doc
      .fontSize(20)
      .text('INVOICE', 50, invoiceTop)
      .fontSize(10)
      .text(`Invoice Number: ${order.id}`, 50, invoiceTop + 30)
      .text(`Invoice Date: ${new Date(order.createdAt).toLocaleDateString()}`, 50, invoiceTop + 45)
      .text(`Order Status: ${order.status}`, 50, invoiceTop + 60)
      .text(`Payment Status: ${order.paymentStatus}`, 50, invoiceTop + 75)
      .moveDown();
  }

  private generateShippingInfo(doc: PDFKit.PDFDocument, order: Order): void {
    const shippingTop = 280;

    doc
      .fontSize(12)
      .text('Ship To:', 50, shippingTop)
      .fontSize(10)
      .text(order.shippingAddress.fullName, 50, shippingTop + 20)
      .text(order.shippingAddress.street, 50, shippingTop + 35)
      .text(
        `${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.postalCode}`,
        50,
        shippingTop + 50
      )
      .text(order.shippingAddress.country, 50, shippingTop + 65)
      .text(`Phone: ${order.shippingAddress.phone}`, 50, shippingTop + 80)
      .moveDown();
  }

  private generateItemsTable(doc: PDFKit.PDFDocument, order: Order): void {
    const tableTop = 400;

    doc.font('Helvetica-Bold');
    this.generateTableRow(
      doc,
      tableTop,
      'Item',
      'Description',
      'Qty',
      'Price',
      'Amount'
    );
    doc.font('Helvetica');

    const position = tableTop + 25;

    order.items.forEach((item, index) => {
      const y = position + index * 30;
      this.generateTableRow(
        doc,
        y,
        item.productId.substring(0, 10),
        item.name,
        item.quantity.toString(),
        `${order.currency} ${item.price.toFixed(2)}`,
        `${order.currency} ${(item.price * item.quantity).toFixed(2)}`
      );
    });

    const subtotalY = position + order.items.length * 30 + 30;
    doc.font('Helvetica-Bold');
    
    this.generateTableRow(
      doc,
      subtotalY,
      '',
      '',
      '',
      'Subtotal:',
      `${order.currency} ${order.subtotal.toFixed(2)}`
    );

    this.generateTableRow(
      doc,
      subtotalY + 25,
      '',
      '',
      '',
      'Tax:',
      `${order.currency} ${order.tax.toFixed(2)}`
    );

    this.generateTableRow(
      doc,
      subtotalY + 50,
      '',
      '',
      '',
      'Shipping:',
      `${order.currency} ${order.shippingCost.toFixed(2)}`
    );

    this.generateTableRow(
      doc,
      subtotalY + 75,
      '',
      '',
      '',
      'Total:',
      `${order.currency} ${order.total.toFixed(2)}`
    );
  }

  private generateTableRow(
    doc: PDFKit.PDFDocument,
    y: number,
    item: string,
    description: string,
    quantity: string,
    price: string,
    amount: string
  ): void {
    doc
      .fontSize(10)
      .text(item, 50, y, { width: 90 })
      .text(description, 150, y, { width: 190 })
      .text(quantity, 350, y, { width: 60, align: 'right' })
      .text(price, 420, y, { width: 60, align: 'right' })
      .text(amount, 490, y, { width: 60, align: 'right' });
  }

  private generateFooter(doc: PDFKit.PDFDocument): void {
    doc
      .fontSize(10)
      .text(
        'Thank you for shopping with FreshRoute!',
        50,
        700,
        { align: 'center', width: 500 }
      )
      .text(
        'For inquiries, please contact support@freshroute.com',
        50,
        720,
        { align: 'center', width: 500 }
      );
  }
}

export const invoiceService = new InvoiceService();
