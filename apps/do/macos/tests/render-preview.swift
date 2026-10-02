// Offscreen source rendering only. No orb, visible window, clipboard, app read or permissions.
import Cocoa
import SwiftUI
let application=NSApplication.shared
application.setActivationPolicy(.prohibited)
let model=CompanionModel()
func render<V:View>(_ view:V,_ width:CGFloat,_ height:CGFloat,_ filename:String){
 let host=NSHostingView(rootView:view.environment(\.controlActiveState, .active))
 host.frame=NSRect(x:0,y:0,width:width,height:height)
 host.wantsLayer=true
 let window=NSWindow(contentRect:host.frame,styleMask:[.borderless],backing:.buffered,defer:false)
 window.contentView=host // Never orderFront or show this window.
 for _ in 0..<4{RunLoop.current.run(until:Date(timeIntervalSinceNow:0.15))}
 host.layoutSubtreeIfNeeded()
 guard let bitmap=host.bitmapImageRepForCachingDisplay(in:host.bounds) else{fatalError("No offscreen bitmap")}
 host.cacheDisplay(in:host.bounds,to:bitmap)
 guard let png=bitmap.representation(using:.png,properties:[:])else{fatalError("No PNG")}
 try! png.write(to:URL(fileURLWithPath:filename))
 window.orderOut(nil)
 precondition(NSApp.windows.allSatisfy { !$0.isVisible }, "Preview must stay offscreen")
}
// Actual native source views; only the web area is a fictional local fixture.
render(Workspace(model:model),820,850,"output/native-preview/workspace.png")
let reviewModel=CompanionModel()
reviewModel.review="Fictional school notice: confirm Thursday pickup with Jamie."
reviewModel.fictional.destination=URL(string:"https://www.assembl.co.nz/do/widget?nativeReview=1")!
reviewModel.reviewVisible=true
reviewModel.nativeReview.checkRecipient()
render(ContextReview(model:reviewModel),608,520,"output/native-preview/context-review.png")
print("offscreenSourceRendered=true; visibleWindows=0; privateCapture=false")
