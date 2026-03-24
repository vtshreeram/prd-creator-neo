export async function exportToPDF(content: string, filename: string) {
  try {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    const lines = doc.splitTextToSize(content, 180);
    doc.text(lines, 10, 10);
    doc.save(`${filename}.pdf`);
  } catch (error) {
    console.error('Failed to export PDF:', error);
    throw error;
  }
}

export async function exportToWord(content: string, filename: string) {
  try {
    const { Document, Packer, Paragraph, TextRun, HeadingLevel } = await import('docx');
    const { saveAs } = await import('file-saver');

    const lines = content.split('\n');
    const children = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.trim() === '') {
        if (i > 0 && lines[i - 1].trim() !== '') {
          children.push(new Paragraph({ text: '' }));
        }
        continue;
      }

      if (line.startsWith('# ')) {
        children.push(
          new Paragraph({
            text: line.replace('# ', ''),
            heading: HeadingLevel.HEADING_1
          })
        );
      } else if (line.startsWith('## ')) {
        children.push(
          new Paragraph({
            text: line.replace('## ', ''),
            heading: HeadingLevel.HEADING_2
          })
        );
      } else if (line.startsWith('### ')) {
        children.push(
          new Paragraph({
            text: line.replace('### ', ''),
            heading: HeadingLevel.HEADING_3
          })
        );
      } else if (line.startsWith('- ') || line.startsWith('* ')) {
        // Handle bold inside lists too
        const textContent = line.substring(2);
        const parts = textContent.split(/(\*\*.*?\*\*)/g).filter(Boolean);
        const runs = parts.map((part) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return new TextRun({ text: part.slice(2, -2), bold: true });
          }
          return new TextRun(part);
        });

        children.push(
          new Paragraph({
            children: runs,
            bullet: { level: 0 }
          })
        );
      } else {
        const parts = line.split(/(\*\*.*?\*\*)/g).filter(Boolean);
        const runs = parts.map((part) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return new TextRun({ text: part.slice(2, -2), bold: true });
          }
          return new TextRun(part);
        });

        children.push(
          new Paragraph({
            children: runs
          })
        );
      }
    }

    const doc = new Document({
      sections: [{ children }]
    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `${filename}.docx`);
  } catch (error) {
    console.error('Failed to export to Word:', error);
    throw error;
  }
}
