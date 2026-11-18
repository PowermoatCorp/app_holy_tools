import { useTranslation } from 'react-i18next';

function Sidebar({ onNavigate, currentPage }) {
  const { t } = useTranslation();

  const items = [
    {
      id: 'settings-general',
      label: t('nav.general'),
      description: t('nav.generalDescription'),
    },
    {
      id: 'settings-advanced',
      label: t('nav.advanced'),
      description: t('nav.advancedDescription'),
    },
    {
      id: 'about',
      label: t('nav.about'),
      description: t('nav.aboutDescription'),
    },
  ];

  return (
    <div className="w-64 h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col shadow-2xl">
      <div className="h-28 px-5 py-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-lg font-bold shadow-lg shadow-blue-500/30">
            P
          </div>
          <div className="min-w-0">
            <h2 className="text-xl font-semibold tracking-tight text-white">
              PowerMoat
            </h2>
            <p className="mt-1 text-xs text-slate-300">
              {t('nav.productName')}
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4">
        <div className="space-y-2">
          {items.map((item) => {
            const active = currentPage === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onNavigate(item.id)}
                className={`h-[72px] w-full rounded-xl border px-3 py-3 text-left transition ${
                  active
                    ? 'border-blue-400/60 bg-white/10 shadow-inner'
                    : 'border-white/5 bg-white/[0.03] hover:border-blue-400/40 hover:bg-white/5'
                }`}
              >
                <div className="truncate font-medium text-white">{item.label}</div>
                <div className="mt-1 truncate text-xs text-slate-400">
                  {item.description}
                </div>
              </button>
            );
          })}
        </div>
      </nav>

      <div className="border-t border-white/10 px-4 py-3 text-xs text-slate-400">
        {t('nav.ready')}
      </div>
    </div>
  );
}

export default Sidebar;
