import { Check } from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '../services/api';

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
    <div className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl font-bold text-dark mb-4">Bảng Giá Dịch Vụ</h1>
          <p className="text-xl text-gray-600">
            Minh bạch, rõ ràng và nhiều ưu đãi cho khách hàng đăng ký thành viên.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Motorbike */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-8 border-b border-gray-100">
              <h2 className="text-2xl font-bold text-dark mb-2">Xe Máy</h2>
              <p className="text-gray-500 mb-6">Dành cho tất cả các loại xe máy 2 bánh.</p>
              <div className="flex items-baseline text-dark">
                <span className="text-5xl font-extrabold tracking-tight">{pricingRules.length > 0 ? getRate('motorbike', 'weekday_day') : '5.000đ'}</span>
                <span className="ml-2 text-xl font-medium text-gray-500">/ block</span>
              </div>
            </div>
            <div className="p-8 bg-gray-50/50">
              <ul className="space-y-4">
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <Check className="h-6 w-6 text-green-500" />
                  </div>
                  <p className="ml-3 text-base text-gray-700">Giá ban ngày (06:00 - 18:00): <span className="font-semibold">{getRate('motorbike', 'weekday_day')}</span></p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <Check className="h-6 w-6 text-green-500" />
                  </div>
                  <p className="ml-3 text-base text-gray-700">Giá ban đêm (18:00 - 06:00): <span className="font-semibold">{getRate('motorbike', 'weekday_night')}</span></p>
                </li>
              </ul>
            </div>
          </div>

          {/* Car */}
          <div className="bg-dark rounded-2xl shadow-xl overflow-hidden relative transform md:-translate-y-4">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary-400 to-primary-600"></div>
            <div className="absolute top-5 right-5 bg-primary-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
              Phổ biến
            </div>
            <div className="p-8 border-b border-gray-800">
              <h2 className="text-2xl font-bold text-white mb-2">Ô tô</h2>
              <p className="text-gray-400 mb-6">Dành cho xe ô tô từ 4 đến 7 chỗ.</p>
              <div className="flex items-baseline text-white">
                <span className="text-5xl font-extrabold tracking-tight">{pricingRules.length > 0 ? getRate('car', 'weekday_day') : '20.000đ'}</span>
                <span className="ml-2 text-xl font-medium text-gray-400">/ block</span>
              </div>
            </div>
            <div className="p-8">
              <ul className="space-y-4">
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <Check className="h-6 w-6 text-primary-400" />
                  </div>
                  <p className="ml-3 text-base text-gray-300">Giá ban ngày (06:00 - 18:00): <span className="text-white font-semibold">{getRate('car', 'weekday_day')}</span></p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <Check className="h-6 w-6 text-primary-400" />
                  </div>
                  <p className="ml-3 text-base text-gray-300">Giá ban đêm (18:00 - 06:00): <span className="text-white font-semibold">{getRate('car', 'weekday_night')}</span></p>
                </li>
                <li className="flex items-start mt-6 p-4 bg-white/10 rounded-lg">
                  <div className="flex-shrink-0 mt-1">
                    <span className="flex h-5 w-5 rounded-full bg-primary-500 items-center justify-center text-white text-xs">i</span>
                  </div>
                  <p className="ml-3 text-sm text-gray-200">
                    * Đăng ký thẻ thành viên tháng để nhận mức giá ưu đãi lên đến 30% và đảm bảo luôn có chỗ đậu.
                  </p>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
