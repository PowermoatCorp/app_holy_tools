import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Layout from './components/Layout';
import Sidebar from './components/Sidebar';
import { GeneralSettingsPage, AdvancedSettingsPage } from './pages/SettingsPages';
import AboutPage from './pages/AboutPage';
import { GetConfig, SaveConfig } from '../wailsjs/go/main/App';

function App() {
  const { t, i18n } = useTranslation();
  const [currentPage, setCurrentPage] = useState('settings-general');
  const [appConfig, setAppConfig] = useState(null);

  useEffect(() => {
    const initLanguage = async () => {
      try {
        const config = await GetConfig();
        setAppConfig(config);
        if (config?.application?.language) {
          i18n.changeLanguage(config.application.language);
        }
      } catch (error) {
        console.error('Failed to load language setting:', error);
      }
    };

    initLanguage();
  }, [i18n]);

  const handleLanguageChange = async (language) => {
    i18n.changeLanguage(language);

    if (!appConfig) return;

    const nextConfig = {
      ...appConfig,
      application: {
        ...appConfig.application,
        language,
      },
    };

    setAppConfig(nextConfig);

    try {
      await SaveConfig(nextConfig);
    } catch (error) {
      console.error('Failed to save language setting:', error);
    }
  };

  const languageSwitcher = (
    <label className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm">
      <span className="text-xs font-medium text-slate-500">{t('language.label')}</span>
      <select
        aria-label={t('language.label')}
        value={appConfig?.application?.language || i18n.resolvedLanguage || 'zh-TW'}
        onChange={(event) => handleLanguageChange(event.target.value)}
        className="border-0 bg-transparent text-sm font-medium text-slate-700 outline-none"
      >
        <option value="zh-TW">中文（繁體）</option>
        <option value="en">English</option>
      </select>
    </label>
  );

  const renderPage = () => {
    switch (currentPage) {
      case 'settings-general':
        return <GeneralSettingsPage />;
      case 'settings-advanced':
        return <AdvancedSettingsPage />;
      case 'about':
        return <AboutPage />;
      default:
        return <GeneralSettingsPage />;
    }
  };

  return (
    <Layout
      sidebar={<Sidebar onNavigate={setCurrentPage} currentPage={currentPage} />}
      headerRight={languageSwitcher}
    >
      {renderPage()}
    </Layout>
  );
}

export default App;
