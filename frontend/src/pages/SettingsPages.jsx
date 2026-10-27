import { useEffect, useState } from 'react';
import { GetConfig, SaveConfig, RunManualBackup } from '../../wailsjs/go/main/App';

function GeneralSettingsPage() {
  const [config, setConfig] = useState(null);
  const [status, setStatus] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const result = await GetConfig();
        setConfig(result || {
          application: { language: 'zh-TW', theme: 'light' },
          backup: { enabled: true, intervalMinutes: 60, folder: '', keepCount: 5, lastBackup: null }
        });
      } catch (error) {
        console.error('Failed to load settings:', error);
      }
    };

    load();
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

  const handleSave = async () => {
    try {
      await SaveConfig(config);
      setStatus('設定已保存');
    } catch (error) {
      console.error('Failed to save config:', error);
      setStatus('儲存失敗');
    }
  };

  const handleBackupNow = async () => {
    try {
      const result = await RunManualBackup();
      setStatus(result && result.success ? `備份成功：${result.filePath}` : `備份失敗：${result?.message || '未知錯誤'}`);
      const nextConfig = await GetConfig();
      setConfig(nextConfig);
    } catch (error) {
      console.error('Failed to run backup:', error);
      setStatus('手動備份失敗');
    }
  };

  if (!config) {
    return <div className="max-w-4xl mx-auto">Loading...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-slate-800">自動備份</h2>
          <button
            type="button"
            onClick={handleBackupNow}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            立即備份
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex items-center gap-3 rounded-lg border border-slate-200 p-3">
            <input
              type="checkbox"
              checked={Boolean(config.backup?.enabled)}
              onChange={(e) => updateBackupField('enabled', e.target.checked)}
            />
            <span>啟用定時備份</span>
          </label>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">備份間隔（分鐘）</label>
            <input
              type="number"
              min="5"
              value={config.backup?.intervalMinutes || 60}
              onChange={(e) => updateBackupField('intervalMinutes', Number(e.target.value))}
              className="w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 outline-none focus:border-blue-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700">備份資料夾</label>
            <input
              type="text"
              value={config.backup?.folder || ''}
              onChange={(e) => updateBackupField('folder', e.target.value)}
              className="w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">保留備份數量</label>
            <input
              type="number"
              min="1"
              value={config.backup?.keepCount || 5}
              onChange={(e) => updateBackupField('keepCount', Number(e.target.value))}
              className="w-full rounded-md border border-slate-300 bg-slate-50 px-3 py-2 outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">最後備份時間</label>
            <div className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-slate-600">
              {config.backup?.lastBackup ? new Date(config.backup.lastBackup).toLocaleString() : '尚未備份'}
            </div>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between gap-4">
          <p className="text-sm text-slate-500">{status}</p>
          <button
            type="button"
            onClick={handleSave}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
          >
            儲存設定
          </button>
        </div>
      </section>
    </div>
  );
}

function AdvancedSettingsPage() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-800">進階設定</h2>
        <p className="mt-2 text-sm text-slate-500">進一步的系統與保護選項將在這裡擴充。</p>
      </div>
    </div>
  );
}

export { GeneralSettingsPage, AdvancedSettingsPage };
