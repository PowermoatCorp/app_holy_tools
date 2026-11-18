import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  GetConfig,
  SaveConfig,
  RunManualBackup,
  ListBackups,
  RestoreBackup,
  DeleteBackup,
  OpenBackupDir,
} from '../../wailsjs/go/main/App';

function GeneralSettingsPage() {
  const { t, i18n } = useTranslation();
  const [config, setConfig] = useState(null);
  const [backupFiles, setBackupFiles] = useState([]);
  const [status, setStatus] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);

  const loadConfig = async () => {
    try {
      const result = await GetConfig();
      const nextConfig = result || {
        application: { language: 'zh-TW', theme: 'light' },
        backup: { enabled: true, intervalMinutes: 60, folder: '', keepCount: 5, lastBackup: null }
      };
      setConfig(nextConfig);

      const savedLanguage = nextConfig.application?.language;
      if (savedLanguage === 'zh-TW' || savedLanguage === 'en') {
        i18n.changeLanguage(savedLanguage);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
      setStatus(t('status.loadFailed'));
    }
  };

  const loadBackups = async () => {
    try {
      const files = await ListBackups();
      setBackupFiles(files || []);
    } catch (error) {
      console.error('Failed to load backup files:', error);
      setBackupFiles([]);
    }
  };

  useEffect(() => {
    loadConfig();
    loadBackups();
  }, []);

  const updateBackupField = (field, value) => {
    setConfig((prev) => ({
      ...prev,
      backup: {
        ...prev.backup,
        [field]: value,
      },
    }));
  };

  const handleChooseFolder = async () => {
    if (!window.showDirectoryPicker) {
      setStatus(t('status.folderPickerUnavailable'));
      return;
    }

    try {
      const directoryHandle = await window.showDirectoryPicker();
      const selectedPath = directoryHandle.name || directoryHandle.kind;
      updateBackupField('folder', selectedPath);
      setStatus(`${t('status.folderSelected')}${selectedPath}`);
    } catch (error) {
      if (error && error.name !== 'AbortError') {
        console.error('Directory picker failed:', error);
      }
      setStatus(t('status.folderNotSelected'));
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await SaveConfig(config);
      if (config.application?.language) {
        await i18n.changeLanguage(config.application.language);
      }
      setStatus(t('status.saved'));
      await loadBackups();
    } catch (error) {
      console.error('Failed to save config:', error);
      setStatus(t('status.saveFailed'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleBackupNow = async () => {
    try {
      setIsBackingUp(true);
      const result = await RunManualBackup();
      setStatus(result && result.success ? `${t('status.backupSuccess')}${result.filePath}` : `${t('status.backupFailed')}${result?.message || t('status.unknownError')}`);
      const nextConfig = await GetConfig();
      setConfig(nextConfig);
      await loadBackups();
    } catch (error) {
      console.error('Failed to run backup:', error);
      setStatus(t('status.backupFailedAction'));
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleRestore = async (fileName) => {
    const confirmed = window.confirm(t('confirm.restore', { fileName }));
    if (!confirmed) return;

    try {
      await RestoreBackup(fileName);
      const nextConfig = await GetConfig();
      setConfig(nextConfig);
      setStatus(t('status.restored', { fileName }));
    } catch (error) {
      console.error('Failed to restore backup:', error);
      setStatus(t('status.restoreFailed'));
    }
  };

  const handleDelete = async (fileName) => {
    const confirmed = window.confirm(t('confirm.delete', { fileName }));
    if (!confirmed) return;

    try {
      await DeleteBackup(fileName);
      await loadBackups();
      setStatus(t('status.deleted', { fileName }));
    } catch (error) {
      console.error('Failed to delete backup:', error);
      setStatus(t('status.deleteFailed'));
    }
  };

  const handleOpenFolder = async () => {
    try {
      const folder = await OpenBackupDir();
      setStatus(`${t('status.backupFolder')}${folder}`);
    } catch (error) {
      console.error('Failed to open backup dir:', error);
      setStatus(t('status.openFolderFailed'));
    }
  };

  if (!config) {
    return <div className="mx-auto max-w-4xl p-8 text-slate-600">{t('common.loading')}</div>;
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-800">{t('backup.title')}</h2>
            <p className="mt-1 text-sm text-slate-500">{t('backup.subtitle')}</p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleOpenFolder}
              className="rounded-lg bg-slate-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-500"
            >
              {t('actions.openFolder')}
            </button>
            <button
              type="button"
              onClick={handleBackupNow}
              disabled={isBackingUp}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              {isBackingUp ? t('actions.backingUp') : t('actions.backupNow')}
            </button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
            <input
              type="checkbox"
              checked={Boolean(config.backup?.enabled)}
              onChange={(e) => updateBackupField('enabled', e.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="font-medium text-slate-700">{t('backup.enable')}</span>
          </label>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">{t('backup.intervalLabel')}</label>
            <input
              type="number"
              min="5"
              value={config.backup?.intervalMinutes || 60}
              onChange={(e) => updateBackupField('intervalMinutes', Number(e.target.value))}
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2.5 outline-none transition focus:border-blue-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700">{t('backup.folderLabel')}</label>
            <div className="flex gap-2">
              <input
                type="text"
                value={config.backup?.folder || ''}
                onChange={(e) => updateBackupField('folder', e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2.5 outline-none transition focus:border-blue-500"
              />
              <button
                type="button"
                onClick={handleChooseFolder}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-blue-500 hover:text-blue-600"
              >
                {t('actions.browse')}
              </button>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">{t('backup.keepCountLabel')}</label>
            <input
              type="number"
              min="1"
              value={config.backup?.keepCount || 5}
              onChange={(e) => updateBackupField('keepCount', Number(e.target.value))}
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2.5 outline-none transition focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">{t('backup.lastBackupLabel')}</label>
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-600">
              {config.backup?.lastBackup ? new Date(config.backup.lastBackup).toLocaleString() : t('backup.noBackup')}
            </div>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between gap-4">
          <p className="text-sm text-slate-500">{status}</p>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {isSaving ? t('actions.saving') : t('actions.save')}
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-xl font-semibold text-slate-800">{t('backup.history')}</h3>
        {backupFiles.length === 0 ? (
          <p className="text-sm text-slate-500">{t('backup.historyEmpty')}</p>
        ) : (
          <div className="space-y-3">
            {backupFiles.map((item) => (
              <div key={item.name} className="flex flex-col gap-3 rounded-xl border border-slate-200 p-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="font-medium text-slate-800">{item.name}</div>
                  <div className="text-xs text-slate-500">
                    {new Date(item.createdAt).toLocaleString()} · {Math.round((item.size || 0) / 1024)} KB
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => handleRestore(item.name)}
                    className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm text-white transition hover:bg-emerald-500"
                  >
                    {t('actions.restore')}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item.name)}
                    className="rounded-md bg-red-600 px-3 py-1.5 text-sm text-white transition hover:bg-red-500"
                  >
                    {t('actions.delete')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function AdvancedSettingsPage() {
  const { t } = useTranslation();

  return (
    <div className="mx-auto max-w-4xl">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-800">{t('advanced.title')}</h2>
        <p className="mt-2 text-sm text-slate-500">{t('advanced.description')}</p>
      </div>
    </div>
  );
}

export { GeneralSettingsPage, AdvancedSettingsPage };
