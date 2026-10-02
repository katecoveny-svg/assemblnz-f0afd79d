// Test entry compiled only with DO_WIDGET_FIXTURE; no real sources.
let application = NSApplication.shared
application.setActivationPolicy(.prohibited)
var checks: [String] = []
func check(_ label: String, _ ok: Bool) { if !ok { fatalError(label) }; checks.append(label) }
let model = CompanionModel()
model.fictional.selection = .text("Fictional selected note")
model.captureSelection()
check("selected text is local review only", model.review == "Fictional selected note" && model.fictional.offers.isEmpty)
model.fictional.clipboard = "Fictional copied note"
model.reviewClipboard()
check("switch capture clears old text and paste authority", model.review == "Fictional copied note" && !model.destinationChecked)
model.fictional.selection = .denied; model.captureSelection()
check("permission denial clears stale toolbar review without reader call", model.review.isEmpty && model.fictional.selectionReads == 1)
model.fictional.selection = .secure; model.captureSelection()
model.fictional.selection = .unknownSecurity; model.captureSelection()
check("secure and unknown fields never read selected text", model.fictional.selectionReads == 1 && model.review.isEmpty)
model.fictional.selection = .text("   "); model.captureSelection()
check("empty selection cannot be added", model.review.isEmpty)
model.fictional.clipboard = nil; model.reviewClipboard()
check("empty clipboard clears prior review", model.review.isEmpty)
model.fictional.selection = .text(String(repeating:"😀",count:6001)); model.captureSelection()
check("oversized Unicode cannot be added", model.review.isEmpty)
model.fictional.selection = .text(String(repeating:"😀",count:6000)); model.captureSelection()
check("exact 12000 UTF16 bound is accepted", model.review.utf16.count == 12000)
model.fictional.destination = URL(string:"https://www.assembl.co.nz/do/bills")!
model.fictional.selection = .text("Fictional selected note"); model.captureSelection()
check("capture preserves other web route", model.fictional.destination.path == "/do/bills")
model.addToDO(); check("wrong route cannot receive text", model.fictional.offers.isEmpty)
model.fictional.destination = URL(string:"https://example.invalid/do/widget")!
model.addToDO(); check("wrong host cannot receive text", model.fictional.offers.isEmpty)
model.fictional.destination = URL(string:"http://www.assembl.co.nz/do/widget")!
model.addToDO(); check("nonHTTPS destination denied", model.fictional.offers.isEmpty)
model.fictional.destination = URL(string:"https://www.assembl.co.nz/do/widget")!
model.captureSelection(); model.captureSelection()
check("repeat capture never auto sends", model.fictional.offers.isEmpty)
model.clearCapture(); check("cancel or clear removes review and authority", model.review.isEmpty && !model.destinationChecked)
model.captureSelection(); model.addToDO(); check("explicit add is separate", model.fictional.offers.count == 1)
var opens = 0
let orb = DraggableOrbView(rootView: Orb())
orb.openDO = { opens += 1 }
let panel = OrbPanel(contentRect:NSRect(x:0,y:0,width:96,height:96),styleMask:[.borderless,.nonactivatingPanel],backing:.buffered,defer:false)
panel.contentView = orb
check("orb panel accepts key focus and first responder", panel.canBecomeKey && orb.acceptsFirstResponder && panel.makeFirstResponder(orb))
orb.setAccessibilityRole(.button)
check("accessibility press activates menu", orb.accessibilityPerformPress() && opens == 1)
for code: UInt16 in [36,49] {
 let event = NSEvent.keyEvent(with:.keyDown,location:.zero,modifierFlags:[],timestamp:0,windowNumber:0,context:nil,characters:code == 49 ? " " : "\r",charactersIgnoringModifiers:code == 49 ? " " : "\r",isARepeat:false,keyCode:code)!
 orb.keyDown(with:event)
}
check("Return and Space activate menu without capture", opens == 3 && model.fictional.offers.count == 1)
// Known release blocker: current URL-only bridge has no owner binding or ACK.
model.fictional.account = "fictional-owner-b"
model.addToDO()
let result: [String:Any] = ["passedChecks":checks,"knownReleaseBlockers":["same-path account switch still accepts an offer; recipient confirmation/lease is missing","editor acknowledgement is missing"],"wrongAccountBlocked":false,"realClipboardRead":false,"otherAppSelectionRead":false,"providerCalls":0]
let data = try! JSONSerialization.data(withJSONObject:result,options:[.prettyPrinted,.sortedKeys])
try! data.write(to:URL(fileURLWithPath:"output/widget-fixture/results.json"))
print(String(data:data,encoding:.utf8)!)
exit(2) // Explicit release hold until account/ack guards are implemented.
