from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import datetime


class CommandRequest(BaseModel):
    command: str
    context: Optional[str] = None


class ToolResponse(BaseModel):
    tool: str
    args: Dict[str, Any] = {}
    response_text: str
    response_mode: str = "short"
    requires_confirmation: bool = False
    extra_data: Optional[str] = None


class CommandHistoryItem(BaseModel):
    id: int
    user_command: str
    detected_intent: Optional[str] = None
    tool_used: Optional[str] = None
    response_text: Optional[str] = None
    was_successful: bool
    created_at: datetime

    class Config:
        from_attributes = True


class NoteCreate(BaseModel):
    title: str
    content: Optional[str] = ""


class NoteItem(BaseModel):
    id: int
    title: str
    content: str
    created_at: datetime

    class Config:
        from_attributes = True
