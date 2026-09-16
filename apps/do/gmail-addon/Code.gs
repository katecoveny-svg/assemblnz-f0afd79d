/** Launches the shared DO workspace. No mailbox-reading or sending scope. */
function doHome() {
  var section = CardService.newCardSection()
    .addWidget(CardService.newTextParagraph().setText('Your own little team of DOs. Record a meeting, review notes and prepare the next piece of work.'))
    .addWidget(CardService.newTextButton().setText('Open Meeting DO').setOpenLink(CardService.newOpenLink().setUrl('https://www.assembl.co.nz/do/meetings')))
    .addWidget(CardService.newTextButton().setText('Open my DOs').setOpenLink(CardService.newOpenLink().setUrl('https://www.assembl.co.nz/do')))
    .addWidget(CardService.newTextButton().setText('Manage connections').setOpenLink(CardService.newOpenLink().setUrl('https://www.assembl.co.nz/do/connections')))
    .addWidget(CardService.newTextParagraph().setText('This first add-on opens DO. It does not read your mailbox or record inside Gmail. Use the DO browser side panel to review selected email text.'));
  return CardService.newCardBuilder().setHeader(CardService.newCardHeader().setTitle('DO').setSubtitle('Meetings into prepared work')).addSection(section).build();
}
