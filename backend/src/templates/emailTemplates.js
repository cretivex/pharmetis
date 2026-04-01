const appName = 'Phartimetic';
const rfqUrl = (rfqId) => `https://phartimetic.com/buyer/rfq/${rfqId}`;

const baseTemplate = ({ title, intro, details, ctaText, ctaLink }) => {
  const detailsHtml = details
    .map(({ label, value }) => `<p style="margin: 6px 0;"><strong>${label}:</strong> ${value}</p>`)
    .join('');
  const detailsText = details.map(({ label, value }) => `${label}: ${value}`).join('\n');

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #111827; max-width: 640px; margin: 0 auto; padding: 20px; background: #f8fafc;">
      <div style="background: #0f172a; color: #ffffff; border-radius: 10px 10px 0 0; padding: 22px 24px;">
        <h1 style="margin: 0; font-size: 20px;">${appName}</h1>
      </div>
      <div style="background: #ffffff; border: 1px solid #e2e8f0; border-top: none; border-radius: 0 0 10px 10px; padding: 24px;">
        <h2 style="margin: 0 0 12px; color: #111827;">${title}</h2>
        <p style="margin: 0 0 16px;">${intro}</p>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 16px; margin: 10px 0 20px;">
          ${detailsHtml}
        </div>
        <p style="margin: 0 0 24px;">
          <a href="${ctaLink}" style="display: inline-block; background: #0f172a; color: #ffffff; text-decoration: none; padding: 10px 16px; border-radius: 8px; font-weight: 600;">
            ${ctaText}
          </a>
        </p>
        <p style="font-size: 12px; color: #64748b; margin: 0;">
          This is an automated message from ${appName}. Please do not reply to this email.
        </p>
      </div>
    </body>
    </html>
  `;

  const text = `${title}

${intro}

${detailsText}

${ctaText}: ${ctaLink}

This is an automated message from ${appName}.`;

  return { html, text };
};

export const rfqAcceptedTemplate = (buyerName, rfqId, supplierName) => {
  const subject = 'Your RFQ has been Accepted - Phartimetic';
  const intro = `Hello ${buyerName || 'Buyer'}, thank you for accepting the quotation. We have confirmed your RFQ as ACCEPTED and our team will contact you soon with the next steps.`;
  const details = [
    { label: 'Buyer', value: buyerName || 'Buyer' },
    { label: 'RFQ ID', value: rfqId },
    { label: 'Supplier', value: supplierName || 'N/A' }
  ];
  return { subject, ...baseTemplate({ title: 'RFQ Accepted', intro, details, ctaText: 'View RFQ', ctaLink: rfqUrl(rfqId) }) };
};

export const rfqRejectedTemplate = (buyerName, rfqId, supplierName) => {
  const subject = 'Your RFQ has been Rejected - Phartimetic';
  const intro = `Hello ${buyerName || 'Buyer'}, your RFQ status has been updated to REJECTED.`;
  const details = [
    { label: 'Buyer', value: buyerName || 'Buyer' },
    { label: 'RFQ ID', value: rfqId },
    { label: 'Supplier', value: supplierName || 'N/A' }
  ];
  return { subject, ...baseTemplate({ title: 'RFQ Rejected', intro, details, ctaText: 'View RFQ', ctaLink: rfqUrl(rfqId) }) };
};

export const rfqQuotedTemplate = (buyerName, rfqId, supplierName, price) => {
  const subject = 'New Quotation Received for Your RFQ - Phartimetic';
  const intro = `Hello ${buyerName || 'Buyer'}, a new quotation has been submitted for your RFQ.`;
  const details = [
    { label: 'Buyer', value: buyerName || 'Buyer' },
    { label: 'RFQ ID', value: rfqId },
    { label: 'Supplier', value: supplierName || 'N/A' },
    { label: 'Quoted Price', value: price != null ? `${price}` : 'N/A' }
  ];
  return { subject, ...baseTemplate({ title: 'New RFQ Quotation', intro, details, ctaText: 'View RFQ', ctaLink: rfqUrl(rfqId) }) };
};
