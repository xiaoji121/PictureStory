import React, { useState } from 'react';
import { Upload, message } from 'antd';
import { SUPPORTED_FORMATS, MAX_IMAGE_SIZE_MB, MAX_IMAGES } from '../constants';

const ImageUploader = ({ onImagesUploaded }) => {
  const [fileList, setFileList] = useState([]);
  const [messageApi, contextHolder] = message.useMessage();

  // 校验类型和大小
  const beforeUpload = (file) => {
    if (!SUPPORTED_FORMATS.includes(file.type)) {
      messageApi.open({
        type: 'error',
        content: '只支持 JPEG, PNG, GIF 和 WebP 格式的图片！',
      });
      return Upload.LIST_IGNORE;
    }
    if (file.size / 1024 / 1024 > MAX_IMAGE_SIZE_MB) {
      messageApi.open({
        type: 'error',
        content: `图片大小不能超过 ${MAX_IMAGE_SIZE_MB}MB！`,
      });
      return Upload.LIST_IGNORE;
    }
    if (fileList.length >= MAX_IMAGES) {
      messageApi.open({
        type: 'warning',
        content: `最多只能上传 ${MAX_IMAGES} 张图片！`,
      });
      return Upload.LIST_IGNORE;
    }
    return true;
  };

  const handleChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
    onImagesUploaded(newFileList);
  };

  return (
    <>
      <div className="w-full">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-neutral-800 mb-2 flex items-center">
            <span className="text-3xl mr-3">📸</span>
            上传您的珍贵照片
          </h2>
          <p className="text-neutral-600">最多可上传 {MAX_IMAGES} 张照片，我将为您创作独特的图文故事</p>
        </div>
        {contextHolder}
        <Upload.Dragger
          name="images"
          className="custom-uploader"
          listType="picture-card"
          fileList={fileList}
          onChange={handleChange}
          beforeUpload={beforeUpload}
          multiple
          maxCount={MAX_IMAGES}
          accept={SUPPORTED_FORMATS.join(',')}
          showUploadList={{ showRemoveIcon: true, showPreviewIcon: false }}
          customRequest={({ onSuccess }) => { setTimeout(() => { onSuccess && onSuccess('ok'); }, 100); }}
        >
          {fileList.length < MAX_IMAGES && (
            <div className="flex flex-col items-center justify-center p-8 upload-zone cursor-pointer group">
              <svg className="w-12 h-12 text-primary-500 mb-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-lg font-medium text-neutral-800 mb-2">点击或拖拽上传图片</p>
              <p className="text-sm text-neutral-500">支持 JPEG, PNG, GIF, WebP • 最大 {MAX_IMAGE_SIZE_MB}MB</p>
            </div>
          )}
        </Upload.Dragger>
        {fileList.length > 0 && (
          <div className="mt-4 p-4 bg-primary-50/50 ">
            <p className="text-sm text-primary-700 flex items-center">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              已上传 {fileList.length} / {MAX_IMAGES} 张图片
            </p>
          </div>
        )}
        {fileList.length >= MAX_IMAGES && (
          <style>{`
            .custom-uploader .ant-upload.ant-upload-drag {
              display: none !important;
            }
          `}</style>
        )}
      </div>
    </>
  );
};

export default ImageUploader;