import { nanoid } from 'nanoid';
import QRCode from 'qrcode';
import PDFDocument from 'pdfkit';
import { Certificate } from '../models/Certificate.js';

export async function issueCertificate({ student, course }) {
  const existing = await Certificate.findOne({ student, course });
  if (existing) return existing;

  const certificateId = `CERT-${new Date().getFullYear()}-${nanoid(10).toUpperCase()}`;
  const verifyUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/verify/${certificateId}`;
  await QRCode.toDataURL(verifyUrl);

  const certificate = await Certificate.create({
    certificateId,
    student,
    course,
    qrPayload: verifyUrl,
    issuedAt: new Date()
  });

  return certificate;
}

export function buildCertificatePdfStream({ studentName, courseTitle, certificateId, issuedAt }) {
  const doc = new PDFDocument({ size: 'A4', layout: 'landscape', margin: 60 });
  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;

  // Background
  doc.rect(0, 0, pageWidth, pageHeight).fill('#f8faff');

  // Border decorations
  doc.rect(20, 20, pageWidth - 40, pageHeight - 40).lineWidth(2).stroke('#2f7df6');
  doc.rect(28, 28, pageWidth - 56, pageHeight - 56).lineWidth(0.5).stroke('#93c5fd');

  // Header band
  doc.rect(0, 0, pageWidth, 80).fill('#1d64d8');

  // Platform name
  doc.fillColor('#ffffff').fontSize(14).font('Helvetica-Bold')
    .text('OnlineTest LMS', 0, 28, { align: 'center' });

  // Subtitle in header
  doc.fillColor('#bfdbfe').fontSize(9).font('Helvetica')
    .text('CERTIFICATE OF COMPLETION', 0, 50, { align: 'center', characterSpacing: 3 });

  // Main title
  doc.fillColor('#1e3a8a').fontSize(36).font('Helvetica-Bold')
    .text('Certificate of Completion', 0, 110, { align: 'center' });

  // Divider line
  const divX = pageWidth / 2 - 120;
  doc.moveTo(divX, 165).lineTo(divX + 240, 165).lineWidth(1).stroke('#2f7df6');

  // "This is to certify that"
  doc.fillColor('#64748b').fontSize(13).font('Helvetica')
    .text('This is to certify that', 0, 185, { align: 'center' });

  // Student name
  doc.fillColor('#0f172a').fontSize(28).font('Helvetica-Bold')
    .text(studentName, 0, 210, { align: 'center' });

  // Completion text
  doc.fillColor('#64748b').fontSize(13).font('Helvetica')
    .text('has successfully completed the course', 0, 255, { align: 'center' });

  // Course title
  doc.fillColor('#1d64d8').fontSize(20).font('Helvetica-Bold')
    .text(courseTitle, 60, 278, { align: 'center', width: pageWidth - 120 });

  // Issue date
  const dateStr = issuedAt ? new Date(issuedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  doc.fillColor('#64748b').fontSize(11).font('Helvetica')
    .text(`Date of Completion: ${dateStr}`, 0, 330, { align: 'center' });

  // Certificate ID
  doc.fillColor('#94a3b8').fontSize(9).font('Helvetica')
    .text(`Certificate ID: ${certificateId}`, 0, 352, { align: 'center' });

  // Footer band
  doc.rect(0, pageHeight - 60, pageWidth, 60).fill('#1d64d8');
  doc.fillColor('#bfdbfe').fontSize(8).font('Helvetica')
    .text('Verify this certificate at: onlinetest.app/verify/' + certificateId, 0, pageHeight - 38, { align: 'center' });

  doc.end();
  return doc;
}
