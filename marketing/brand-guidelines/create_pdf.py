#!/usr/bin/env python3
"""Generate Assembl Brand Guidelines PDF — premium dark theme."""

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm, cm
from reportlab.lib.colors import HexColor, Color
from reportlab.pdfgen import canvas
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether
from reportlab.lib.enums import TA_LEFT, TA_CENTER

# Brand colours
BG_DARK = HexColor("#0A0A14")
BG_CARD = HexColor("#12121E")
BG_CARD_LIGHT = HexColor("#1A1A2E")
TEXT_WHITE = HexColor("#FAFAFA")
TEXT_MUTED = HexColor("#9090A0")
EMERALD = HexColor("#00C465")
NEON_GREEN = HexColor("#00FF88")
NEON_CYAN = HexColor("#00E5FF")
NEON_PURPLE = HexColor("#B388FF")
NEON_PINK = HexColor("#FF2D9B")
BORDER_SUBTLE = HexColor("#252538")

W, H = A4

def bg_and_header(c, doc):
    """Draw dark background and footer on every page."""
    c.saveState()
    c.setFillColor(BG_DARK)
    c.rect(0, 0, W, H, fill=1, stroke=0)
    # Footer line
    c.setStrokeColor(BORDER_SUBTLE)
    c.setLineWidth(0.5)
    c.line(30*mm, 15*mm, W - 30*mm, 15*mm)
    c.setFillColor(TEXT_MUTED)
    c.setFont("Helvetica", 7)
    c.drawString(30*mm, 10*mm, "Assembl Brand Guidelines v1.0  |  March 2026  |  Confidential")
    c.drawRightString(W - 30*mm, 10*mm, f"assembl.co.nz")
    c.restoreState()

def build_pdf():
    output_path = "/Users/kateharland/Downloads/assemblnz-main/marketing/brand-guidelines/ASSEMBL-BRAND-GUIDELINES.pdf"

    doc = SimpleDocTemplate(
        output_path,
        pagesize=A4,
        leftMargin=30*mm,
        rightMargin=30*mm,
        topMargin=25*mm,
        bottomMargin=25*mm,
    )

    # Styles
    styles = getSampleStyleSheet()

    s_title = ParagraphStyle('Title_Dark', parent=styles['Title'],
        fontName='Helvetica-Bold', fontSize=36, leading=42,
        textColor=TEXT_WHITE, spaceAfter=6*mm, alignment=TA_LEFT)

    s_subtitle = ParagraphStyle('Subtitle_Dark', parent=styles['Normal'],
        fontName='Helvetica', fontSize=13, leading=18,
        textColor=TEXT_MUTED, spaceAfter=12*mm)

    s_h1 = ParagraphStyle('H1_Dark', parent=styles['Heading1'],
        fontName='Helvetica-Bold', fontSize=26, leading=32,
        textColor=NEON_GREEN, spaceBefore=10*mm, spaceAfter=6*mm)

    s_h2 = ParagraphStyle('H2_Dark', parent=styles['Heading2'],
        fontName='Helvetica-Bold', fontSize=18, leading=24,
        textColor=NEON_CYAN, spaceBefore=8*mm, spaceAfter=4*mm)

    s_h3 = ParagraphStyle('H3_Dark', parent=styles['Heading3'],
        fontName='Helvetica-Bold', fontSize=14, leading=18,
        textColor=TEXT_WHITE, spaceBefore=5*mm, spaceAfter=3*mm)

    s_body = ParagraphStyle('Body_Dark', parent=styles['Normal'],
        fontName='Helvetica', fontSize=10.5, leading=16,
        textColor=TEXT_WHITE, spaceAfter=3*mm)

    s_body_muted = ParagraphStyle('Body_Muted', parent=s_body,
        textColor=TEXT_MUTED)

    s_bullet = ParagraphStyle('Bullet_Dark', parent=s_body,
        bulletFontName='Helvetica', bulletFontSize=10,
        leftIndent=8*mm, bulletIndent=3*mm, spaceBefore=1*mm, spaceAfter=1*mm)

    s_code = ParagraphStyle('Code_Dark', parent=styles['Code'],
        fontName='Courier', fontSize=9, leading=13,
        textColor=NEON_GREEN, backColor=BG_CARD,
        borderPadding=(3*mm, 3*mm, 3*mm, 3*mm), spaceAfter=4*mm)

    s_quote = ParagraphStyle('Quote_Dark', parent=s_body,
        fontName='Helvetica-Oblique', fontSize=14, leading=20,
        textColor=NEON_GREEN, leftIndent=5*mm, spaceBefore=4*mm, spaceAfter=4*mm)

    story = []

    # ========== COVER PAGE ==========
    story.append(Spacer(1, 40*mm))
    story.append(Paragraph("A S S E M B L", ParagraphStyle('LogoText',
        fontName='Helvetica-Bold', fontSize=48, leading=52,
        textColor=TEXT_WHITE, alignment=TA_LEFT, spaceAfter=3*mm)))
    story.append(Spacer(1, 2*mm))
    story.append(Paragraph("Brand Guidelines", ParagraphStyle('CoverSub',
        fontName='Helvetica', fontSize=22, leading=28,
        textColor=NEON_CYAN, spaceAfter=8*mm)))
    story.append(Spacer(1, 5*mm))
    story.append(Paragraph("Version 1.0  |  March 2026", s_body_muted))
    story.append(Paragraph("Confidential  -  Internal and Agency Use Only", s_body_muted))
    story.append(Spacer(1, 30*mm))
    story.append(Paragraph("The Operating System for NZ Business", s_quote))
    story.append(Spacer(1, 10*mm))
    story.append(Paragraph("assembl.co.nz", ParagraphStyle('URL',
        fontName='Helvetica', fontSize=12, textColor=EMERALD)))
    story.append(PageBreak())

    # ========== TABLE OF CONTENTS ==========
    story.append(Paragraph("Contents", s_h1))
    story.append(Spacer(1, 5*mm))
    toc_items = [
        "01  Brand Essence", "02  Visual Identity", "03  Typography",
        "04  Logo Usage", "05  Tone of Voice", "06  Agent Naming Convention",
        "07  Social Media Guidelines", "08  Photography Style",
        "09  Pricing Display", "10  Do's and Don'ts"
    ]
    for item in toc_items:
        story.append(Paragraph(item, ParagraphStyle('TOC',
            fontName='Helvetica', fontSize=13, leading=22,
            textColor=TEXT_WHITE, leftIndent=5*mm)))
    story.append(PageBreak())

    # ========== 1. BRAND ESSENCE ==========
    story.append(Paragraph("01  Brand Essence", s_h1))
    story.append(Paragraph("Who We Are", s_h2))
    story.append(Paragraph(
        "Assembl is the operating system for New Zealand business. We provide 42 purpose-built AI agents, "
        "each trained on NZ legislation, regulation, and business practice, working together as a single "
        "intelligence layer. Founded by Kate Hudson in Auckland, Assembl exists to give every Kiwi business "
        "access to the same AI capability that was previously only available to enterprise organisations.",
        s_body))

    story.append(Paragraph("Mission", s_h3))
    story.append(Paragraph("Democratise AI for New Zealand business.", s_quote))

    story.append(Paragraph("Vision", s_h3))
    story.append(Paragraph("Become the default business operating system for Aotearoa.", s_quote))

    story.append(Paragraph("Primary Tagline", s_h3))
    story.append(Paragraph("The Operating System for NZ Business", s_quote))

    story.append(Paragraph("Secondary Taglines", s_h3))
    tagline_data = [
        ["Tagline", "Best Used For"],
        ["42 agents. One brain.", "Product capability, technical audiences"],
        ["Built in Aotearoa.", "NZ identity, local pride, provenance"],
        ["Replace six platforms with one.", "Cost/efficiency messaging"],
    ]
    t = Table(tagline_data, colWidths=[55*mm, 85*mm])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), BG_CARD_LIGHT),
        ('BACKGROUND', (0, 1), (-1, -1), BG_CARD),
        ('TEXTCOLOR', (0, 0), (-1, 0), NEON_CYAN),
        ('TEXTCOLOR', (0, 1), (-1, -1), TEXT_WHITE),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 9.5),
        ('LEADING', (0, 0), (-1, -1), 14),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER_SUBTLE),
        ('TOPPADDING', (0, 0), (-1, -1), 3*mm),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3*mm),
        ('LEFTPADDING', (0, 0), (-1, -1), 3*mm),
    ]))
    story.append(t)

    story.append(Paragraph("Brand Values", s_h3))
    values = [
        "<b>Accessible</b> - AI should not be a privilege reserved for corporates.",
        "<b>Grounded</b> - Every claim is backed by NZ legislation and real business context.",
        "<b>Kiwi-first</b> - Built here, for here. Not a Silicon Valley product with a .co.nz bolted on.",
        "<b>Intelligent</b> - 42 agents working in concert, not a single chatbot with a search bar.",
        "<b>Bold</b> - We are not afraid to challenge the status quo of overpriced, fragmented SaaS.",
    ]
    for v in values:
        story.append(Paragraph(v, s_bullet, bulletText="\u2022"))
    story.append(PageBreak())

    # ========== 2. VISUAL IDENTITY ==========
    story.append(Paragraph("02  Visual Identity", s_h1))
    story.append(Paragraph(
        "Assembl uses a dark-first, neon-accent visual system. All primary interfaces, marketing materials, "
        "and collateral use a near-black background with vibrant neon accents.", s_body))

    story.append(Paragraph("Core Colours", s_h2))
    colour_data = [
        ["Role", "Hex / HSL", "Usage"],
        ["Background", "#0A0A14  |  240 10% 3.9%", "All backgrounds, canvases, cards"],
        ["Foreground", "#FAFAFA  |  0 0% 98%", "Body text, headings, labels"],
        ["Primary (Emerald)", "hsl(160 84% 39%)", "Buttons, links, focus rings"],
        ["Border", "hsl(240 6% 14%)", "Card borders, dividers"],
        ["Muted text", "hsl(240 5% 64.9%)", "Secondary text, captions"],
    ]
    t = Table(colour_data, colWidths=[40*mm, 50*mm, 50*mm])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), BG_CARD_LIGHT),
        ('BACKGROUND', (0, 1), (-1, -1), BG_CARD),
        ('TEXTCOLOR', (0, 0), (-1, 0), NEON_CYAN),
        ('TEXTCOLOR', (0, 1), (-1, -1), TEXT_WHITE),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('LEADING', (0, 0), (-1, -1), 13),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER_SUBTLE),
        ('TOPPADDING', (0, 0), (-1, -1), 2.5*mm),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2.5*mm),
        ('LEFTPADDING', (0, 0), (-1, -1), 2.5*mm),
    ]))
    story.append(t)
    story.append(Spacer(1, 5*mm))

    story.append(Paragraph("Neon Accent Palette", s_h2))
    neon_data = [
        ["Name", "Hex", "Tailwind Class"],
        ["Neon Green", "#00FF88", "neon-green"],
        ["Neon Cyan", "#00E5FF", "neon-cyan"],
        ["Purple", "#B388FF", "neon-gold"],
        ["Neon Pink", "#FF2D9B", "neon-pink"],
        ["Neon Lime", "#7CFF6B", "neon-lime"],
        ["Neon Red", "#FF4D6A", "neon-red"],
        ["Neon Teal", "#00FF94", "neon-teal"],
        ["Neon Blue", "#5B8CFF", "neon-blue"],
        ["Neon Amber", "#FF8C42", "neon-amber"],
    ]
    t = Table(neon_data, colWidths=[35*mm, 35*mm, 35*mm])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), BG_CARD_LIGHT),
        ('BACKGROUND', (0, 1), (-1, -1), BG_CARD),
        ('TEXTCOLOR', (0, 0), (-1, 0), NEON_CYAN),
        ('TEXTCOLOR', (0, 1), (-1, -1), TEXT_WHITE),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTNAME', (0, 1), (0, -1), 'Helvetica-Bold'),
        ('FONTNAME', (1, 1), (-1, -1), 'Courier'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER_SUBTLE),
        ('TOPPADDING', (0, 0), (-1, -1), 2*mm),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2*mm),
        ('LEFTPADDING', (0, 0), (-1, -1), 2.5*mm),
    ]))
    story.append(t)

    story.append(Paragraph("Glassmorphism Treatment", s_h2))
    story.append(Paragraph(
        "Cards, panels, and floating UI elements use a frosted-glass aesthetic:", s_body))
    glass_items = [
        "<b>Background:</b>  rgba(14, 14, 26, 0.7) - semi-transparent near-black",
        "<b>Backdrop blur:</b>  16px",
        "<b>Border:</b>  rgba(255, 255, 255, 0.06) - barely visible white edge",
        "<b>Border radius:</b>  0.75rem (12px)",
    ]
    for g in glass_items:
        story.append(Paragraph(g, s_bullet, bulletText="\u2022"))

    story.append(Paragraph("Gradient Text", s_h2))
    story.append(Paragraph(
        "Hero headings use a signature gradient: green to cyan to blue at 135 degrees, "
        "paired with a subtle glow drop-shadow for depth.", s_body))
    story.append(Paragraph(
        "Colours: #00FF88 > #00E5FF > #5B8CFF",
        ParagraphStyle('GradSpec', fontName='Courier', fontSize=10, textColor=NEON_GREEN, spaceAfter=4*mm)))
    story.append(PageBreak())

    # ========== 3. TYPOGRAPHY ==========
    story.append(Paragraph("03  Typography", s_h1))
    story.append(Paragraph("Font Stack", s_h2))
    type_data = [
        ["Role", "Font Family", "Weights", "Fallback"],
        ["Display", "General Sans", "600, 700", "Inter, sans-serif"],
        ["Headings", "General Sans", "700 (Extrabold)", "Inter, sans-serif"],
        ["Body", "Inter", "300-900", "sans-serif"],
        ["Monospace", "JetBrains Mono", "400, 500", "monospace"],
    ]
    t = Table(type_data, colWidths=[30*mm, 40*mm, 35*mm, 35*mm])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), BG_CARD_LIGHT),
        ('BACKGROUND', (0, 1), (-1, -1), BG_CARD),
        ('TEXTCOLOR', (0, 0), (-1, 0), NEON_CYAN),
        ('TEXTCOLOR', (0, 1), (-1, -1), TEXT_WHITE),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER_SUBTLE),
        ('TOPPADDING', (0, 0), (-1, -1), 2.5*mm),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2.5*mm),
        ('LEFTPADDING', (0, 0), (-1, -1), 2.5*mm),
    ]))
    story.append(t)

    story.append(Paragraph("Typography Rules", s_h3))
    type_rules = [
        "Headlines are always tight-tracked (letter-spacing: -0.02em to -0.01em).",
        "Body copy set at comfortable reading width (max 65-75 characters per line).",
        "Agent codes (e.g. ASM-003) always in JetBrains Mono with their assigned neon colour.",
        "Never use light or thin weights on dark backgrounds below 16px.",
    ]
    for r in type_rules:
        story.append(Paragraph(r, s_bullet, bulletText="\u2022"))
    story.append(PageBreak())

    # ========== 4. LOGO USAGE ==========
    story.append(Paragraph("04  Logo Usage", s_h1))
    story.append(Paragraph("Logo Components", s_h2))
    story.append(Paragraph(
        "The Assembl logo consists of two elements:", s_body))
    story.append(Paragraph(
        "<b>1. Molecule Icon</b> - An abstract molecular/node structure representing connected intelligence.",
        s_bullet, bulletText="\u2022"))
    story.append(Paragraph(
        '<b>2. Wordmark</b> - "ASSEMBL" set in tracked uppercase General Sans (Bold).',
        s_bullet, bulletText="\u2022"))
    story.append(Paragraph(
        "These two elements should always appear together in primary usage. The molecule icon may be used "
        "alone as a favicon, app icon, or social avatar.", s_body))

    story.append(Paragraph("Background Requirements", s_h3))
    story.append(Paragraph(
        "The logo must ONLY appear on dark backgrounds (#0A0A14 or similar near-black). "
        "NEVER place the logo on white, light grey, or any light-coloured background.", s_body))

    story.append(Paragraph("Clear Space", s_h3))
    story.append(Paragraph(
        "Maintain a minimum clear space of 1x the logo height on all sides.", s_body))

    story.append(Paragraph("Logo Don'ts", s_h3))
    logo_donts = [
        "Never stretch, compress, or distort the logo proportions.",
        "Never rotate the logo.",
        "Never recolour outside the approved palette.",
        "Never add shadows, outlines, or unapproved effects.",
        "Never recreate using alternative fonts.",
        "Never place on light backgrounds.",
    ]
    for d in logo_donts:
        story.append(Paragraph(d, s_bullet, bulletText="\u2022"))
    story.append(PageBreak())

    # ========== 5. TONE OF VOICE ==========
    story.append(Paragraph("05  Tone of Voice", s_h1))
    story.append(Paragraph(
        "Assembl sounds like a smart, confident Kiwi who knows their stuff but does not talk down to "
        "anyone. We are direct, warm, and grounded.", s_body))

    story.append(Paragraph("Voice Attributes", s_h2))
    voice_data = [
        ["Attribute", "Example"],
        ["Confident", "42 agents trained on NZ law. Not generic AI with a flag on it."],
        ["Warm", "Kia ora. Let's get your business sorted."],
        ["Kiwi-authentic", "Built right here in Aotearoa, for Kiwi businesses."],
        ["Direct", "Replace six platforms with one. Save $2,000/month."],
        ["Technically accurate", "APEX handles Employment Relations Act 2000 compliance."],
    ]
    t = Table(voice_data, colWidths=[35*mm, 105*mm])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), BG_CARD_LIGHT),
        ('BACKGROUND', (0, 1), (-1, -1), BG_CARD),
        ('TEXTCOLOR', (0, 0), (-1, 0), NEON_CYAN),
        ('TEXTCOLOR', (0, 1), (0, -1), NEON_GREEN),
        ('TEXTCOLOR', (1, 1), (-1, -1), TEXT_WHITE),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTNAME', (0, 1), (0, -1), 'Helvetica-Bold'),
        ('FONTNAME', (1, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('LEADING', (0, 0), (-1, -1), 14),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER_SUBTLE),
        ('TOPPADDING', (0, 0), (-1, -1), 2.5*mm),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2.5*mm),
        ('LEFTPADDING', (0, 0), (-1, -1), 2.5*mm),
    ]))
    story.append(t)

    story.append(Paragraph("NZ English Spelling (Mandatory)", s_h3))
    spelling = [
        "analyse (not analyze), colour (not color), organisation (not organization)",
        "programme (not program), centre (not center), behaviour (not behavior)",
        "recognise (not recognize), customise (not customize), licence (noun) / license (verb)",
    ]
    for sp in spelling:
        story.append(Paragraph(sp, s_bullet, bulletText="\u2022"))

    story.append(Paragraph("Te Reo Maori Integration", s_h3))
    story.append(Paragraph(
        "Incorporate Te Reo Maori naturally and respectfully. Appropriate usage includes: "
        "Kia ora, Aotearoa, Whanau, Kaupapa, Kaitiaki. Use macrons where correct.", s_body))
    story.append(PageBreak())

    # ========== 6. AGENT NAMING ==========
    story.append(Paragraph("06  Agent Naming Convention", s_h1))
    story.append(Paragraph("Format", s_h2))
    story.append(Paragraph(
        "NAME (ASM-XXX)",
        ParagraphStyle('AgentFormat', fontName='Courier-Bold', fontSize=16, textColor=NEON_GREEN,
                       spaceAfter=4*mm, spaceBefore=2*mm)))
    story.append(Paragraph(
        "NAME is all uppercase, 4-6 letters. ASM is the Assembl prefix. XXX is a three-digit "
        "zero-padded numeric identifier.", s_body))

    agent_data = [
        ["Agent", "Code", "Domain"],
        ["APEX", "ASM-003", "Employment and HR compliance"],
        ["ANCHOR", "ASM-007", "Financial stability and reporting"],
        ["HELM", "ASM-012", "Strategic business steering"],
        ["SPARK", "ASM-015", "Marketing and creative content"],
        ["ECHO", "ASM-008", "Content generation and social media"],
        ["AURA", "ASM-010", "Hospitality operations"],
        ["TURF", "ASM-020", "Sports and recreation"],
        ["FLUX", "ASM-005", "Sales strategy and lead conversion"],
    ]
    t = Table(agent_data, colWidths=[30*mm, 30*mm, 80*mm])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), BG_CARD_LIGHT),
        ('BACKGROUND', (0, 1), (-1, -1), BG_CARD),
        ('TEXTCOLOR', (0, 0), (-1, 0), NEON_CYAN),
        ('TEXTCOLOR', (0, 1), (0, -1), NEON_GREEN),
        ('TEXTCOLOR', (1, 1), (1, -1), NEON_CYAN),
        ('TEXTCOLOR', (2, 1), (-1, -1), TEXT_WHITE),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTNAME', (0, 1), (0, -1), 'Helvetica-Bold'),
        ('FONTNAME', (1, 1), (1, -1), 'Courier'),
        ('FONTSIZE', (0, 0), (-1, -1), 9.5),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER_SUBTLE),
        ('TOPPADDING', (0, 0), (-1, -1), 2.5*mm),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2.5*mm),
        ('LEFTPADDING', (0, 0), (-1, -1), 3*mm),
    ]))
    story.append(t)
    story.append(PageBreak())

    # ========== 7-8. SOCIAL + PHOTOGRAPHY ==========
    story.append(Paragraph("07  Social Media Guidelines", s_h1))
    story.append(Paragraph("Handle: @AssemblNZ across all platforms", s_body))
    story.append(Paragraph("Visual Standards", s_h2))
    social_rules = [
        "ALWAYS use dark backgrounds (#0A0A14 minimum).",
        "NEVER use white or light backgrounds for any social content.",
        "Use neon accent colours for text highlights and callout elements.",
        "Agent cards in social follow the same glassmorphism pattern as the product.",
        "Maintain gradient text treatment for key phrases in hero graphics.",
    ]
    for r in social_rules:
        story.append(Paragraph(r, s_bullet, bulletText="\u2022"))

    story.append(Paragraph("Primary Hashtags", s_h3))
    story.append(Paragraph("#Assembl  #NZTech  #AIforBusiness  #Aotearoa  #BuiltInNZ  #NZBusiness",
        ParagraphStyle('Tags', fontName='Helvetica-Bold', fontSize=11, textColor=NEON_CYAN, spaceAfter=4*mm)))

    story.append(Spacer(1, 8*mm))
    story.append(Paragraph("08  Photography Style", s_h1))
    story.append(Paragraph(
        "Dark, moody, and premium. Low-key lighting, deep shadows, rich contrast. "
        "NZ landscapes as subtle desaturated backgrounds. Tech-forward with neon accent lighting.", s_body))
    photo_donts = [
        "Never use stock photography with staged smiles or handshakes.",
        "Never use white or brightly lit photography.",
        "Never use photography that could be from anywhere - it must feel like Aotearoa.",
        "Never use AI-generated faces or people.",
    ]
    for d in photo_donts:
        story.append(Paragraph(d, s_bullet, bulletText="\u2022"))
    story.append(PageBreak())

    # ========== 9-10. PRICING + DOS/DONTS ==========
    story.append(Paragraph("09  Pricing Display", s_h1))
    pricing_rules = [
        "Always display prices in NZD (New Zealand Dollars).",
        "Monthly prices are the primary display. Always lead with monthly.",
        "Annual savings shown as percentage discount, not a separate price.",
        "The free tier must ALWAYS be visible in any pricing comparison.",
        "Label it 'Free' or 'Starter - Free', never 'Trial'.",
    ]
    for r in pricing_rules:
        story.append(Paragraph(r, s_bullet, bulletText="\u2022"))

    story.append(Spacer(1, 8*mm))
    story.append(Paragraph("10  Do's and Don'ts", s_h1))

    story.append(Paragraph("Do", s_h2))
    dos = [
        "Reference specific NZ legislation by name (e.g. Employment Relations Act 2000).",
        "Use agent neon colours consistently - every agent has one permanent colour.",
        'Include "Built in Aotearoa" in marketing materials.',
        "Use dark backgrounds everywhere. The brand lives in the dark.",
        'Show the 42-agent number. "42 agents" is more compelling than "multiple AI agents".',
        "Use the glassmorphism card treatment as the signature UI pattern.",
        "Be specific about cost savings with real numbers.",
        "Use Te Reo Maori naturally, not as tokenism.",
    ]
    for d in dos:
        story.append(Paragraph(d, s_bullet, bulletText="\u2022"))

    story.append(Paragraph("Don't", s_h2))
    donts = [
        "Don't use light or white backgrounds. Dark only.",
        'Don\'t call Assembl a "chatbot". It is an AI operating system.',
        "Don't make generic AI claims. Always ground in NZ context.",
        "Don't use American English spelling.",
        "Don't use stock photography.",
        "Don't change an agent's assigned colour. Once set, it is permanent.",
        "Don't use the logo on light backgrounds.",
        'Don\'t describe the product as a "tool". It is a platform.',
    ]
    for d in donts:
        story.append(Paragraph(d, s_bullet, bulletText="\u2022"))
    story.append(PageBreak())

    # ========== QUICK REFERENCE ==========
    story.append(Paragraph("Quick Reference", s_h1))
    ref_data = [
        ["Element", "Value"],
        ["Primary tagline", "The Operating System for NZ Business"],
        ["Background", "#0A0A14  |  hsl(240 10% 3.9%)"],
        ["Text", "#FAFAFA  |  hsl(0 0% 98%)"],
        ["Primary accent", "Emerald  hsl(160 84% 39%)"],
        ["Hero accent", "Neon Green  #00FF88"],
        ["Display font", "General Sans (Bold)"],
        ["Body font", "Inter"],
        ["Code font", "JetBrains Mono"],
        ["Glass background", "rgba(14, 14, 26, 0.7)"],
        ["Glass blur", "backdrop-filter: blur(16px)"],
        ["Glass border", "rgba(255, 255, 255, 0.06)"],
        ["Border radius", "0.75rem"],
        ["Domain", "assembl.co.nz"],
        ["Handle", "@AssemblNZ"],
        ["Currency", "NZD"],
        ["Agent format", "NAME (ASM-XXX)"],
    ]
    t = Table(ref_data, colWidths=[40*mm, 100*mm])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), BG_CARD_LIGHT),
        ('BACKGROUND', (0, 1), (-1, -1), BG_CARD),
        ('TEXTCOLOR', (0, 0), (-1, 0), NEON_CYAN),
        ('TEXTCOLOR', (0, 1), (0, -1), TEXT_MUTED),
        ('TEXTCOLOR', (1, 1), (-1, -1), TEXT_WHITE),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTNAME', (0, 1), (0, -1), 'Helvetica'),
        ('FONTNAME', (1, 1), (-1, -1), 'Courier'),
        ('FONTSIZE', (0, 0), (-1, -1), 9.5),
        ('LEADING', (0, 0), (-1, -1), 14),
        ('GRID', (0, 0), (-1, -1), 0.5, BORDER_SUBTLE),
        ('TOPPADDING', (0, 0), (-1, -1), 2.5*mm),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 2.5*mm),
        ('LEFTPADDING', (0, 0), (-1, -1), 3*mm),
    ]))
    story.append(t)

    story.append(Spacer(1, 15*mm))
    story.append(Paragraph("Assembl  -  Built in Aotearoa.", ParagraphStyle('Footer',
        fontName='Helvetica-Oblique', fontSize=14, textColor=NEON_GREEN, alignment=TA_CENTER)))

    # Build
    doc.build(story, onFirstPage=bg_and_header, onLaterPages=bg_and_header)
    print(f"PDF created: {output_path}")

if __name__ == "__main__":
    build_pdf()
