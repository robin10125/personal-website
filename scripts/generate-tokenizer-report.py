from pathlib import Path
from reportlab.lib.colors import HexColor
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak
from xml.sax.saxutils import escape

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "research-briefs/tokenizer-frequency-floor-full-preliminary-report.md"
OUTPUT = ROOT / "research-briefs/tokenizer-frequency-floor-full-preliminary-report.pdf"

styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name="ReportTitle", parent=styles["Title"], fontName="Helvetica-Bold", fontSize=21, leading=25, textColor=HexColor("#171614"), alignment=TA_CENTER, spaceAfter=16))
styles.add(ParagraphStyle(name="H1", parent=styles["Heading2"], fontName="Helvetica-Bold", fontSize=14, leading=18, textColor=HexColor("#7a312d"), spaceBefore=14, spaceAfter=7, keepWithNext=True))
styles.add(ParagraphStyle(name="BodySmall", parent=styles["BodyText"], fontName="Helvetica", fontSize=8.8, leading=12, spaceAfter=5))
styles.add(ParagraphStyle(name="BulletSmall", parent=styles["BodySmall"], leftIndent=14, firstLineIndent=-9))

def footer(canvas, doc):
    canvas.saveState()
    canvas.setStrokeColor(HexColor("#d7d1ca"))
    canvas.line(doc.leftMargin, 0.53 * inch, letter[0] - doc.rightMargin, 0.53 * inch)
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(HexColor("#68625e"))
    canvas.drawString(doc.leftMargin, 0.35 * inch, "Tokenizer Frequency Floor Research Program — preliminary synthesis")
    canvas.drawRightString(letter[0] - doc.rightMargin, 0.35 * inch, f"Page {doc.page}")
    canvas.restoreState()

def inline(text):
    text = escape(text)
    text = text.replace("**", "")
    return text.replace("`", "")

def build():
    story = []
    for raw in SOURCE.read_text().splitlines():
        line = raw.strip()
        if not line:
            story.append(Spacer(1, 2))
        elif line.startswith("# "):
            story.append(Paragraph(inline(line[2:]), styles["ReportTitle"]))
            story.append(Paragraph("Evidence-led program summary for portfolio and preliminary blog development", styles["BodySmall"]))
            story.append(Spacer(1, 7))
        elif line.startswith("## "):
            story.append(Paragraph(inline(line[3:]), styles["H1"]))
        elif line.startswith("- "):
            story.append(Paragraph("• " + inline(line[2:]), styles["BulletSmall"]))
        elif line.startswith("|") or line.startswith("```") or line == "```":
            continue
        else:
            story.append(Paragraph(inline(line), styles["BodySmall"]))
    doc = SimpleDocTemplate(str(OUTPUT), pagesize=letter, rightMargin=0.68*inch, leftMargin=0.68*inch, topMargin=0.62*inch, bottomMargin=0.72*inch, title="Tokenizer Frequency Floor Research Program — preliminary synthesis", author="Robin Hylands")
    doc.build(story, onFirstPage=footer, onLaterPages=footer)

if __name__ == "__main__":
    build()
