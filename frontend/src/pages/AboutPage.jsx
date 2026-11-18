import { useTranslation } from 'react-i18next';

function AboutPage() {
  const { t } = useTranslation();

  const features = t('about.features', { returnObjects: true });

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-xl font-bold text-white shadow-lg shadow-blue-500/30">
            P
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-slate-800">PowerMoat</h2>
            <p className="text-sm text-slate-500">{t('about.subtitle')}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800">{t('about.overviewTitle')}</h3>
          <p className="mt-3 text-sm leading-6 text-slate-600">{t('about.overview')}</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-slate-800">{t('about.statusTitle')}</h3>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            <li>• {t('about.statusCore')}</li>
            <li>• {t('about.statusUi')}</li>
            <li>• {t('about.statusRestore')}</li>
            <li>• {t('about.statusPackaging')}</li>
          </ul>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-800">{t('about.capabilities')}</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {features.map((feature) => (
            <div key={feature} className="h-11 flex items-center rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-700">
              {feature}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default AboutPage;
