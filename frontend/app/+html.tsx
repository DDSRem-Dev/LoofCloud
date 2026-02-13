import { ScrollViewStyleReset } from 'expo-router/html';

// This file is web-only and used to configure the root HTML for every
// web page during static rendering.
// The contents of this function only run in Node.js environments and
// do not have access to the DOM or browser APIs.
export default function Root({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />

        {/* PWA Manifest - Expo 会自动生成，路径可能因环境而异 */}
        <link rel="manifest" href="/manifest.json" />
        <link rel="manifest" href="/_expo/static/js/web/manifest.json" />

        {/* Theme Color - 粉红主色 */}
        <meta name="theme-color" content="#5bcffa" />
        <meta name="msapplication-TileColor" content="#5bcffa" />

        {/* iOS Safari Meta Tags */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="LoofCloud" />
        <link rel="apple-touch-icon" href="/assets/images/icon.png" />

        {/* iOS Safari 状态栏样式 - 白色背景，黑色文字 */}
        <style dangerouslySetInnerHTML={{
          __html: `
          /* iOS Safari 状态栏样式 */
          @supports (-webkit-touch-callout: none) {
            body {
              padding-top: env(safe-area-inset-top);
            }
          }
        ` }} />

        {/* Favicon */}
        <link rel="icon" href="/assets/images/favicon.png" />
        <link rel="shortcut icon" href="/assets/images/favicon.png" />

        {/* 
          Disable body scrolling on web. This makes ScrollView components work closer to how they do on native. 
          However, body scrolling is often nice to have for mobile web. If you want to enable it, remove this line.
        */}
        <ScrollViewStyleReset />

        {/* Using raw CSS styles as an escape-hatch to ensure the background color never flickers in dark-mode. */}
        <style dangerouslySetInnerHTML={{ __html: responsiveBackground }} />
        {/* Add any additional <head> elements that you want globally available on web... */}
      </head>
      <body>{children}</body>
    </html>
  );
}

const responsiveBackground = `
body {
  background-color: #fff;
}
@media (prefers-color-scheme: dark) {
  body {
    background-color: #000;
  }
}

/* Global animations */
@keyframes navPop {
  0% { transform: scale(0.92); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
}
@keyframes cardSelect {
  0% { transform: scale(1); }
  40% { transform: scale(1.06); }
  70% { transform: scale(0.97); }
  100% { transform: scale(1); }
}
.card-active {
  animation: cardSelect 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
}

/* 页面入场动画 */
@keyframes pageEnter {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

/* 交错入场动画 */
@keyframes staggerFadeUp {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

/* View Transition — 纯净交叉溶解，旧画面静止，新画面淡入覆盖 */
::view-transition-old(root) {
  animation: none;
}
::view-transition-new(root) {
  animation: theme-dissolve 0.35s cubic-bezier(0.22, 1, 0.36, 1);
}
@keyframes theme-dissolve {
  from { opacity: 0; }
}

/* 页面入场 */
.page-enter {
  animation: pageEnter 0.4s cubic-bezier(0.22, 1, 0.36, 1) both;
}

/* 交错入场 */
.stagger-item {
  animation: staggerFadeUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: var(--stagger-delay, 0ms);
}

/* Aurora 极光光斑 — 漂浮 + 缩放 + 呼吸 */
@keyframes auroraFloat1 {
  0%, 100% { transform: translate(0, 0) scale(1); opacity: 1; }
  25% { transform: translate(40px, -30px) scale(1.1); opacity: 0.7; }
  50% { transform: translate(10px, 20px) scale(0.95); opacity: 0.85; }
  75% { transform: translate(-30px, -10px) scale(1.06); opacity: 0.6; }
}
@keyframes auroraFloat2 {
  0%, 100% { transform: translate(0, 0) scale(1); opacity: 1; }
  30% { transform: translate(-35px, 25px) scale(0.92); opacity: 0.65; }
  60% { transform: translate(25px, -35px) scale(1.08); opacity: 0.9; }
  80% { transform: translate(-10px, 10px) scale(1.02); opacity: 0.5; }
}
@keyframes auroraFloat3 {
  0%, 100% { transform: translate(0, 0) scale(1); opacity: 1; }
  40% { transform: translate(20px, 30px) scale(1.12); opacity: 0.6; }
  70% { transform: translate(-15px, -20px) scale(0.94); opacity: 0.85; }
}

/* 脉冲光圈 */
@keyframes particlePulse {
  0%, 100% { transform: scale(1); opacity: 0.6; }
  50% { transform: scale(1.8); opacity: 0.15; }
}`;
