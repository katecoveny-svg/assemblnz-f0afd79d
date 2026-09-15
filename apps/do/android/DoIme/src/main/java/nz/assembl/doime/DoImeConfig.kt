package nz.assembl.doime

object DoImeConfig {
    val templates = listOf(
        Triple("Watch", "price-watcher", "tell me if this changes"),
        Triple("Brief", "prepare-bid-brief", "prepare a bid brief from this text"),
        Triple("Slop-check", "clear-writing-watch", "keep my writing clear — flag AI-slop and basic grammar"),
        Triple("Mitre brief", "mitre10-sap-rfp-brief", "prepare a pursuit brief from this RFP"),
    )
}
