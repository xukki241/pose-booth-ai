from pydantic import BaseModel, Field
from typing import List, Optional

class ShotDetail(BaseModel):
    shot_id: int
    title: str = Field(..., description="Tiêu đề cảnh quay")
    camera_angle: str = Field(..., description="Góc đặt máy camera (ví dụ: Ngang tầm mắt, Góc rộng 0.5x)")
    pose_action: str = Field(..., description="Hành động và tư thế tạo dáng")
    duration_sec: int = Field(..., description="Thời lượng khuyến nghị (giây)")
    ai_guidance_tip: str = Field(..., description="Mẹo chỉnh dáng từ AI theo thời gian thực")

class StoryboardRequest(BaseModel):
    theme: str = Field(default="Walking & Fashion", description="Chủ đề video ngắn (Walk, Streetwear, Outfit Check, Travel)")
    target_platform: str = Field(default="TikTok", description="Nền tảng xuất bản (TikTok, Instagram Reels, Shorts)")
    duration: int = Field(default=15, description="Tổng thời lượng video (15s hoặc 30s)")

class StoryboardResponse(BaseModel):
    storyboard_id: str
    title: str
    concept_summary: str
    shots: List[ShotDetail]
    recommended_music_vibe: str
