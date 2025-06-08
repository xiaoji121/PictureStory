// 枚举值转换为常量对象
export const Tone = {
  CHILD: "child",
  REMINISCENT: "reminiscent",
};

export const AppStep = {
  UPLOAD: "upload",
  CREATE: "create",
};

// 常量定义
export const API_KEY_ERROR_MESSAGE = "Gemini API_KEY 环境变量未设置。请配置它以使用 AI 功能。";

export const GEMINI_MODEL_TEXT = 'gemini-2.5-flash-preview-04-17';

export const TONE_OPTIONS = [
  { value: Tone.CHILD, label: "童真喜悦风格" },
  { value: Tone.REMINISCENT, label: "温馨怀旧风格" },
];

export const MAX_IMAGES_UPLOAD = 4;
export const MAX_NARRATIVE_LENGTH = 100;

// 新增的常量
export const MAX_IMAGES = MAX_IMAGES_UPLOAD;
export const MAX_IMAGE_SIZE_MB = 50;
export const SUPPORTED_FORMATS = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];