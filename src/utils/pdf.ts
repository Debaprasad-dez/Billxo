import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Invoice } from '@/types/invoice';
import { formatCurrency, getAmountPaid, getBalance, getDisplayStatus, getStatusLabel } from './helpers';

const ACCENT: [number, number, number] = [16, 122, 87]; // emerald
const INK: [number, number, number] = [30, 41, 38];
const MUTED: [number, number, number] = [120, 130, 128];

const fmtDate = (s: string) =>
  new Date(s).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

export function generateInvoicePDF(invoice: Invoice, action: 'save' | 'open' = 'save'): void {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  const M = 16;
  const cur = invoice.currency || '$';

  // ── Header band ──
  doc.setFillColor(...ACCENT);
  doc.rect(0, 0, W, 4, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(...INK);
  doc.text(invoice.business.name || 'Your Business', M, 22);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(26);
  doc.setTextColor(...ACCENT);
  doc.text('INVOICE', W - M, 22, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  doc.text(`# ${invoice.invoiceNumber}`, W - M, 28, { align: 'right' });

  // ── Business address ──
  doc.setFontSize(8.5);
  doc.setTextColor(...MUTED);
  const bizLines = [
    invoice.business.address,
    [invoice.business.city, invoice.business.state, invoice.business.zip].filter(Boolean).join(', '),
    invoice.business.phone,
    invoice.business.email,
  ].filter(Boolean) as string[];
  doc.text(bizLines, M, 30);

  // ── Bill To + meta ──
  let y = 52;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...MUTED);
  doc.text('BILL TO', M, y);
  doc.text('INVOICE DETAILS', W - M, y, { align: 'right' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...INK);
  doc.text(invoice.client.name || '—', M, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...MUTED);
  const clientLines = [
    invoice.client.company,
    invoice.client.address,
    [invoice.client.city, invoice.client.state, invoice.client.zip].filter(Boolean).join(', '),
    invoice.client.email,
  ].filter(Boolean) as string[];
  doc.text(clientLines, M, y + 11);

  // Meta right column
  const status = getStatusLabel(getDisplayStatus(invoice)).replace(/[^\w ]/g, '').trim();
  const meta: [string, string][] = [
    ['Issued', fmtDate(invoice.createdDate)],
    ['Due', fmtDate(invoice.dueDate)],
    ['Status', status],
  ];
  doc.setFontSize(8.5);
  meta.forEach((row, i) => {
    const ry = y + 6 + i * 5;
    doc.setTextColor(...MUTED);
    doc.text(row[0], W - M - 38, ry, { align: 'left' });
    doc.setTextColor(...INK);
    doc.setFont('helvetica', 'bold');
    doc.text(row[1], W - M, ry, { align: 'right' });
    doc.setFont('helvetica', 'normal');
  });

  // ── Line items table ──
  autoTable(doc, {
    startY: y + 30,
    head: [['Description', 'Qty', 'Unit Price', 'Tax %', 'Amount']],
    body: invoice.lineItems.map(li => [
      li.description || '—',
      String(li.quantity),
      formatCurrency(li.unitPrice, cur),
      `${li.tax}%`,
      formatCurrency(li.total, cur),
    ]),
    theme: 'plain',
    headStyles: {
      fillColor: [243, 246, 245],
      textColor: INK,
      fontStyle: 'bold',
      fontSize: 8.5,
      cellPadding: { top: 3, bottom: 3, left: 3, right: 3 },
    },
    bodyStyles: { fontSize: 9, textColor: INK, cellPadding: { top: 3, bottom: 3, left: 3, right: 3 } },
    columnStyles: {
      1: { halign: 'right' },
      2: { halign: 'right' },
      3: { halign: 'right' },
      4: { halign: 'right' },
    },
    margin: { left: M, right: M },
    didDrawPage: () => {},
  });

  // ── Totals ──
  // @ts-expect-error autotable augments doc
  let ty = doc.lastAutoTable.finalY + 8;
  const labelX = W - M - 56;
  const valX = W - M;
  const paid = getAmountPaid(invoice);
  const balance = getBalance(invoice);

  const totals: [string, string, boolean][] = [
    ['Subtotal', formatCurrency(invoice.subTotal, cur), false],
    ['Tax', formatCurrency(invoice.taxTotal, cur), false],
  ];
  if (invoice.discount > 0) {
    const disc = invoice.discountType === 'percentage'
      ? invoice.subTotal * (invoice.discount / 100)
      : invoice.discount;
    totals.push([
      `Discount${invoice.discountType === 'percentage' ? ` (${invoice.discount}%)` : ''}`,
      `-${formatCurrency(disc, cur)}`, false,
    ]);
  }

  doc.setFontSize(9);
  totals.forEach(([label, val]) => {
    doc.setTextColor(...MUTED);
    doc.setFont('helvetica', 'normal');
    doc.text(label, labelX, ty);
    doc.setTextColor(...INK);
    doc.text(val, valX, ty, { align: 'right' });
    ty += 5.5;
  });

  // Grand total bar
  ty += 1;
  doc.setFillColor(...ACCENT);
  doc.roundedRect(labelX - 4, ty - 4, valX - labelX + 8, 10, 1.5, 1.5, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('Total Due', labelX, ty + 2.5);
  doc.text(formatCurrency(invoice.grandTotal, cur), valX, ty + 2.5, { align: 'right' });
  ty += 12;

  if (paid > 0) {
    doc.setTextColor(...MUTED);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text('Amount Paid', labelX, ty);
    doc.text(formatCurrency(paid, cur), valX, ty, { align: 'right' });
    ty += 5.5;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...INK);
    doc.text('Balance', labelX, ty);
    doc.text(formatCurrency(balance, cur), valX, ty, { align: 'right' });
    ty += 6;
  }

  // ── Notes ──
  if (invoice.notes) {
    ty += 6;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(...MUTED);
    doc.text('NOTES', M, ty);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...INK);
    doc.text(doc.splitTextToSize(invoice.notes, W - M * 2), M, ty + 5);
  }

  // ── Footer ──
  const H = doc.internal.pageSize.getHeight();
  doc.setDrawColor(...ACCENT);
  doc.setLineWidth(0.4);
  doc.line(M, H - 18, W - M, H - 18);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...MUTED);
  doc.text('Thank you for your business!', W / 2, H - 12, { align: 'center' });

  const filename = `Invoice-${invoice.invoiceNumber}.pdf`;
  if (action === 'open') {
    doc.output('dataurlnewwindow');
  } else {
    doc.save(filename);
  }
}
