from fastapi import APIRouter

router = APIRouter()

TOOLS = [
    {"name": "browser.open_youtube",   "category": "Browser",   "description": "Search and open YouTube"},
    {"name": "browser.google_search",  "category": "Browser",   "description": "Search on Google"},
    {"name": "browser.open_website",   "category": "Browser",   "description": "Open a specific website"},
    {"name": "browser.open_new_tab",   "category": "Browser",   "description": "Open a new browser tab"},
    {"name": "system.take_screenshot", "category": "System",    "description": "Capture the screen"},
    {"name": "system.open_camera",     "category": "System",    "description": "Open Windows Camera app"},
    {"name": "system.open_app",        "category": "System",    "description": "Launch an application"},
    {"name": "system.minimize_window", "category": "System",    "description": "Minimize current window"},
    {"name": "system.maximize_window", "category": "System",    "description": "Maximize current window"},
    {"name": "system.volume_up",       "category": "System",    "description": "Increase system volume"},
    {"name": "system.volume_down",     "category": "System",    "description": "Decrease system volume"},
    {"name": "system.mute",            "category": "System",    "description": "Toggle mute"},
    {"name": "system.shutdown",        "category": "System",    "description": "Shutdown PC (needs confirm)"},
    {"name": "system.restart",         "category": "System",    "description": "Restart PC (needs confirm)"},
    {"name": "clipboard.read",         "category": "Clipboard", "description": "Read clipboard content"},
    {"name": "clipboard.clear",        "category": "Clipboard", "description": "Clear clipboard"},
    {"name": "file.open_downloads",    "category": "File",      "description": "Open Downloads folder"},
    {"name": "file.open_documents",    "category": "File",      "description": "Open Documents folder"},
    {"name": "file.open_desktop",      "category": "File",      "description": "Open Desktop folder"},
    {"name": "file.create_folder",     "category": "File",      "description": "Create a new folder"},
    {"name": "ai.answer_question",     "category": "AI",        "description": "Answer any question"},
    {"name": "ai.generate_email",      "category": "AI",        "description": "Generate an email draft"},
    {"name": "ai.explain_topic",       "category": "AI",        "description": "Explain a topic in detail"},
    {"name": "ai.summarize_text",      "category": "AI",        "description": "Summarize given text"},
    {"name": "notes.create",           "category": "Notes",     "description": "Save a new note"},
    {"name": "notes.list",             "category": "Notes",     "description": "Show all saved notes"},
    {"name": "weather.get",            "category": "Weather",   "description": "Get current weather"},
    {"name": "media.play_youtube",     "category": "Media",     "description": "Play music/video on YouTube"},
    {"name": "media.pause_media",      "category": "Media",     "description": "Pause current media"},
]


@router.get("/")
async def list_tools():
    return {"tools": TOOLS, "total": len(TOOLS)}
