import PDFDocument from 'pdfkit';
import { prisma } from '../config/db.js';

/**
 * Generate a formal PDF complaint for a specific report.
 * @param {string} reportId 
 * @returns {Promise<Buffer>}
 */
export const generateComplaintPDF = async (reportId) => {
    const report = await prisma.report.findUnique({
        where: { id: reportId },
        include: {
            user: true,
            mediaEvidence: true,
            aiAnalysis: true
        }
    });

    if (!report) throw new Error("Report not found");

    return new Promise((resolve, reject) => {
        const doc = new PDFDocument({ margin: 50 });
        const buffers = [];

        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => resolve(Buffer.concat(buffers)));

        // --- STYLE HELPERS ---
        const titleColor = '#1E293B'; // Slate 900
        const accentColor = '#0F172A'; // Slate 800
        const mutedColor = '#64748B'; // Slate 500

        // --- HEADER ---
        doc.fillColor(titleColor).font('Helvetica-Bold').fontSize(18).text('DIGITAL COMPLAINT DRAFT', { align: 'center' });
        doc.fontSize(10).fillColor(mutedColor).text('(Auto-Generated with Victim Assistance AI)', { align: 'center' });
        doc.moveDown(1.5);

        // --- 1. COMPLAINANT DETAILS ---
        doc.fontSize(14).font('Helvetica-Bold').fillColor(titleColor).text('1. Complainant Details');
        doc.fontSize(10).fillColor(mutedColor).text('(Auto-filled / Optional fields to protect privacy)');
        doc.moveDown(0.5);
        doc.fontSize(11).font('Helvetica').fillColor(accentColor);
        doc.text(`Name: ${report.user?.name || '[Victim Name / Anonymous ID]'}`);
        doc.text(`Age: [Age]`);
        doc.text(`Gender: Female`);
        doc.text(`Contact Number: [Optional]`);
        doc.text(`Email ID: ${report.user?.email || '[Optional]'}`);
        doc.text(`Current Location: [City, State]`);
        doc.moveDown(0.5);
        doc.fontSize(10).font('Helvetica-Oblique').text('Note: The complainant requests confidentiality under applicable laws.');
        doc.moveDown(1.5);

        // --- 2. NATURE OF COMPLAINT ---
        doc.fontSize(14).font('Helvetica-Bold').fillColor(titleColor).text('2. Nature of the Complaint');
        doc.moveDown(0.5);
        doc.fontSize(11).font('Helvetica').fillColor(accentColor);
        doc.text('Category: Cyber Crime – Digital Abuse / Defamation / Harassment');
        doc.text('Sub-Category: Non-Consensual Deepfake / Morphed Image Circulation');
        doc.moveDown(1.5);

        // --- 3. INCIDENT SUMMARY ---
        doc.fontSize(14).font('Helvetica-Bold').fillColor(titleColor).text('3. Incident Summary (Plain-Language Narrative)');
        doc.moveDown(0.5);
        doc.fontSize(11).font('Helvetica').fillColor(accentColor).text(
            'I, the undersigned, wish to bring to your notice that I have been subjected to severe digital harassment through the creation and circulation of non-consensual morphed / deepfake images depicting me in a compromising and fabricated manner.',
            { align: 'justify' }
        );
        doc.moveDown(0.5);
        doc.text(
            'These images appear to have been digitally manipulated using artificial intelligence or image editing tools without my knowledge or consent. The content is false, defamatory, and has caused me extreme emotional distress, fear, and reputational harm.',
            { align: 'justify' }
        );
        doc.moveDown(1.5);

        // --- 4. TIMELINE OF EVENTS ---
        doc.fontSize(14).font('Helvetica-Bold').fillColor(titleColor).text('4. Timeline of Events');
        doc.moveDown(0.5);
        const metadata = report.mediaEvidence[0]?.metadata ? JSON.parse(report.mediaEvidence[0].metadata) : {};
        doc.fontSize(11).font('Helvetica').fillColor(accentColor);
        doc.text(`Date of First Discovery: ${metadata.date || '[DD/MM/YYYY]'}`);
        doc.text(`Approximate Time: [HH:MM AM/PM]`);
        doc.moveDown(0.5);
        doc.font('Helvetica-Bold').text('How the Content Was Discovered:');
        doc.font('Helvetica').text(' Found on social media platform / Threatened via message (as indicated)');
        doc.moveDown(1.5);

        // --- 5. PLATFORMS ---
        doc.fontSize(14).font('Helvetica-Bold').fillColor(titleColor).text('5. Platforms Where Content Was Shared / Detected');
        doc.moveDown(0.5);
        doc.fontSize(11).font('Helvetica').fillColor(accentColor);
        doc.text(`Platform(s) Identified: ${metadata.platform || 'Under Investigation'}`);
        doc.text('(Some platforms or accounts may be unidentified at this stage.)');
        doc.moveDown(1.5);

        // --- 6. IMPACT ON VICTIM ---
        doc.fontSize(14).font('Helvetica-Bold').fillColor(titleColor).text('6. Impact on the Victim');
        doc.moveDown(0.5);
        doc.fontSize(11).font('Helvetica').fillColor(accentColor);
        doc.text('• Severe psychological distress and anxiety');
        doc.text('• Fear of social judgment and harassment');
        doc.text('• Damage to personal dignity and reputation');
        doc.text('• Constant fear of further circulation');
        doc.moveDown(0.5);
        doc.text('The continued existence of such content online poses an ongoing threat to my safety and mental well-being.', { align: 'justify' });
        doc.moveDown(1.5);

        // --- 7. EVIDENCE SUBMITTED ---
        doc.fontSize(14).font('Helvetica-Bold').fillColor(titleColor).text('7. Evidence Submitted');
        doc.fontSize(10).fillColor(mutedColor).text('(Digitally Preserved with Metadata Integrity)');
        doc.moveDown(0.5);
        doc.fontSize(11).font('Helvetica').fillColor(accentColor);
        doc.text('• Image(s): Suspected deepfake / morphed visuals');
        doc.text(`• Digital Hash (SHA-256): ${report.mediaEvidence[0]?.fileHash || 'N/A'}`);
        doc.moveDown(0.5);
        doc.font('Helvetica-Bold').text('AI Analysis Summary:');
        const aiData = report.aiAnalysis?.analysisText ? JSON.parse(report.aiAnalysis.analysisText) : {};
        (aiData.indicators || []).slice(0, 3).forEach(ind => {
            doc.font('Helvetica').text(`- ${ind}`);
        });
        doc.moveDown(0.3);
        doc.font('Helvetica-Oblique').text('All evidence has been preserved using cryptographic hashing to maintain chain-of-custody integrity.');
        doc.moveDown(1.5);

        // --- 8. SUSPECTED OFFENDER ---
        doc.fontSize(14).font('Helvetica-Bold').fillColor(titleColor).text('8. Suspected Offender Details (If Known)');
        doc.moveDown(0.5);
        doc.fontSize(11).font('Helvetica').fillColor(accentColor);
        doc.text('Username / Handle: [If available]');
        doc.text('Relationship: [Known / Unknown]');
        doc.text('(The complainant seeks assistance in tracing the source of origin.)');
        doc.moveDown(1.5);

        // --- 9. LEGAL PROVISIONS ---
        doc.fontSize(14).font('Helvetica-Bold').fillColor(titleColor).text('9. Legal Provisions Invoked (Indicative)');
        doc.moveDown(0.5);
        doc.fontSize(11).font('Helvetica').fillColor(accentColor);
        doc.font('Helvetica-Bold').text('IT Act, 2000:');
        doc.font('Helvetica').text('• Section 66E – Violation of Privacy');
        doc.text('• Section 67 / 67A – Publishing Obscene Content');
        doc.moveDown(0.3);
        doc.font('Helvetica-Bold').text('Bharatiya Nyaya Sanhita (BNS):');
        doc.font('Helvetica').text('• Defamation');
        doc.text('• Criminal Intimidation');
        doc.text('• Outraging Modesty of a Woman');
        doc.moveDown(1.5);

        // --- 10. RELIEF SOUGHT ---
        doc.fontSize(14).font('Helvetica-Bold').fillColor(titleColor).text('10. Relief Sought');
        doc.moveDown(0.5);
        doc.fontSize(11).font('Helvetica').fillColor(accentColor);
        doc.text('• Register this complaint and initiate investigation');
        doc.text('• Trace and identify the source of content creation and circulation');
        doc.text('• Issue takedown notices to relevant platforms');
        doc.text('• Take appropriate legal action against the offender(s)');
        doc.moveDown(1.5);

        // --- 11. DECLARATION ---
        doc.fontSize(14).font('Helvetica-Bold').fillColor(titleColor).text('11. Declaration');
        doc.moveDown(0.5);
        doc.fontSize(11).font('Helvetica').fillColor(accentColor).text(
            'I hereby declare that the information provided above is true to the best of my knowledge and belief. This document is generated with the assistance of an AI-based victim support system and is intended to facilitate lawful reporting.',
            { align: 'justify' }
        );
        doc.moveDown(1);
        doc.text(`Date: ${new Date().toLocaleDateString()}`);
        doc.text('Place: [City]');
        doc.moveDown(1);
        doc.text('Signature:');
        doc.font('Helvetica-Oblique').fontSize(10).text('(Digitally Acknowledged)');

        doc.end();
    });
};
