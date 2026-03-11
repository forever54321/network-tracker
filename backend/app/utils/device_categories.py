# UniFi dev_cat ID to human-readable device category mapping
# Based on UniFi fingerprinting database

UNIFI_DEV_CAT: dict[int, str] = {
    1: "Smart Home",
    2: "Laptop",
    3: "Desktop",
    4: "Tablet",
    5: "Phone",
    6: "Game Console",
    7: "IoT",
    8: "Printer",
    9: "Camera",
    10: "Smart Speaker",
    11: "Smart Home",
    12: "Streaming Device",
    13: "Wearable",
    14: "Smart Home",
    15: "IoT",
    16: "Network Equipment",
    17: "Computer",
    18: "NAS / Server",
    19: "Smart Home",
    20: "Smart Speaker",
    21: "Streaming Device",
    22: "VoIP Phone",
    23: "Smart Home",
    24: "Smart Home",
    25: "Network Equipment",
    26: "Smart Home",
    27: "Smart Home",
    28: "Appliance",
    29: "Appliance",
    30: "EV Charger",
    31: "Wearable",
    44: "Phone",
    47: "Media Player",
    49: "Server",
    51: "Media Player",
    53: "IoT",
    56: "Media Server",
    61: "Smart TV",
    73: "Smart Home",
    182: "Server",
    199: "Smart Home",
    16861: "IoT",
    16879: "Smart Home",
    73235: "IoT",
}

# Vendor-based fallback categorization
VENDOR_CATEGORY: dict[str, str] = {
    "apple": "Apple Device",
    "samsung": "Phone",
    "google": "Smart Speaker",
    "amazon": "Smart Speaker",
    "sonos": "Smart Speaker",
    "roku": "Streaming Device",
    "ubiquiti": "Network Equipment",
    "synology": "NAS / Server",
    "raspberry": "Server",
    "dell": "Computer",
    "lenovo": "Computer",
    "hp": "Computer",
    "microsoft": "Computer",
    "logitech": "Peripheral",
    "epson": "Printer",
    "canon": "Printer",
    "brother": "Printer",
    "ring": "Camera",
    "nest": "Smart Home",
    "ecobee": "Smart Home",
    "philips": "Smart Home",
    "tuya": "IoT",
    "texas instruments": "Smart Home",
    "lutron": "Smart Home",
    "tplink": "Smart Home",
    "espressif": "IoT",
    "lumi": "Smart Home",
    "aqara": "Smart Home",
    "chamberlain": "Smart Home",
    "proxmox": "Server",
    "tcl": "Smart TV",
    "lg": "Smart TV",
    "sony": "Media Player",
    "xbox": "Game Console",
    "playstation": "Game Console",
    "nintendo": "Game Console",
    "tesla": "EV Charger",
    "murata": "IoT",
    "orbit": "IoT",
}

# Broader groupings for the dashboard
CATEGORY_GROUPS: dict[str, str] = {
    "Phone": "phones",
    "Apple Device": "phones",
    "Tablet": "phones",
    "Wearable": "phones",
    "Laptop": "computers",
    "Desktop": "computers",
    "Computer": "computers",
    "Server": "servers",
    "NAS / Server": "servers",
    "Media Server": "servers",
    "Smart TV": "entertainment",
    "Streaming Device": "entertainment",
    "Media Player": "entertainment",
    "Game Console": "entertainment",
    "Smart Speaker": "entertainment",
    "Smart Home": "smart_home",
    "IoT": "smart_home",
    "Peripheral": "smart_home",
    "EV Charger": "smart_home",
    "Appliance": "smart_home",
    "Camera": "security",
    "Printer": "other",
    "VoIP Phone": "other",
    "Network Equipment": "network",
}

GROUP_LABELS: dict[str, str] = {
    "phones": "Phones & Tablets",
    "computers": "Computers",
    "servers": "Servers & NAS",
    "entertainment": "Entertainment",
    "smart_home": "Smart Home & IoT",
    "security": "Cameras & Security",
    "network": "Network Equipment",
    "other": "Other Devices",
}


def get_device_category(dev_cat: int | None, vendor: str | None) -> str:
    """Get a human-readable device category."""
    if dev_cat is not None and dev_cat in UNIFI_DEV_CAT:
        return UNIFI_DEV_CAT[dev_cat]

    if vendor:
        v = vendor.lower()
        for keyword, cat in VENDOR_CATEGORY.items():
            if keyword in v:
                return cat

    return "Unknown"


def get_device_group(category: str) -> str:
    """Get the broad group for a device category."""
    return CATEGORY_GROUPS.get(category, "other")


def get_group_label(group: str) -> str:
    """Get the display label for a group."""
    return GROUP_LABELS.get(group, "Other")
