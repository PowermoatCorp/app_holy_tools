import { useEffect, useState } from 'react';
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
  const [config, setConfig] = useState(null);
  const [backupFiles, setBackupFiles] = useState([]);
  const [status, setStatus] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isBackingUp, setIsBackingUp] = useState(false);

  const loadConfig = async () => {
    try {
      const result = await GetConfig();
      setConfig(result || {
        application: { language: 'zh-TW', theme: 'light' },
        backup: { enabled: true, intervalMinutes: 60, folder: '', keepCount: 5, lastBackup: null }
      });
    } catch (error) {
      console.error('Failed to load settings:', error);
      setStatus('載入設定失敗');
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
      setStatus('此環境不支援選擇資料夾，請手動輸入路徑');
      return;
    }

    try {
      const directoryHandle = await window.showDirectoryPicker();
      const selectedPath = directoryHandle.name || directoryHandle.kind;
      updateBackupField('folder', selectedPath);
      setStatus(`已選擇資料夾：${selectedPath}`);
    } catch (error) {
      if (error && error.name !== 'AbortError') {
        console.error('Directory picker failed:', error);
      }
      setStatus('未選擇資料夾');
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await SaveConfig(config);
      setStatus('設定已保存');
      await loadBackups();
    } catch (error) {
      console.error('Failed to save config:', error);
      setStatus('儲存失敗');
    } finally {
      setIsSaving(false);
    }
  };

  const handleBackupNow = async () => {
    try {
      setIsBackingUp(true);
      const result = await RunManualBackup();
      setStatus(result && result.success ? `備份成功：${result.filePath}` : `備份失敗：${result?.message || '未知錯誤'}`);
      const nextConfig = await GetConfig();
      setConfig(nextConfig);
      await loadBackups();
    } catch (error) {
      console.error('Failed to run backup:', error);
      setStatus('手動備份失敗');
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleRestore = async (fileName) => {
    const confirmed = window.confirm(`確定要從 ${fileName} 還原設定嗎？`);
    if (!confirmed) return;

    try {
      await RestoreBackup(fileName);
      const nextConfig = await GetConfig();
      setConfig(nextConfig);
      setStatus(`已從 ${fileName} 還原設定`);
    } catch (error) {
      console.error('Failed to restore backup:', error);
      setStatus('還原失敗');
    }
  };

  const handleDelete = async (fileName) => {
    const confirmed = window.confirm(`確定要刪除備份 ${fileName} 嗎？`);
    if (!confirmed) return;

    try {
      await DeleteBackup(fileName);
      await loadBackups();
      setStatus(`已刪除 ${fileName}`);
    } catch (error) {
      console.error('Failed to delete backup:', error);
      setStatus('刪除失敗');
    }
  };

  const handleOpenFolder = async () => {
    try {
      const folder = await OpenBackupDir();
      setStatus(`備份資料夾：${folder}`);
    } catch (error) {
      console.error('Failed to open backup dir:', error);
      setStatus('開啟資料夾失敗');
    }
  };

  if (!config) {
    return <div className="mx-auto max-w-4xl p-8 text-slate-600">Loading...</div>;
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-800">Backup settings</h2>
            <p className="mt-1 text-sm text-slate-500">Protect your configuration with scheduled, versioned backups.</p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleOpenFolder}
              className="rounded-lg bg-slate-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-500"
            >
              Open folder
            </button>
            <button
              type="button"
              onClick={handleBackupNow}
              disabled={isBackingUp}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:bg-blue-300"
            >
              {isBackingUp ? 'Backing up...' : 'Backup now'}
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
            <span className="font-medium text-slate-700">Enable scheduled backups</span>
          </label>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Interval (minutes)</label>
            <input
              type="number"
              min="5"
              value={config.backup?.intervalMinutes || 60}
              onChange={(e) => updateBackupField('intervalMinutes', Number(e.target.value))}
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2.5 outline-none transition focus:border-blue-500"
            />
          </div>

          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-slate-700">Backup folder</label>
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
                Browse
              </button>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Keep backup count</label>
            <input
              type="number"
              min="1"
              value={config.backup?.keepCount || 5}
              onChange={(e) => updateBackupField('keepCount', Number(e.target.value))}
              className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2.5 outline-none transition focus:border-blue-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Last backup</label>
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 text-slate-600">
              {config.backup?.lastBackup ? new Date(config.backup.lastBackup).toLocaleString() : 'No backup yet'}
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
            {isSaving ? 'Saving...' : 'Save settings'}
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-xl font-semibold text-slate-800">Backup history</h3>
        {backupFiles.length === 0 ? (
          <p className="text-sm text-slate-500">No backup history yet.</p>
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
                    Restore
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item.name)}
                    className="rounded-md bg-red-600 px-3 py-1.5 text-sm text-white transition hover:bg-red-500"
                  >
                    Delete
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
  return (
    <div className="mx-auto max-w-4xl">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-slate-800">Advanced settings</h2>
        <p className="mt-2 text-sm text-slate-500">
          This section is reserved for future operational controls, recovery policies, and system safeguards.
        </p>
      </div>
    </div>
  );
}

export { GeneralSettingsPage, AdvancedSettingsPage };
