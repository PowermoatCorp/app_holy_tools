function Sidebar({ onNavigate }) {
  const items = [
    {
      id: 'settings-general',
      label: 'General Settings',
      description: 'Backup scheduling',
    },
    {
      id: 'settings-advanced',
      label: 'Advanced',
      description: 'System options',
    },
    {
      id: 'about',
      label: 'About',
      description: 'Product info',
    },
  ];

  return (
    <div className="w-64 h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col shadow-2xl">
      <div className="p-5 border-b border-white/10">
        <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-lg font-bold shadow-lg shadow-blue-500/30">
          P
        </div>
        <h2 className="mt-4 text-2xl font-semibold tracking-tight text-white">
          PowerMoat
        </h2>
        <p className="mt-1 text-xs text-slate-300">Management Suite</p>
      </div>

      <nav className="flex-1 px-3 py-4">
        <div className="space-y-2">
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => onNavigate(item.id)}
              className="w-full rounded-xl border border-white/5 bg-white/3 px-3 py-3 text-left transition hover:border-blue-400/50 hover:bg-white/5"
            >
              <div className="font-medium text-white">{item.label}</div>
              <div className="mt-1 text-xs text-slate-400">{item.description}</div>
            </button>
          ))}
        </div>
      </nav>

      <div className="border-t border-white/10 p-4 text-xs text-slate-400">
        Ready for desktop release
      </div>
    </div>
  );
}

export default Sidebar;
