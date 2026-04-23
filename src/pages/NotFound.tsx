import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Button } from 'antd';
import { HomeOutlined, ArrowLeftOutlined } from '@ant-design/icons';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
      <div className="relative mb-8 group">
        {/* Decorative background number */}
        <h1 className="text-[150px] md:text-[220px] font-black text-gray-100/60 leading-none select-none transition-all duration-500 group-hover:text-[#5b4ce8]/5">
          404
        </h1>
        
        {/* Main content overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center mt-4">
          <div className="bg-white/40 backdrop-blur-sm p-8 rounded-3xl border border-white/50 shadow-xl flex flex-col items-center">
            <div className="w-20 h-20 bg-gradient-to-tr from-[#5b4ce8] to-[#8b80f0] rounded-2xl flex items-center justify-center shadow-lg mb-6 transform -rotate-6 transition-transform hover:rotate-0 duration-300">
              <span className="text-4xl text-white font-bold">?</span>
            </div>
            <h2 className="text-3xl font-extrabold text-gray-800 mb-2 tracking-tight">Oops! Lạc đường rồi</h2>
            <p className="text-gray-500 font-medium text-center max-w-[280px]">
              Trang bạn đang tìm kiếm không tồn tại hoặc đã được chuyển đi nơi khác.
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4 mt-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <Button 
          icon={<ArrowLeftOutlined />}
          size="large" 
          className="h-12 px-6 rounded-xl border-gray-200 text-gray-600 font-bold hover:text-[#5b4ce8] hover:border-[#5b4ce8] transition-all"
          onClick={() => window.history.back()}
        >
          QUAY LẠI
        </Button>
        <Button 
          type="primary" 
          icon={<HomeOutlined />}
          size="large" 
          className="bg-[#5b4ce8] border-[#5b4ce8] h-12 px-8 rounded-xl font-bold shadow-[0_8px_20px_-6px_rgba(91,76,232,0.5)] hover:scale-105 transition-all flex items-center justify-center"
          onClick={() => navigate({ to: '/' })}
        >
          TRANG CHỦ
        </Button>
      </div>

      <div className="mt-12 text-gray-400 text-xs font-medium uppercase tracking-[0.2em] opacity-50">
        Hệ thống Quản lý Nhà máy Tan Tien
      </div>
    </div>
  );
};

export default NotFound;
