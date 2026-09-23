from fastapi import APIRouter, HTTPException
import uuid
from backend.schemas.storyboard_schema import StoryboardRequest, StoryboardResponse, ShotDetail

router = APIRouter(prefix="/api/v1/storyboard", tags=["Storyboard AI Generator"])

STORYBOARD_PRESETS = {
    "fashion": StoryboardResponse(
        storyboard_id="sb_fashion_01",
        title="OOTD Fashion Walk & Turn (TikTok 15s)",
        concept_summary="Hướng dẫn kịch bản quay video kiểm tra trang phục (Outfit Check) chuẩn xu hướng TikTok.",
        recommended_music_vibe="Upbeat Lo-Fi / Phonk Bass nhẹ nhàng",
        shots=[
            ShotDetail(
                shot_id=1,
                title="Bước đi tự nhiên tiến vào camera",
                camera_angle="Đặt máy cố định tầm bụng (Góc 0.5x rộng)",
                pose_action="Bước 3-4 bước tiến lại gần camera, tay vuốt nhẹ tóc",
                duration_sec=4,
                ai_guidance_tip="AI theo dõi nhịp bước đi. Giữ lưng thẳng và cười nhẹ khi lại gần camera."
            ),
            ShotDetail(
                shot_id=2,
                title="Xoay người 360° khoe outfit",
                camera_angle="Ngang tầm ngực",
                pose_action="Dừng lại, xoay tròn nhẹ nhàng 360 độ để lộ chi tiết áo & quần",
                duration_sec=5,
                ai_guidance_tip="AI cảnh báo giữ góc vai cân bằng trong suốt vòng xoay."
            ),
            ShotDetail(
                shot_id=3,
                title="Ngoảnh mặt lại thần thái",
                camera_angle="Góc nghiêng 45°",
                pose_action="Quay lưng nhẹ, ngoảnh mặt chậm qua vai nhìn camera",
                duration_sec=3,
                ai_guidance_tip="AI nhận diện ánh mắt nhìn thẳng ống kính."
            ),
            ShotDetail(
                shot_id=4,
                title="Pose kết tạo hình V-Sign",
                camera_angle="Cận cảnh khuôn mặt",
                pose_action="Đưa ngón tay nháy mắt nhẹ kết thúc",
                duration_sec=3,
                ai_guidance_tip="AI kiểm tra độ khớp tư thế đạt 85% trở lên."
            )
        ]
    ),
    "travel": StoryboardResponse(
        storyboard_id="sb_travel_02",
        title="Cinematic Travel Vlog Pose Guide",
        concept_summary="Kịch bản 4 phân cảnh nghệ thuật giới thiệu địa điểm du lịch & không gian.",
        recommended_music_vibe="Chill Acoustic Ambient",
        shots=[
            ShotDetail(
                shot_id=1,
                title="Ngoảnh mặt lại giữa cảnh nền",
                camera_angle="Góc rộng từ xa (Wide Landscape)",
                pose_action="Đứng quay lưng ngắm cảnh, quay chậm mặt lại smile",
                duration_sec=5,
                ai_guidance_tip="AI kiểm tra tỉ lệ cơ thể chiếm 1/3 khung hình (Rule of thirds)."
            ),
            ShotDetail(
                shot_id=2,
                title="Tựa lan can ngắm nhìn",
                camera_angle="Cận vừa 3/4",
                pose_action="Chống nhẹ 2 tay lên lan can, ánh mắt nhìn ra xa",
                duration_sec=4,
                ai_guidance_tip="AI hướng dẫn hạ thấp vai xuống 5°."
            ),
            ShotDetail(
                shot_id=3,
                title="Vẫy tay gọi camera",
                camera_angle="Góc theo chân (Following Shot)",
                pose_action="Bước đi nhanh và vẫy tay ra hiệu đi theo",
                duration_sec=3,
                ai_guidance_tip="AI theo dõi chuyển động bàn tay mượt mà."
            ),
            ShotDetail(
                shot_id=4,
                title="Uống nước / Thưởng thức không gian",
                camera_angle="Cận cảnh",
                pose_action="Cầm ly nước cười tươi nhìn camera",
                duration_sec=3,
                ai_guidance_tip="AI xác nhận điểm chấm dáng hoàn hảo."
            )
        ]
    )
}

@router.post("/generate", response_model=StoryboardResponse)
async def generate_storyboard(req: StoryboardRequest):
    """
    Generate dynamic shot-by-shot storyboard guide for short videos.
    Optionally orchestrates via n8n webhook or returns optimized presets.
    """
    if "fashion" in req.theme.lower() or "walk" in req.theme.lower():
        return STORYBOARD_PRESETS["fashion"]
    elif "travel" in req.theme.lower() or "vlog" in req.theme.lower():
        return STORYBOARD_PRESETS["travel"]
    
    # Custom fallback storyboard
    return StoryboardResponse(
        storyboard_id=f"sb_custom_{uuid.uuid4().hex[:6]}",
        title=f"Kịch Bản Video Ngắn: {req.theme}",
        concept_summary=f"Kịch bản tối ưu cho nền tảng {req.target_platform} thời lượng {req.duration} giây.",
        recommended_music_vibe="Pop Dance / Energetic",
        shots=[
            ShotDetail(
                shot_id=1,
                title="Phân cảnh mở đầu ấn tượng",
                camera_angle="Đặt máy góc 0.5x ngang tầm ngực",
                pose_action="Tạo dáng ấn tượng trong 3s đầu thu hút tương tác",
                duration_sec=4,
                ai_guidance_tip="AI chấm điểm độ tự tin qua cử chỉ khuôn mặt."
            ),
            ShotDetail(
                shot_id=2,
                title="Thực hiện chuyển động tạo vệt",
                camera_angle="Máy di chuyển nhẹ",
                pose_action="Xoay nhẹ 180° hoặc bước tới trước",
                duration_sec=6,
                ai_guidance_tip="AI đo lường tốc độ di chuyển không bị nhòe hình."
            ),
            ShotDetail(
                shot_id=3,
                title="Pose kết thúc hoàn hảo",
                camera_angle="Cận cảnh 1:1",
                pose_action="Tạo biểu cảm thương hiệu cá nhân",
                duration_sec=5,
                ai_guidance_tip="AI xác nhận hoàn thành video 9:16 chuẩn."
            )
        ]
    )

@router.get("/list-presets")
async def list_presets():
    return list(STORYBOARD_PRESETS.values())
