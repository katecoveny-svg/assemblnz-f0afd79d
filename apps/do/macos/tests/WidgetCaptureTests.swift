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
model.fictional.destination = URL(string:"https://www.assembl.co.nz/do/widget?nativeReview=1")!
model.captureSelection(); model.captureSelection()
check("repeat capture never auto sends", model.fictional.offers.isEmpty)
model.clearCapture(); check("cancel or clear removes review and authority", model.review.isEmpty && !model.destinationChecked)
model.captureSelection(); model.nativeReview.checkRecipient(); model.addToDO(); check("explicit add is separate", model.fictional.offers.count == 1)
var opens = 0
let orb = DraggableOrbView(rootView: Orb())
orb.openDO = { opens += 1 }
let panel = OrbPanel(contentRect:NSRect(x:0,y:0,width:96,height:96),styleMask:[.borderless,.nonactivatingPanel],backing:.buffered,defer:false)
panel.contentView = orb
check("orb panel accepts key focus and first responder", panel.canBecomeKey && orb.acceptsFirstResponder && panel.makeFirstResponder(orb))
orb.setAccessibilityRole(.button)
check("accessibility press activates menu", orb.accessibilityRole() == .button && orb.accessibilityLabel() == "Choose a DO action" && orb.accessibilityPerformPress() && opens == 1)
for code: UInt16 in [36,49] {
 let event = NSEvent.keyEvent(with:.keyDown,location:.zero,modifierFlags:[],timestamp:0,windowNumber:0,context:nil,characters:code == 49 ? " " : "\r",charactersIgnoringModifiers:code == 49 ? " " : "\r",isARepeat:false,keyCode:code)!
 orb.keyDown(with:event)
}
check("Return and Space activate menu without capture", opens == 3 && model.fictional.offers.count == 1)
// All sources remain fictional. Receiver rendering is verified separately in Chromium.
model.fictional.offers = []
model.captureSelection(); model.nativeReview.checkRecipient()
model.fictional.account = "10000000-0000-4000-8000-000000000002"
model.addToDO()
check("changed displayed account requires another explicit click", model.fictional.offers.isEmpty && model.nativeReview.recipient?["owner"] as? String == model.fictional.account)
model.addToDO(); check("confirmed new recipient can receive exact review", model.fictional.offers == [model.review])
model.addToDO(); check("one offer per native review revision", model.fictional.offers.count == 1)
model.fictional.offers = []; model.review = String(repeating:"😀",count:6001)
model.nativeReview.checkRecipient();model.addToDO();check("edited oversized text rejected at native Add",model.fictional.offers.isEmpty)
model.review = "Fictional";model.fictional.destination=URL(string:"https://www.assembl.co.nz:444/do/widget?nativeReview=1")!
model.nativeReview.checkRecipient();model.addToDO();check("wrong HTTPS port rejected",model.fictional.offers.isEmpty)
model.fictional.destination=URL(string:"https://www.assembl.co.nz/do/widget")!
model.nativeReview.checkRecipient();model.addToDO();check("legacy unbound page rejected",model.fictional.offers.isEmpty)
let errorModel=CompanionModel()
errorModel.fictional.destination=URL(string:"https://www.assembl.co.nz/do/widget?nativeReview=1")!
errorModel.nativeReview.transport={_,complete in complete(.success(["version":1,"status":"rejected","code":"workspace_version_required"]))}
errorModel.nativeReview.checkRecipient()
check("missing receiver is version error not sign-in",errorModel.status.contains("matching workspace version") && !errorModel.status.contains("Sign in"))
errorModel.nativeReview.transport={_,complete in complete(.success(["version":1,"status":"rejected","code":"sign_in_required"]))}
errorModel.nativeReview.checkRecipient()
check("confirmed 401 is separate WebKit sign-in",errorModel.status.contains("Sign in inside this app") && errorModel.status.contains("Chrome sign-in is separate"))
errorModel.destinationChecked=true;errorModel.review="Fictional edited review"
check("editing clears old insertion authority",!errorModel.destinationChecked)

let lost=CompanionModel()
lost.fictional.destination=URL(string:"https://www.assembl.co.nz/do/widget?nativeReview=1")!
lost.review="Fictional lost-receipt note"
var commits=0
var lastCommit:[String:Any]=[:]
lost.nativeReview.transport={request,complete in
 let action=request["action"] as? String
 if action=="lookup"{complete(.success(["version":1,"status":"recipient","owner":lost.fictional.account,"label":"Account " + lost.fictional.account,"scope":"Personal","documentId":"30000000-0000-4000-8000-000000000001","generation":0,"editorRevision":0,"occupied":false]));return}
 var response=request;response.removeValue(forKey:"action");response.removeValue(forKey:"text");response.removeValue(forKey:"reservation")
 if action=="reserve"{response["status"]="reserved";response["reservation"]="40000000-0000-4000-8000-000000000001";response["expiresAt"]=Date().timeIntervalSince1970*1000+15000;complete(.success(response));return}
 if action=="commit"{commits+=1;lastCommit=response;complete(.failure(NSError(domain:"DOReviewTimeout",code:2)));return}
 if action=="receipt"{lastCommit["status"]="accepted";lastCommit["committedEditorRevision"]=1;complete(.success(lastCommit));return}
 complete(.success(["version":1,"status":"pending"]))
}
lost.nativeReview.checkRecipient();lost.addToDO()
check("lost receipt is unknown",lost.nativeReview.addLabel=="Check editor receipt" && !lost.nativeReview.accepted && commits==1)
lost.addToDO()
check("receipt lookup recovers without resending text",lost.nativeReview.accepted && commits==1)
lost.nativeReview.navigate();lost.addToDO()
check("new document cannot replay same review",lost.nativeReview.blocked && commits==1)

let result: [String:Any] = ["passedChecks":checks,"knownReleaseBlockers":[],"wrongAccountBlocked":true,"realClipboardRead":false,"otherAppSelectionRead":false,"providerCalls":0,"receiverRenderProof":"separate actual React receiver browser tests"]
let data = try! JSONSerialization.data(withJSONObject:result,options:[.prettyPrinted,.sortedKeys])
try! data.write(to:URL(fileURLWithPath:"output/widget-fixture/results.json"))
print(String(data:data,encoding:.utf8)!)
exit(0)
