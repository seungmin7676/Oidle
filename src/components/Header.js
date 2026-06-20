export default function Header({ status }) {
  const running = status === 'CPU RUNNING';

  return (
    <header className="app-header">
      <div className="header-inner">
        <div className="logo">
          <div className="logo-icon-wrap">
            <svg className="logo-svg" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="18" cy="18" r="16" stroke="url(#logo-grad)" strokeWidth="2.5" />
              <path d="M18 10v8l5 3" stroke="url(#logo-grad)" strokeWidth="2.5" strokeLinecap="round" />
              <defs>
                <linearGradient id="logo-grad" x1="2" y1="2" x2="34" y2="34" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#6366f1" />
                  <stop offset="0.5" stopColor="#8b5cf6" />
                  <stop offset="1" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="logo-text">
            <h1>Oidle</h1>
            <p>Process Scheduling Visualizer</p>
          </div>
        </div>

        <span className={`badge ${running ? 'badge--running' : 'badge--idle'}`}>{status}</span>
      </div>
    </header>
  );
}
