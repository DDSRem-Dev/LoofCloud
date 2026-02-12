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
}`;
