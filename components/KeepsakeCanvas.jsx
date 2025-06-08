import React, { useRef, useEffect, useMemo } from 'react';

// 预设底图（放在 public/backgrounds/ 目录下）
const BACKGROUNDS = [
  '/backgrounds/template-1.jpg',
  '/backgrounds/template-2.jpg',
  '/backgrounds/template-3.jpg',
  '/backgrounds/template-4.jpg',
  '/backgrounds/template-5.jpg',
  '/backgrounds/template-6.jpg',
  // 可继续添加更多底图
];

// 生成每张图片的随机角度（-8~8度）
function getRandomAngles(count) {
  return Array.from({ length: count }, () => (Math.random() * 16 - 8));
}

// 获取高清本地图片URL并做性能优化
function useImageUrl(img) {
  return useMemo(() => {
    if (img.url) return img.url;
    if (img.originFileObj && img.originFileObj instanceof File) {
      const objectUrl = URL.createObjectURL(img.originFileObj);
      return objectUrl;
    }
    return undefined;
  }, [img.url, img.originFileObj]);
}

const KeepsakeCanvas = ({ data, onTextChange, isEditable, canvasId }) => {
  const { selectedImages, narrative } = data;
  const narrativeRef = useRef(null);
  console.log('KeepsakeCanvas --->', selectedImages);

  // 随机选底图，每次图片变化时重新选
  const backgroundUrl = useMemo(() => {
    return BACKGROUNDS[Math.floor(Math.random() * BACKGROUNDS.length)];
  }, [selectedImages]);

  // 随机角度，图片数量变化时重新生成
  const randomAngles = useMemo(() => getRandomAngles(selectedImages.length), [selectedImages.length]);

  useEffect(() => {
    if (narrativeRef.current && narrativeRef.current.innerText !== narrative) {
      narrativeRef.current.innerText = narrative;
    }
  }, [narrative]);

  const handleTextBlur = () => {
    if (narrativeRef.current && isEditable) {
      onTextChange(narrativeRef.current.innerText);
    }
  };

  // 动态计算图片区域的行列数
  const imageCount = selectedImages.length;
  const cols = imageCount <= 2 ? imageCount : imageCount <= 4 ? 2 : 3;
  const rows = Math.ceil(imageCount / cols);

  // 记录所有objectURL，组件卸载时释放
  useEffect(() => {
    const urls = selectedImages
      .filter(img => !img.url && img.originFileObj && img.originFileObj instanceof File)
      .map(img => URL.createObjectURL(img.originFileObj));
    return () => {
      urls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [selectedImages]);

  return (
    <div
      id={canvasId}
      className="relative w-full aspect-[9/16] max-w-md mx-auto overflow-hidden  shadow-inner"
      style={{
        backgroundImage: `url(${backgroundUrl})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* 故事文本区域，顶部有间距，高度自适应 */}
      <div
        ref={narrativeRef}
        className="absolute left-1/2 -translate-x-1/2"
        style={{
          top: '4%',
          width: '90%',
          padding: '1.2rem 1.5rem',
          fontSize: '0.95rem',
          fontWeight: 700,
          color: '#222',
          background: 'rgba(255,255,255,0.25)',
          backdropFilter: 'blur(2px)',
          WebkitBackdropFilter: 'blur(2px)',
          borderRadius: '18px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
          fontFamily: 'KaiTi, STKaiti, serif',
          letterSpacing: '2px',
          textAlign: 'left',
          minHeight: '60px',
          whiteSpace: 'pre-wrap',
          zIndex: 2,
        }}
        contentEditable={isEditable}
        onBlur={handleTextBlur}
      >
        {narrative}
      </div>
      {/* 图片区域，整体下移，图片缩小 */}
      <div
        className="absolute left-0 w-full flex items-center justify-center"
        style={{
          top: '25%',
          height: '70%',
          display: 'grid',
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 1fr)`,
          gap: '2.5%',
          padding: '2% 8%',
          boxSizing: 'border-box',
        }}
      >
        {selectedImages.map((img, idx) => {
          const imgUrl = img.url || (img.originFileObj && img.originFileObj instanceof File ? URL.createObjectURL(img.originFileObj) : undefined);
          return (
            <div
              key={img.id || img.uid || idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '22px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
                background: '#fff',
                border: '2px solid #fff',
                overflow: 'hidden',
                transform: `rotate(${randomAngles[idx]}deg)`
              }}
            >
              <img
                src={imgUrl}
                alt={`user-img-${idx}`}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: '22px',
                  background: '#fff',
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default KeepsakeCanvas;