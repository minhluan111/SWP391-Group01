import { CheckCircle2 } from 'lucide-react';

export default function Pricing() {
  const plans = [
    {
      name: 'Xe Máy',
      price: '5,000đ',
      period: '/ 4 giờ',
      features: ['Gửi xe qua đêm: 15,000đ/đêm', 'Thẻ tháng: 150,000đ/tháng', 'Mái che 100%', 'Bảo vệ 24/7', 'Camera an ninh'],
      recommended: false
    },
    {
      name: 'Ô tô (4-7 chỗ)',
      price: '30,000đ',
      period: '/ giờ',
      features: ['Gửi xe qua đêm: 150,000đ/đêm', 'Thẻ tháng: 2,000,000đ/tháng', 'Khu vực ưu tiên', 'Bảo vệ 24/7', 'Hỗ trợ đỗ xe'],
      recommended: true
    }
  ];

  return (
    <div className="bg-gray-50 min-h-screen py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-dark mb-4">Bảng giá dịch vụ</h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto">Mức giá minh bạch, hợp lý cho mọi loại phương tiện. Chọn phương thức thanh toán phù hợp với bạn.</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan, idx) => (
            <div key={idx} className={`bg-white rounded-2xl p-8 border ${plan.recommended ? 'border-primary-500 ring-4 ring-primary-50' : 'border-gray-200'} shadow-lg relative`}>
              {plan.recommended && (
                <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary-500 text-white px-4 py-1 rounded-full text-sm font-semibold tracking-wide">
                  PHỔ BIẾN NHẤT
                </span>
              )}
              <h3 className="text-2xl font-bold text-dark mb-4 text-center">{plan.name}</h3>
              <div className="flex items-end justify-center gap-1 mb-8">
                <span className="text-4xl font-bold text-primary-600">{plan.price}</span>
                <span className="text-gray-500 mb-1">{plan.period}</span>
              </div>
              <ul className="space-y-4 mb-8">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-600">
                    <CheckCircle2 className="w-5 h-5 text-primary-500 flex-shrink-0" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <button className={`w-full py-3 rounded-lg font-medium transition-colors ${plan.recommended ? 'bg-primary-600 text-white hover:bg-primary-700' : 'bg-gray-100 text-dark hover:bg-gray-200'}`}>
                Xem chi tiết
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
