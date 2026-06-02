import { Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '../services/api';
import { motion } from 'framer-motion';

interface PricingRule {
  id: number;
  vehicle_type: string;
  pricing_period: string;
  hourly_rate: number;
}

export default function Pricing() {
  const [pricingRules, setPricingRules] = useState<PricingRule[]>([]);

  useEffect(() => {
    fetchPricing();
  }, []);

  const fetchPricing = async () => {
    try {
      const response = await api.get('/pricing');
      if (response.data.success) {
        setPricingRules(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching pricing:', error);
    }
  };

  const getRate = (type: string, period: string) => {
    const rule = pricingRules.find(r => r.vehicle_type === type && r.pricing_period === period);
    if (!rule) return '---';
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(rule.hourly_rate);
  };

  return (
    <div className="bg-slate-50 py-20 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-100 rounded-full blur-3xl opacity-50 animate-float"></div>
        <div className="absolute top-40 -left-20 w-72 h-72 bg-indigo-100 rounded-full blur-3xl opacity-50 animate-float-delayed"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-dark mb-6">Bảng Giá Dịch Vụ</h1>
          <p className="text-xl text-gray-600">
            Minh bạch, rõ ràng và nhiều ưu đãi cho khách hàng đăng ký thành viên.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Motorbike */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="glass-card rounded-3xl overflow-hidden group"
          >
            <div className="p-10 border-b border-gray-100 bg-white/50">
              <h2 className="text-3xl font-bold text-dark mb-3">Xe Máy</h2>
              <p className="text-gray-500 mb-8">Dành cho tất cả các loại xe máy 2 bánh.</p>
              <div className="flex items-baseline text-dark">
                <span className="text-5xl font-extrabold tracking-tight">{pricingRules.length > 0 ? getRate('motorbike', 'weekday_day') : '5.000đ'}</span>
                <span className="ml-2 text-xl font-medium text-gray-500">/ giờ</span>
              </div>
            </div>
            <div className="p-10 bg-gray-50/50 backdrop-blur-md">
              <ul className="space-y-5">
                <li className="flex items-start">
                  <div className="flex-shrink-0 bg-green-100 p-1 rounded-full group-hover:scale-110 transition-transform">
                    <Check className="h-5 w-5 text-green-600" />
                  </div>
                  <p className="ml-4 text-lg text-gray-700">Giá ban ngày (06:00 - 18:00): <span className="font-bold text-dark">{getRate('motorbike', 'weekday_day')}</span></p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 bg-green-100 p-1 rounded-full group-hover:scale-110 transition-transform">
                    <Check className="h-5 w-5 text-green-600" />
                  </div>
                  <p className="ml-4 text-lg text-gray-700">Giá ban đêm (18:00 - 06:00): <span className="font-bold text-dark">{getRate('motorbike', 'weekday_night')}</span></p>
                </li>
              </ul>
            </div>
          </motion.div>

          {/* Car */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-dark rounded-3xl shadow-2xl overflow-hidden relative transform md:-translate-y-4 hover:-translate-y-6 transition-all duration-500"
          >
            <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-primary-400 to-indigo-500"></div>
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary-500 rounded-full blur-3xl opacity-20"></div>
            
            <div className="absolute top-6 right-6 bg-gradient-to-r from-primary-500 to-indigo-500 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-lg">
              Phổ biến
            </div>
            <div className="p-10 border-b border-gray-800 relative z-10">
              <h2 className="text-3xl font-bold text-white mb-3">Ô tô</h2>
              <p className="text-gray-400 mb-8">Dành cho xe ô tô từ 4 đến 7 chỗ.</p>
              <div className="flex items-baseline text-white">
                <span className="text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300">{pricingRules.length > 0 ? getRate('car', 'weekday_day') : '20.000đ'}</span>
                <span className="ml-2 text-xl font-medium text-gray-400">/ giờ</span>
              </div>
            </div>
            <div className="p-10 relative z-10">
              <ul className="space-y-5">
                <li className="flex items-start">
                  <div className="flex-shrink-0 bg-primary-500/20 p-1 rounded-full">
                    <Check className="h-5 w-5 text-primary-400" />
                  </div>
                  <p className="ml-4 text-lg text-gray-300">Giá ban ngày (06:00 - 18:00): <span className="text-white font-bold">{getRate('car', 'weekday_day')}</span></p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 bg-primary-500/20 p-1 rounded-full">
                    <Check className="h-5 w-5 text-primary-400" />
                  </div>
                  <p className="ml-4 text-lg text-gray-300">Giá ban đêm (18:00 - 06:00): <span className="text-white font-bold">{getRate('car', 'weekday_night')}</span></p>
                </li>
                <li className="flex items-start mt-8 p-5 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                  <div className="flex-shrink-0 mt-1">
                    <span className="flex h-6 w-6 rounded-full bg-primary-500 items-center justify-center text-white text-xs font-bold pulse-glow">i</span>
                  </div>
                  <p className="ml-4 text-sm text-gray-300 leading-relaxed">
                    * Đăng ký thẻ thành viên tháng để nhận mức giá ưu đãi lên đến 30% và đảm bảo luôn có chỗ đậu ưu tiên.
                  </p>
                </li>
              </ul>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
