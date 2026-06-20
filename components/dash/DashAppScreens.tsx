import { DashDogMark } from '@/components/dash/DashDogMark';

/**
 * The consumer side of dash as a native app — onboarding, the earnings wallet,
 * and the in-app loader. Ported from the brand kit; styles live in dash-kit.css.
 */
export function DashAppScreens() {
  return (
    <div className="phones">
      {/* 1 · Onboarding */}
      <div className="screenWrap">
        <div className="phone">
          <div className="screen">
            <span className="island" />
            <div className="sb">
              <span>9:41</span>
              <span>5G · 87%</span>
            </div>
            <div className="ob">
              <span className="wm2">
                dash<i>.</i>
              </span>
              <DashDogMark className="heroIll" />
              <h2>
                Get paid
                <br />
                to <i>wait.</i>
              </h2>
              <p>Earn real cash in the seconds you already spend loading. Made in Aotearoa.</p>
              <div className="dots">
                <i className="on" />
                <i />
                <i />
              </div>
              <button type="button" className="btn-app btn-forest" style={{ marginBottom: 10 }}>
                Create account
              </button>
              <button type="button" className="btn-app btn-cream">
                I already have one
              </button>
            </div>
            <span className="homeind" />
          </div>
        </div>
        <div className="cap">Onboarding</div>
      </div>

      {/* 2 · Wallet */}
      <div className="screenWrap">
        <div className="phone">
          <div className="screen">
            <span className="island" />
            <div className="sb">
              <span>9:41</span>
              <span>5G · 87%</span>
            </div>
            <div className="wallet">
              <div className="wtop">
                <span className="h">Kia ora, Emma</span>
                <span className="av" />
              </div>
              <div className="balcard">
                <span className="circ" />
                <div className="lab">Your balance</div>
                <div className="amt">$12.40</div>
                <span className="cash">Cash out via Stripe →</span>
              </div>
              <div className="wstat">
                <div className="s">
                  <div className="n">+$3.20</div>
                  <div className="l">This week</div>
                </div>
                <div className="s">
                  <div className="n">46</div>
                  <div className="l">Waits</div>
                </div>
                <div className="s">
                  <div className="n">2.1s</div>
                  <div className="l">Avg wait</div>
                </div>
              </div>
              <div className="wsec">Recent</div>
              <div className="wlist">
                <div className="row">
                  <span className="ic">S</span>
                  <div>
                    <div className="t">Seek</div>
                    <div className="s2">Job search · 9:02am</div>
                  </div>
                  <span className="amt">+$0.07</span>
                </div>
                <div className="row">
                  <span className="ic">TM</span>
                  <div>
                    <div className="t">Trade Me</div>
                    <div className="s2">Checkout · 8:14am</div>
                  </div>
                  <span className="amt">+$0.05</span>
                </div>
                <div className="row">
                  <span className="ic">CD</span>
                  <div>
                    <div className="t">Countdown</div>
                    <div className="s2">Basket · yesterday</div>
                  </div>
                  <span className="amt">+$0.09</span>
                </div>
              </div>
            </div>
            <div className="tabs">
              <div className="tab">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round">
                  <path d="M3 11l9-8 9 8" />
                  <path d="M5 10v10h14V10" />
                </svg>
                Home
              </div>
              <div className="tab on">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="6" width="18" height="13" rx="2.5" />
                  <path d="M3 10.5h18" />
                  <circle cx="16.5" cy="14.5" r="1.3" />
                </svg>
                Wallet
              </div>
              <div className="tab">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
                  <circle cx="12" cy="12" r="3.2" />
                  <path d="M19 12a7 7 0 0 0-.1-1l2-1.5-2-3.4-2.3 1a7 7 0 0 0-1.7-1L16.5 2h-4l-.4 2.6a7 7 0 0 0-1.7 1l-2.3-1-2 3.4 2 1.5a7 7 0 0 0 0 2l-2 1.5 2 3.4 2.3-1a7 7 0 0 0 1.7 1l.4 2.6h4l.4-2.6a7 7 0 0 0 1.7-1l2.3 1 2-3.4-2-1.5a7 7 0 0 0 .1-1Z" />
                </svg>
                Settings
              </div>
            </div>
            <span className="homeind" />
          </div>
        </div>
        <div className="cap">Earnings wallet</div>
      </div>

      {/* 3 · In-app loader */}
      <div className="screenWrap">
        <div className="phone">
          <div className="screen">
            <span className="island" />
            <div className="sb">
              <span>9:41</span>
              <span>5G · 87%</span>
            </div>
            <div className="il">
              <div className="appbar">
                <span className="sp" /> seek.co.nz · finding your next roles…
              </div>
              <div className="mid">
                <span className="chip">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <circle cx="6.5" cy="10" r="1.6" />
                    <circle cx="10.5" cy="6.5" r="1.6" />
                    <circle cx="14.5" cy="6.5" r="1.6" />
                    <circle cx="18" cy="10" r="1.6" />
                    <path d="M8.5 15.5c0-2 1.6-3.5 3.5-3.5s3.5 1.5 3.5 3.5c0 1.8-1.5 2.6-3.5 3.5-2-.9-3.5-1.7-3.5-3.5Z" />
                  </svg>
                  Funding SPCA NZ
                </span>
                <DashDogMark className="dog" />
                <div className="msg">Crunching the numbers…</div>
                <div className="bar">
                  <i />
                </div>
              </div>
              <div className="toast">
                <span className="b">+$0.07</span>
                <span className="t">Earned while you waited</span>
              </div>
            </div>
            <span className="homeind" />
          </div>
        </div>
        <div className="cap">In-app loader · funding SPCA</div>
      </div>
    </div>
  );
}
