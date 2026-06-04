import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-slate-900 pt-16 pb-8 border-t border-slate-800 text-slate-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-1 md:col-span-1">
            <h3 className="text-lg font-bold text-slate-100 mb-4">Smart Parking System</h3>
            <p className="text-sm text-slate-400 mb-4">
              Giải pháp quản lý bãi đỗ xe thông minh hàng đầu Việt Nam.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold text-slate-100 mb-4">Liên kết nhanh</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/" className="hover:text-white transition-colors">Về chúng tôi</Link></li>
              <li><Link to="/pricing" className="hover:text-white transition-colors">Bảng giá dịch vụ</Link></li>
              <li><Link to="/find-slot" className="hover:text-white transition-colors">Đặt chỗ đỗ xe</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-100 mb-4">Hỗ trợ</h4>
            <ul className="space-y-2 text-sm">
              <li><Link to="/guide" className="hover:text-white transition-colors">Hướng dẫn sử dụng</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Hỗ trợ kỹ thuật</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Câu hỏi thường gặp</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-100 mb-4">Liên hệ</h4>
            <ul className="space-y-2 text-sm text-slate-300">
              <li>contact@smartparking.vn</li>
              <li>1900 6789</li>
              <li>123 Lê Lợi, Bến Thành, Q.1, TP.HCM</li>
            </ul>
          </div>
        </div>
        
        <div className="pt-8 border-t border-slate-800 flex justify-between items-center text-sm text-slate-500">
          <p>© 2026 Smart Parking System. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
