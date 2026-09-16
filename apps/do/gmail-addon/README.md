# DO in Gmail — developer add-on

This is an Apps Script Google Workspace add-on launcher, not a published Marketplace listing. It adds a DO homepage card to Gmail's sidebar and opens the same Meeting DO/account workspace. It requests execution only: no mailbox read/send, calendar or background recording scopes.

## Install privately for testing

1. In the intended Google account, create an Apps Script project at https://script.google.com/ and enable showing the manifest in project settings.
2. Copy `Code.gs` and `appsscript.json` from this directory.
3. Use Deploy → Test deployments → Google Workspace Add-on → Install, authorising only the listed execution scope. Reload Gmail and open DO in the right sidebar.
4. Verify each card link after the Meeting DO web route is deployed. Recording opens a top-level browser page for microphone controls; the card does not record audio.

For other users, configure the Google Cloud project, OAuth consent and Marketplace listing and complete the applicable Google review. Do not describe a developer installation as public availability.

The existing Chrome extension in `../extension` is the richer immediate Gmail companion: select email text, open DO from the toolbar and choose “Use selected page text”. No whole-inbox access is granted by installing it. Meeting DO is linked from the panel. Installing either surface does not connect a customer's Gmail account to the hosted DO connector.

References: https://developers.google.com/workspace/add-ons/gmail and https://developers.google.com/workspace/add-ons/how-tos/testing-workspace-addons
