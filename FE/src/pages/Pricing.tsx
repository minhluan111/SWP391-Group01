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
    <div className="bg-surface py-20 relative overflow-hidden text-ink min-h-screen">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-500/8 rounded-full blur-3xl animate-float"></div>
        <div className="absolute top-40 -left-20 w-72 h-72 bg-primary-500/8 rounded-full blur-3xl animate-float-delayed"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <h1 className="text-4xl md:text-5xl font-black text-ink mb-6">Bảng Giá Dịch Vụ</h1>
          <p className="text-lg text-ink-muted">
            Minh bạch, rõ ràng và được điều chỉnh trực tiếp bởi Ban quản lý bãi đỗ xe.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          
          {/* Motorbike Card */}
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-md"
          >
            <div className="p-10 border-b border-slate-200 bg-slate-50">
              <h2 className="text-3xl font-extrabold text-ink mb-3">🏍️ Xe Máy</h2>
              <p className="text-ink-muted mb-8 text-sm">Vị trí đỗ ưu tiên tại Tầng 1 bãi đỗ xe.</p>
              <div className="flex items-baseline text-ink">
                <span className="text-5xl font-black tracking-tight text-amber-500">
                  {pricingRules.length > 0 ? getRate('motorbike', 'weekday_day') : '5.000đ'}
                </span>
                <span className="ml-2 text-sm text-ink-muted font-medium">/ giờ (ngày thường)</span>
              </div>
            </div>
            <div className="p-10 space-y-6">
              <ul className="space-y-4">
                <li className="flex items-start">
                  <div className="flex-shrink-0 bg-emerald-500/10 p-1 rounded-full border border-emerald-500/20">
                    <Check className="h-4.5 w-4.5 text-emerald-500" />
                  </div>
                  <p className="ml-4 text-ink-muted text-sm">
                    Giá ban ngày (06:00 - 22:00): <strong className="text-ink font-bold">{getRate('motorbike', 'weekday_day')}</strong>
                  </p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 bg-emerald-500/10 p-1 rounded-full border border-emerald-500/20">
                    <Check className="h-4.5 w-4.5 text-emerald-500" />
                  </div>
                  <p className="ml-4 text-ink-muted text-sm">
                    Giá ban đêm (22:00 - 06:00): <strong className="text-ink font-bold">{getRate('motorbike', 'weekday_night')}</strong>
                  </p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 bg-emerald-500/10 p-1 rounded-full border border-emerald-500/20">
                    <Check className="h-4.5 w-4.5 text-emerald-500" />
                  </div>
                  <p className="ml-4 text-ink-muted text-sm">
                    Giá cuối tuần ban ngày: <strong className="text-ink font-bold">{getRate('motorbike', 'weekend_day')}</strong>
                  </p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 bg-emerald-500/10 p-1 rounded-full border border-emerald-500/20">
                    <Check className="h-4.5 w-4.5 text-emerald-500" />
                  </div>
                  <p className="ml-4 text-ink-muted text-sm">
                    Giá cuối tuần ban đêm: <strong className="text-ink font-bold">{getRate('motorbike', 'weekend_night')}</strong>
                  </p>
                </li>
              </ul>
            </div>
          </motion.div>

          {/* Car Card */}
          <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-md relative"
          >
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#003366] to-primary-500"></div>
            
            <div className="p-10 border-b border-slate-200 bg-slate-50">
              <h2 className="text-3xl font-extrabold text-ink mb-3">🚗 Ô tô</h2>
              <p className="text-ink-muted mb-8 text-sm">Vị trí đỗ rộng rãi tại Tầng 2 bãi đỗ xe.</p>
              <div className="flex items-baseline text-ink">
                <span className="text-5xl font-black tracking-tight text-primary-500">
                  {pricingRules.length > 0 ? getRate('car', 'weekday_day') : '20.000đ'}
                </span>
                <span className="ml-2 text-sm text-ink-muted font-medium">/ giờ (ngày thường)</span>
              </div>
            </div>
            <div className="p-10 space-y-6">
              <ul className="space-y-4">
                <li className="flex items-start">
                  <div className="flex-shrink-0 bg-emerald-500/10 p-1 rounded-full border border-emerald-500/20">
                    <Check className="h-4.5 w-4.5 text-emerald-500" />
                  </div>
                  <p className="ml-4 text-ink-muted text-sm">
                    Giá ban ngày (06:00 - 22:00): <strong className="text-ink font-bold">{getRate('car', 'weekday_day')}</strong>
                  </p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 bg-emerald-500/10 p-1 rounded-full border border-emerald-500/20">
                    <Check className="h-4.5 w-4.5 text-emerald-500" />
                  </div>
                  <p className="ml-4 text-ink-muted text-sm">
                    Giá ban đêm (22:00 - 06:00): <strong className="text-ink font-bold">{getRate('car', 'weekday_night')}</strong>
                  </p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 bg-emerald-500/10 p-1 rounded-full border border-emerald-500/20">
                    <Check className="h-4.5 w-4.5 text-emerald-500" />
                  </div>
                  <p className="ml-4 text-ink-muted text-sm">
                    Giá cuối tuần ban ngày: <strong className="text-ink font-bold">{getRate('car', 'weekend_day')}</strong>
                  </p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 bg-emerald-500/10 p-1 rounded-full border border-emerald-500/20">
                    <Check className="h-4.5 w-4.5 text-emerald-500" />
                  </div>
                  <p className="ml-4 text-ink-muted text-sm">
                    Giá cuối tuần ban đêm: <strong className="text-ink font-bold">{getRate('car', 'weekend_night')}</strong>
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
