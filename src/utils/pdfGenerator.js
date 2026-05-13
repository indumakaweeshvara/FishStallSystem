import html2pdf from 'html2pdf.js';

export const generateProfessionalInvoice = (cart, grandTotal, customer = { name: 'Walk-in Customer' }, txnId = 0, settings = {}, paidAmount = 0, advanceAmount = 0) => {
    const stallName = settings.stall_name || 'FRESH FISH STALL';
    const stallAddress = settings.stall_address || 'Devinuwara';
    const stallFooter = settings.stall_footer || 'Thank You For Your Business!';
    const stallLogo = settings.stall_logo || '';

    let invoiceNoStr = txnId ? txnId.toString().padStart(5, '0') : 'NEW';
    let now = new Date();
    let dateStr = now.toLocaleDateString('en-GB'); 
    let timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
    let custName = customer.name || 'Walk-in Customer';
    let cashierName = settings.cashier_name || 'Admin';

    // Build the table rows
    let tableRows = '';
    let totalQty = 0;
    
    // We add minimum 12 rows for consistent height to prevent multi-page overflow
    const MIN_ROWS = 12;
    
    for (let i = 0; i < Math.max(cart.length, MIN_ROWS); i++) {
        if (i < cart.length) {
            const item = cart[i];
            totalQty += item.qty;
            tableRows += `
                <tr>
                    <td style="text-align: center; border: 1px solid #cbd5e1; border-left: none; padding: 6px;">${item.units}</td>
                    <td style="text-align: center; border: 1px solid #cbd5e1; padding: 6px;">${item.symbol}</td>
                    <td style="border: 1px solid #cbd5e1; padding: 6px; font-family: 'Iskoola Pota', 'Abhaya Libre', 'Noto Sans Sinhala', Arial, sans-serif;">${item.description}</td>
                    <td style="text-align: center; border: 1px solid #cbd5e1; padding: 6px;">${item.qty.toFixed(3)}</td>
                    <td style="text-align: right; border: 1px solid #cbd5e1; padding: 6px;">${item.rate.toFixed(2)}</td>
                    <td style="text-align: right; border: 1px solid #cbd5e1; border-right: none; padding: 6px; font-weight: bold; color: #1e293b;">${item.amount.toFixed(2)}</td>
                </tr>
            `;
        } else {
            tableRows += `
                <tr>
                    <td style="border: 1px solid #cbd5e1; border-left: none; padding: 6px;">&nbsp;</td>
                    <td style="border: 1px solid #cbd5e1; padding: 6px;"></td>
                    <td style="border: 1px solid #cbd5e1; padding: 6px;"></td>
                    <td style="border: 1px solid #cbd5e1; padding: 6px;"></td>
                    <td style="border: 1px solid #cbd5e1; padding: 6px;"></td>
                    <td style="border: 1px solid #cbd5e1; border-right: none; padding: 6px;"></td>
                </tr>
            `;
        }
    }

    // Add total row
    tableRows += `
        <tr style="background-color: #f1f5f9; font-weight: bold;">
            <td style="text-align: center; border: 1px solid #cbd5e1; border-left: none; padding: 8px;">${cart.length}</td>
            <td style="border: 1px solid #cbd5e1; padding: 8px;"></td>
            <td style="border: 1px solid #cbd5e1; padding: 8px;"></td>
            <td style="text-align: center; border: 1px solid #cbd5e1; padding: 8px;">${totalQty.toFixed(3)}</td>
            <td style="text-align: left; border: 1px solid #cbd5e1; padding: 8px; color: #334155;">Total (Rs.):</td>
            <td style="text-align: right; border: 1px solid #cbd5e1; border-right: none; padding: 8px; font-size: 14px; color: #0f172a;">${grandTotal.toFixed(2)}</td>
        </tr>
    `;

    const htmlContent = `
        <div style="width: 210mm; background: white; font-family: Arial, sans-serif; box-sizing: border-box; padding: 10mm;">
            
            <!-- Main Content with Outer Border -->
            <div style="border: 2px solid #1e293b;">
            
                <!-- Centered Header -->
                <div style="text-align: center; padding: 10px 15px 10px 15px;">
                    ${stallLogo ? `
                        <div style="margin-bottom: 8px; width: 100%; text-align: center;">
                            <img src="${stallLogo}" style="width: 140px; height: auto; display: block; margin: 0 auto; mix-blend-mode: multiply;" />
                        </div>
                    ` : ''}
                    <h1 style="margin: 0; color: #1e293b; font-family: 'Times New Roman', Times, serif; font-size: 32px; font-style: italic; letter-spacing: 1px; white-space: nowrap;">
                        THINAYA SEA FOOD SUPPLIER
                    </h1>
                    <p style="margin: 8px 0 0 0; color: #1e293b; font-size: 13px; font-weight: bold; letter-spacing: 0.5px; display: flex; align-items: center; justify-content: center; gap: 10px;">
                        <span>${stallAddress}</span>
                        <span>(</span>
                        <span style="display: flex; align-items: center; gap: 4px;">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="color: #1e293b;"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                            076 935 0232
                        </span>
                        <span style="margin: 0 5px;">/</span>
                        <span style="display: flex; align-items: center; gap: 4px;">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="#25D366" style="margin-bottom: -1px;"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.414 0 .004 5.408 0 12.044c0 2.123.555 4.191 1.613 6.02L0 24l6.105-1.602a11.832 11.832 0 005.944 1.607h.005c6.637 0 12.048-5.409 12.052-12.045.002-3.217-1.248-6.242-3.511-8.511"></path></svg>
                            071 568 5485
                        </span>
                        <span>)</span>
                    </p>
                </div>

                <!-- Meta Data -->
                <div style="display: flex; justify-content: space-between; padding: 0 15px 10px 15px; font-size: 12px; color: #334155;">
                    <div>
                        <table style="border: none;">
                            <tr><td style="padding-bottom: 4px;"><strong>Invoice No:</strong></td><td style="padding-bottom: 4px; padding-left: 10px;">${invoiceNoStr}</td></tr>
                            <tr><td style="padding-bottom: 4px;"><strong>Supplier Name:</strong></td><td style="padding-bottom: 4px; padding-left: 10px;">${custName.toUpperCase()}</td></tr>
                            <tr><td><strong>Cashier:</strong></td><td style="padding-left: 10px;">${cashierName}</td></tr>
                        </table>
                    </div>
                    <div style="text-align: right;">
                        <table style="border: none; margin-left: auto;">
                            <tr><td style="padding-bottom: 4px; text-align: right;"><strong>Date:</strong></td><td style="padding-bottom: 4px; padding-left: 10px; text-align: right;">${dateStr}</td></tr>
                            <tr><td style="text-align: right;"><strong>Time:</strong></td><td style="padding-left: 10px; text-align: right;">${timeStr}</td></tr>
                        </table>
                    </div>
                </div>

                <!-- Table -->
                <table style="width: 100%; border-collapse: collapse; margin-bottom: 0;">
                    <thead>
                        <tr style="background-color: #1e293b; color: white;">
                            <th style="padding: 8px; border: 1px solid #1e293b; border-left: none; width: 8%; font-size: 12px;">UNITS</th>
                            <th style="padding: 8px; border: 1px solid #1e293b; width: 10%; font-size: 12px;">SYM</th>
                            <th style="padding: 8px; border: 1px solid #1e293b; width: 32%; text-align: left; font-size: 12px;">Description</th>
                            <th style="padding: 8px; border: 1px solid #1e293b; width: 15%; font-size: 12px;">Qty kg</th>
                            <th style="padding: 8px; border: 1px solid #1e293b; width: 15%; font-size: 12px;">Per Unit (Rs.)</th>
                            <th style="padding: 8px; border: 1px solid #1e293b; border-right: none; width: 20%; text-align: right; font-size: 12px;">Amount (Rs.)</th>
                        </tr>
                    </thead>
                    <tbody style="font-size: 12px; color: #334155;">
                        ${tableRows}
                    </tbody>
                </table>

                <!-- Footer / Signatures seamlessly connected to table -->
                <table style="width: 100%; border-collapse: collapse;">
                    <tr>
                        <td style="width: 65%; border: 1px solid #cbd5e1; border-left: none; border-bottom: none; padding: 12px; vertical-align: top;">
                            <p style="margin: 0; font-size: 12px; color: #475569;"></p>
                        </td>
                        <td style="width: 35%; border: 1px solid #cbd5e1; border-right: none; border-bottom: none; padding: 0; vertical-align: top;">
                            <table style="width: 100%; border-collapse: collapse;">
                                <tr>
                                    <td style="padding: 6px 8px; border-bottom: 1px solid #cbd5e1; font-size: 11px; color: #1e293b; font-weight: bold;">Gross Total :-</td>
                                    <td style="padding: 6px 8px; border-bottom: 1px solid #cbd5e1; text-align: right; font-size: 11px; color: #1e293b;">${grandTotal.toFixed(2)}</td>
                                </tr>
                                ${advanceAmount > 0 ? `
                                <tr>
                                    <td style="padding: 6px 8px; border-bottom: 1px solid #cbd5e1; font-size: 11px; font-weight: bold; color: #059669;">Advance Paid :-</td>
                                    <td style="padding: 6px 8px; border-bottom: 1px solid #cbd5e1; text-align: right; font-size: 11px; font-weight: bold; color: #059669;">${advanceAmount.toFixed(2)}</td>
                                </tr>
                                ` : ''}
                                <tr style="background-color: #f1f5f9;">
                                    <td style="padding: 10px 8px; font-size: 14px; font-weight: 900; color: #0f172a;">NET BALANCE :-</td>
                                    <td style="padding: 10px 8px; text-align: right; font-size: 14px; font-weight: 900; color: #0f172a; border-top: 2px solid #0f172a;">Rs. ${(grandTotal - advanceAmount).toFixed(2)}</td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                </table>
            </div>

            <!-- Thank You Note Outside the Border -->
            <div style="text-align: center; color: #64748b; margin-top: 10px;">
                <p style="font-style: italic; font-size: 13px; margin: 0;">${stallFooter}</p>
            </div>
        </div>
    `;

    // Preload images then generate PDF
    const generatePDF = () => {
        const container = document.createElement('div');
        container.innerHTML = htmlContent;
        container.style.position = 'absolute';
        container.style.left = '-9999px';
        container.style.top = '0';
        container.style.width = '210mm';
        document.body.appendChild(container);

        const opt = {
            margin:       0,
            filename:     `Invoice_${txnId || Date.now()}.pdf`,
            image:        { type: 'jpeg', quality: 1.0 },
            html2canvas:  { 
                scale: 3, 
                useCORS: true, 
                logging: false,
                letterRendering: true,
                imageTimeout: 30000 
            },
            jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        html2pdf().set(opt).from(container.firstElementChild).save().then(() => {
            document.body.removeChild(container);
        });
    };

    // If logo exists, wait for it to load first
    if (stallLogo && stallLogo.startsWith('data:image')) {
        const img = new Image();
        img.onload = () => {
            // Small delay to ensure rendering engine is ready
            setTimeout(generatePDF, 500);
        };
        img.onerror = () => generatePDF();
        img.src = stallLogo;
    } else {
        generatePDF();
    }
};
