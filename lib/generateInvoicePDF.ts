import jsPDF from 'jspdf';

export const generateInvoicePDF = (invoice: any, profile: any) => {
  const doc = new jsPDF();

  // 🔷 Company Header
  doc.setFontSize(18);
  doc.text(profile?.company_name || 'Your Company', 20, 20);

  doc.setFontSize(10);
  doc.text(profile?.address || '', 20, 26);
  doc.text(`GSTIN: ${profile?.gst_number || ''}`, 20, 32);
  
  // 🔷 Invoice Title
  doc.setFontSize(16);
  doc.text('TAX INVOICE', 150, 20);

  // 🔷 Invoice Info
  doc.setFontSize(10);
  doc.text(`Invoice No: ${invoice.invoice_number}`, 150, 30);
  doc.text(`Date: ${new Date(invoice.created_at).toLocaleDateString()}`, 150, 36);

  // 🔷 Customer Info
  doc.setFontSize(12);
  doc.text('Bill To:', 20, 50);

  doc.setFontSize(10);
  doc.text(invoice.customer_name || 'Walk-in Customer', 20, 56);

  // 🔷 Table Header
  let startY = 70;

  doc.setFontSize(11);
  doc.text('Item', 20, startY);
  doc.text('Qty', 90, startY);
  doc.text('Price', 110, startY);
  doc.text('GST%', 140, startY);
  doc.text('Total', 170, startY);

  doc.line(20, startY + 2, 190, startY + 2);

  // 🔷 Table Row
  const total = invoice.total_amount;
  const gstAmount = (invoice.price * invoice.quantity * invoice.gst_rate) / 100;

  startY += 10;

  doc.setFontSize(10);
  doc.text(invoice.Products?.name || 'Product', 20, startY);
  doc.text(String(invoice.quantity), 90, startY);
  doc.text(`₹${invoice.price}`, 110, startY);
  doc.text(`${invoice.gst_rate}%`, 140, startY);
  doc.text(`₹${total.toFixed(2)}`, 170, startY);

  // 🔷 Summary
  startY += 20;

  doc.line(120, startY, 190, startY);

  startY += 8;
  doc.text(`Subtotal: ₹${(total - gstAmount).toFixed(2)}`, 120, startY);

  startY += 8;
  doc.text(`GST: ₹${gstAmount.toFixed(2)}`, 120, startY);

  startY += 10;
  doc.setFontSize(12);
  doc.text(`Total: ₹${total.toFixed(2)}`, 120, startY);

  // 🔷 Footer
  startY += 20;
  doc.setFontSize(10);
  doc.text('Thank you for your business!', 20, startY);

  // 🔷 Save
  doc.save(`${invoice.invoice_number}.pdf`);
};