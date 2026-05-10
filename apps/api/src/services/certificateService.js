import { nanoid } from 'nanoid';
import QRCode from 'qrcode';
import PDFDocument from 'pdfkit';
import { Certificate } from '../models/Certificate.js';

export async function issueCertificate({ student, course }) {
  const certificateId = `CERT-${new Date().getFullYear()}-${nanoid(10).toUpperCase()}`;
  const qrPayload = `${process.env.CLIENT_URL}/verify/${certificateId}`;
  await QRCode.toDataURL(qrPayload);
  const certificate = await Certificate.create({ certificateId, student, course, qrPayload });
  return certificate;
}

export function buildCertificatePdfStream({ studentName, courseTitle, certificateId }) {
  const doc = new PDFDocument({ size: 'A4', layout: 'landscape' });
  doc.fontSize(28).text('OnlineTest LMS Certificate', { align: 'center' });
  doc.moveDown();
  doc.fontSize(18).text(`This certifies that ${studentName}`, { align: 'center' });
  doc.moveDown();
  doc.fontSize(22).text(`completed ${courseTitle}`, { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Certificate ID: ${certificateId}`, { align: 'center' });
  doc.end();
  return doc;
}
