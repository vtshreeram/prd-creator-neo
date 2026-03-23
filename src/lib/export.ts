import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';

export async function exportToPDF(content: string, filename: string) {
  const doc = new jsPDF();
  const lines = doc.splitTextToSize(content, 180);
  doc.text(lines, 10, 10);
  doc.save(`${filename}.pdf`);
}

export async function exportToWord(content: string, filename: string) {
  // Simple markdown to docx conversion logic
  const sections = content.split('\n');
  const children = sections.map((line) => {
    if (line.startsWith('# ')) {
      return new Paragraph({
        text: line.replace('# ', ''),
        heading: HeadingLevel.HEADING_1
      });
    }
    if (line.startsWith('## ')) {
      return new Paragraph({
        text: line.replace('## ', ''),
        heading: HeadingLevel.HEADING_2
      });
    }
    if (line.startsWith('### ')) {
      return new Paragraph({
        text: line.replace('### ', ''),
        heading: HeadingLevel.HEADING_3
      });
    }
    return new Paragraph({
      children: [new TextRun(line)]
    });
  });

  const doc = new Document({
    sections: [{ children }]
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${filename}.docx`);
}
