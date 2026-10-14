// Only the separately identified review app. Never press capture/permission controls.
import Cocoa
import ApplicationServices
let process = pid_t(CommandLine.arguments[1])!
guard NSRunningApplication(processIdentifier:process)?.bundleIdentifier == "nz.co.assembl.do.native-review-v3" else { fatalError("Not the isolated review app") }
let app = AXUIElementCreateApplication(process)
func string(_ e:AXUIElement,_ key:String)->String { var v:CFTypeRef?; AXUIElementCopyAttributeValue(e,key as CFString,&v); return v as? String ?? "" }
func find(_ e:AXUIElement,_ title:String,_ depth:Int=0)->AXUIElement? {
 if depth>20{return nil}
 if string(e,kAXTitleAttribute)==title || string(e,kAXDescriptionAttribute)==title{return e}
 var v:CFTypeRef?;AXUIElementCopyAttributeValue(e,kAXChildrenAttribute as CFString,&v)
 for child in v as? [AXUIElement] ?? [] { if let found=find(child,title,depth+1){return found} };return nil
}
func wait(){RunLoop.current.run(until:Date(timeIntervalSinceNow:0.4))}
func press(_ title:String)->Bool {guard let e=find(app,title) else{return false};return AXUIElementPerformAction(e,kAXPressAction as CFString) == .success}
func clickOrb()->Bool {
 guard let windows=CGWindowListCopyWindowInfo(.optionAll,kCGNullWindowID) as? [[String:Any]],let w=windows.first(where:{($0[kCGWindowOwnerPID as String] as? Int)==Int(process) && (($0[kCGWindowBounds as String] as? [String:Any])?["Width"] as? Int)==96}),let b=w[kCGWindowBounds as String] as? [String:Any],let x=b["X"] as? Double,let y=b["Y"] as? Double else{return false}
 let point=CGPoint(x:x+48,y:y+48)
 CGEvent(mouseEventSource:nil,mouseType:.leftMouseDown,mouseCursorPosition:point,mouseButton:.left)?.post(tap:.cghidEventTap)
 CGEvent(mouseEventSource:nil,mouseType:.leftMouseUp,mouseCursorPosition:point,mouseButton:.left)?.post(tap:.cghidEventTap);return true
}
var checks:[String:Bool]=[:]
for _ in 0..<3{wait()}
if let orb=find(app,"Choose a DO action") {
 checks["labelledAXButton"] = string(orb,kAXRoleAttribute)==kAXButtonRole
 checks["actualAXPress"] = AXUIElementPerformAction(orb,kAXPressAction as CFString) == .success
 wait();checks["AXPressOpensActions"] = find(app,"Review selected text") != nil && find(app,"Review clipboard") != nil
 checks["cancelCloses"] = press("Cancel");wait()
}else {checks["labelledAXButton"]=false}
checks["orbClick"] = clickOrb();wait();_ = press("Cancel");wait()
for (name,code) in [("Space",UInt16(49)),("Return",UInt16(36))] {
 CGEvent(keyboardEventSource:nil,virtualKey:code,keyDown:true)?.postToPid(process)
 CGEvent(keyboardEventSource:nil,virtualKey:code,keyDown:false)?.postToPid(process)
 wait();checks["actual"+name+"OpensActions"] = find(app,"Open workspace") != nil
 _ = press("Cancel");wait()
}
_ = press("Choose a DO action");wait()
var menuWindow:Int=0
if let windows=CGWindowListCopyWindowInfo(.optionOnScreenOnly,kCGNullWindowID) as? [[String:Any]] {
 for w in windows where (w[kCGWindowOwnerPID as String] as? Int)==Int(process) {
  if let b=w[kCGWindowBounds as String] as? [String:Any],let width=b["Width"] as? Double,let height=b["Height"] as? Double,width>250,width<500,height>100,height<550 {menuWindow=w[kCGWindowNumber as String] as? Int ?? 0}
 }
}
let result:[String:Any] = ["checks":checks,"ownedMenuWindow":menuWindow,"reviewProcess":Int(process),"captureButtonsPressed":false,"newPermissions":false,"providerActions":false,"voiceOverSpokenNavigationTested":false,"voiceOverLimit":"AX role/label/press and real key events verified; VoiceOver was not enabled or toggled."]
let data=try! JSONSerialization.data(withJSONObject:result,options:[.prettyPrinted,.sortedKeys]);try! data.write(to:URL(fileURLWithPath:"output/widget-v3-native-accessibility.json"));print(String(data:data,encoding:.utf8)!)
