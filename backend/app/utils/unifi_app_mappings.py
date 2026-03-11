# UniFi DPI category and app ID mappings
# Based on UniFi's built-in Deep Packet Inspection classifications

UNIFI_CATEGORY_MAP: dict[int, str] = {
    0: "Instant Messaging",
    1: "P2P",
    2: "Social Network",
    3: "Streaming",
    4: "Web",
    5: "Gaming",
    6: "Productivity",
    7: "Network Protocol",
    8: "VPN & Security",
    10: "Mail",
    13: "File Transfer",
    14: "Remote Access",
    15: "Investment",
    17: "Shopping",
    18: "Voice & Video",
    20: "Database",
    23: "IoT Automation",
    24: "Operating System",
    255: "Unknown",
}

UNIFI_APP_MAP: dict[int, tuple[str, str]] = {
    # (app_name, category)
    # Streaming
    65535: ("Netflix", "streaming"),
    65534: ("YouTube", "streaming"),
    65533: ("Amazon Prime Video", "streaming"),
    65532: ("Hulu", "streaming"),
    65531: ("Twitch", "streaming"),
    65530: ("Disney+", "streaming"),
    65529: ("HBO Max", "streaming"),
    65528: ("Spotify", "music"),
    65527: ("Apple Music", "music"),
    65526: ("SoundCloud", "music"),
    65525: ("Pandora", "music"),
    65524: ("Deezer", "music"),

    # Social
    65500: ("Facebook", "social"),
    65499: ("Instagram", "social"),
    65498: ("X (Twitter)", "social"),
    65497: ("TikTok", "social"),
    65496: ("Snapchat", "social"),
    65495: ("Reddit", "social"),
    65494: ("LinkedIn", "social"),
    65493: ("Pinterest", "social"),
    65492: ("Tumblr", "social"),

    # Messaging
    65480: ("WhatsApp", "messaging"),
    65479: ("Telegram", "messaging"),
    65478: ("Discord", "messaging"),
    65477: ("Signal", "messaging"),
    65476: ("Skype", "messaging"),
    65475: ("Slack", "messaging"),
    65474: ("iMessage", "messaging"),
    65473: ("Facebook Messenger", "messaging"),
    65472: ("WeChat", "messaging"),

    # Video Conferencing
    65460: ("Zoom", "conferencing"),
    65459: ("Microsoft Teams", "conferencing"),
    65458: ("Google Meet", "conferencing"),
    65457: ("Webex", "conferencing"),
    65456: ("FaceTime", "conferencing"),

    # Productivity
    65440: ("Google Drive", "productivity"),
    65439: ("Google Docs", "productivity"),
    65438: ("Microsoft 365", "productivity"),
    65437: ("Dropbox", "productivity"),
    65436: ("OneDrive", "productivity"),
    65435: ("iCloud", "cloud"),
    65434: ("Notion", "productivity"),
    65433: ("Trello", "productivity"),

    # Gaming
    65420: ("Steam", "gaming"),
    65419: ("Xbox Live", "gaming"),
    65418: ("PlayStation Network", "gaming"),
    65417: ("Epic Games", "gaming"),
    65416: ("Nintendo Online", "gaming"),
    65415: ("Roblox", "gaming"),
    65414: ("Minecraft", "gaming"),
    65413: ("Fortnite", "gaming"),

    # Shopping
    65400: ("Amazon", "shopping"),
    65399: ("eBay", "shopping"),
    65398: ("Shopify", "shopping"),

    # Developer
    65380: ("GitHub", "developer"),
    65379: ("GitLab", "developer"),
    65378: ("Stack Overflow", "developer"),

    # Cloud
    65360: ("AWS", "cloud"),
    65359: ("Microsoft Azure", "cloud"),
    65358: ("Google Cloud", "cloud"),
    65357: ("Cloudflare", "cloud"),

    # Other common
    65340: ("Apple Services", "cloud"),
    65339: ("Google", "productivity"),
    65338: ("Outlook", "productivity"),
    65337: ("Yahoo", "web"),
    65336: ("Wikipedia", "web"),
    65335: ("Bing", "web"),
}

# Map UniFi DPI category IDs to our app categories
UNIFI_CAT_TO_CATEGORY: dict[int, str] = {
    0: "messaging",
    1: "p2p",
    2: "social",
    3: "streaming",
    4: "web",
    5: "gaming",
    6: "productivity",
    7: "network",
    8: "vpn",
    10: "mail",
    13: "file_transfer",
    14: "remote_access",
    17: "shopping",
    18: "conferencing",
    24: "system",
}


def get_app_name_from_unifi(cat_id: int, app_id: int) -> tuple[str, str] | None:
    """Get (app_name, category) from UniFi DPI IDs.

    Falls back to category-based naming if specific app is unknown.
    """
    if app_id in UNIFI_APP_MAP:
        return UNIFI_APP_MAP[app_id]

    category_name = UNIFI_CATEGORY_MAP.get(cat_id)
    if category_name:
        our_cat = UNIFI_CAT_TO_CATEGORY.get(cat_id, "other")
        return (category_name, our_cat)

    return None
