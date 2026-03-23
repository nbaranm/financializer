export const TEMPLATES = [
  {
    id: 'indie_game',
    icon: '🎮',
    name: 'Indie Game Studio',
    description: 'Steam/Epic Games release cycle ile satış modeli',
    defaults: {
      team_size: 5,
      monthly_burn: 12000,
      launch_month: 8,
      expected_revenue: 30000,
      growth_rate: -20, // Lansman spike sonrası düşüş
    },
    revenue_streams: ['Steam Satış', 'Epic Satış', 'DLC', 'Bundle'],
    expense_categories: ['Maaşlar', 'Yazılım Lisansları', 'Sanat/Müzik Outsource', 'Pazarlama', 'Sunucu', 'Ofis'],
  },
  {
    id: 'mobile_game',
    icon: '📱',
    name: 'Mobile Game Studio',
    description: 'Free-to-play + In-App Purchase modeli',
    defaults: {
      team_size: 8,
      monthly_burn: 20000,
      launch_month: 6,
      expected_revenue: 15000,
      growth_rate: 25,
    },
    revenue_streams: ['IAP', 'Reklam Geliri', 'Battle Pass', 'Sponsorluk'],
    expense_categories: ['Maaşlar', 'UA (User Acquisition)', 'Sunucu', 'Analytics Araçları', 'Ofis'],
  },
  {
    id: 'saas',
    icon: '☁️',
    name: 'Tech SaaS Startup',
    description: 'Aylık tekrarlayan gelir (MRR) modeli',
    defaults: {
      team_size: 4,
      monthly_burn: 10000,
      launch_month: 4,
      expected_revenue: 5000,
      growth_rate: 20,
    },
    revenue_streams: ['MRR (Abonelik)', 'Yıllık Plan', 'Enterprise', 'Add-on'],
    expense_categories: ['Maaşlar', 'Altyapı/Cloud', 'SaaS Araçları', 'Pazarlama', 'Hukuk/Muhasebe'],
  },
  {
    id: 'agency',
    icon: '🏢',
    name: 'Game Dev Agency',
    description: 'Proje bazlı gelir modeli',
    defaults: {
      team_size: 10,
      monthly_burn: 35000,
      launch_month: 2,
      expected_revenue: 45000,
      growth_rate: 10,
    },
    revenue_streams: ['Proje Gelirleri', 'Retainer', 'Danışmanlık', 'Royalty'],
    expense_categories: ['Maaşlar', 'Freelancer', 'Yazılım', 'Ofis', 'Seyahat'],
  },
] as const;

export type TemplateId = (typeof TEMPLATES)[number]['id'];
