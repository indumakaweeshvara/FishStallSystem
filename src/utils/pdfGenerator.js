import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateProfessionalInvoice = (cart, grandTotal, customer = { name: 'Walk-in Customer' }, txnId = 0, settings = {}) => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    // Stall Info from Settings or Defaults
    const stallName = settings.stall_name || 'FRESH FISH STALL';
    const stallAddress = settings.stall_address || 'Main Road, Negombo';
    const stallPhone = settings.stall_phone || '031-22XXXXX';

    // --- 1. Top Header Section ---
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(37, 99, 235);
    doc.text(stallName.toUpperCase(), 20, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.setFont('helvetica', 'normal');
    doc.text(stallAddress, 20, 30);
    doc.text(`Phone: ${stallPhone}`, 20, 35);

    // --- 2. Invoice Metadata ---
    doc.setFontSize(28);
    doc.setTextColor(37, 99, 235);
    doc.text('INVOICE', 190, 20, { align: 'right' });

    autoTable(doc, {
      startY: 25,
      margin: { left: 140 },
      tableWidth: 50,
      body: [
        ['DATE', new Date().toLocaleDateString()],
        ['INVOICE #', txnId ? txnId.toString().padStart(5, '0') : 'NEW'],
        ['CUSTOMER ID', customer.id || '0']
      ],
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 2 },
      columnStyles: { 0: { fontStyle: 'bold', fillColor: [241, 245, 249] } }
    });

    // --- 3. Bill To Section ---
    const startY = 55;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.setFillColor(30, 41, 59);
    doc.rect(20, startY, 70, 7, 'F');
    doc.text('BILL TO', 25, startY + 5);

    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'normal');
    doc.text(customer.name || 'Walk-in Customer', 20, startY + 15);
    if (customer.phone) doc.text(`Phone: ${customer.phone}`, 20, startY + 20);

    // --- 4. Main Items Table ---
    const tableData = cart.map(item => [
      item.description,
      'YES',
      `Rs. ${item.rate.toFixed(2)}`,
      `${item.qty.toFixed(3)} Kg`,
      `Rs. ${item.amount.toFixed(2)}`
    ]);

    autoTable(doc, {
      startY: startY + 30,
      head: [['DESCRIPTION', 'TAXED', 'RATE', 'QTY', 'AMOUNT']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [30, 41, 59], fontSize: 10, halign: 'center' },
      styles: { fontSize: 10, cellPadding: 6 },
      columnStyles: {
        0: { cellWidth: 80 },
        1: { halign: 'center' },
        2: { halign: 'right' },
        3: { halign: 'right' },
        4: { halign: 'right', fontStyle: 'bold' }
      }
    });

    // --- 5. Summary Section ---
    const finalY = (doc.lastAutoTable && doc.lastAutoTable.finalY) ? doc.lastAutoTable.finalY + 10 : startY + 100;
    const summaryX = 130;

    const drawSummaryLine = (label, value, y, isTotal = false) => {
      doc.setFontSize(10);
      doc.setFont('helvetica', isTotal ? 'bold' : 'normal');
      doc.text(label, summaryX, y);
      doc.text(value, 190, y, { align: 'right' });
      doc.setDrawColor(226, 232, 240);
      doc.line(summaryX, y + 2, 190, y + 2);
    };

    drawSummaryLine('Subtotal', `Rs. ${grandTotal.toFixed(2)}`, finalY);
    drawSummaryLine('Taxable', 'Rs. 0.00', finalY + 8);
    drawSummaryLine('Tax Rate', '0.00%', finalY + 16);
    drawSummaryLine('Tax Due', 'Rs. 0.00', finalY + 24);
    
    doc.setFontSize(12);
    drawSummaryLine('TOTAL', `Rs. ${grandTotal.toFixed(2)}`, finalY + 35, true);

    // --- 6. Footer ---
    const pageHeight = doc.internal.pageSize.height;
    doc.setFontSize(14);
    doc.text(settings.stall_footer || 'Thank You For Your Business!', 105, pageHeight - 15, { align: 'center' });

    // Save PDF
    doc.save(`Invoice_${txnId || Date.now()}.pdf`);
};
