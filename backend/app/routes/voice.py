from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime
from app.models.database import get_db, CommandHistory
from app.models.schemas import CommandRequest, ToolResponse
from app.ai.gemini_client import map_intent
from app.services import ai_service

router = APIRouter()


@router.post("/process", response_model=ToolResponse)
async def process_command(request: CommandRequest, db: Session = Depends(get_db)):
    result = await map_intent(request.command, request.context)

    tool = result.get("tool", "ai.answer_question")
    args = result.get("args", {})
    extra_data = None

    # Backend-executed AI tools
    if tool == "ai.answer_question":
        extra_data = await ai_service.answer_question(args.get("question", request.command))
    elif tool == "ai.generate_email":
        extra_data = await ai_service.generate_email(args.get("topic", ""), args.get("recipient"))
    elif tool == "ai.explain_topic":
        extra_data = await ai_service.explain_topic(args.get("topic", request.command))
    elif tool == "ai.summarize_text":
        extra_data = await ai_service.summarize_text(args.get("text", ""))
    elif tool == "weather.get":
        extra_data = await ai_service.get_weather(args.get("location", ""))

    if extra_data:
        result["extra_data"] = extra_data

    # Persist to DB
    try:
        db.add(CommandHistory(
            user_command=request.command,
            detected_intent=tool,
            tool_used=tool,
            response_text=result.get("response_text", ""),
            was_successful=True,
            created_at=datetime.utcnow(),
        ))
        db.commit()
    except Exception:
        pass

    return ToolResponse(**result)
