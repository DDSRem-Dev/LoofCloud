# LoofCloud Frontend

现代化云端应用管理平台前端，采用 Expo + React Native Web 跨平台架构，提供 iOS、Android 和 Web 端统一的用户体验。

## 概述

LoofCloud 前端是一个全栈跨平台应用，使用 **Expo Router**（基于文件的路由）+ **Tamagui v2**（高性能 UI 组件库）构建，支持浅色/深色主题、响应式设计、PWA、以及流畅的动画交互。

### 核心特性

- ✨ **极光背景动画** — Mesh 梯度 + 模糊光斑 + 脉冲光圈，动态呼吸感
- 🎬 **页面过渡动画** — Fade + Slide Up，刷新感
- 📊 **交错入场** — 卡片/列表依次渐入，增加层次感
- 🎨 **圆形主题切换** — 从中心向外扩散的灵动过渡
- 📱 **响应式布局** — Desktop (256px 侧边栏) / Mobile (Drawer)
- 🌙 **主题系统** — 浅色/深色自动适配，持久化存储
- 🚀 **PWA 支持** — 离线能力、安装提示、Service Worker

## 快速开始

### 环境要求

- **Node.js** ≥ 18.0.0
- **npm** ≥ 9.0.0

### 安装依赖

```bash
npm install
```

### 开发

**Web 开发服务器**（推荐开发 Web UI）：
```bash
npm run web
# 或
npm start --web
```

**iOS 模拟器**：
```bash
npm run ios
```

**Android 模拟器**：
```bash
npm run android
```

**本地开发**（所有平台）：
```bash
npm start
```

### 构建

**Web 静态导出**：
```bash
npm run build:web
```

**完整导出**（所有平台）：
```bash
npm run build
```

**EAS 构建**（iOS/Android）：
```bash
npm run build:ios
npm run build:android
```

### 其他命令

```bash
npm run type-check    # TypeScript 类型检查
npm run clean        # 清除 .expo 和 node_modules
npm run reset        # 完整清理并重新安装
```

## 核心文件说明

### `app/(tabs)/_layout.tsx`

整个应用的主布局容器，包含：
- **Mesh Gradient 背景** — 4 层椭圆渐变 + 底层线性渐变，自适应亮暗主题
- **Aurora 光斑** — 3 个模糊圆形光斑（天蓝/樱花粉/紫），缓慢漂浮 + 呼吸动画
- **脉冲光圈** — 2 个小光圈，周期性扩散消散
- **页面过渡** — 基于 `pathname` 的 fade + slide up
- **Sidebar 和 MobileHeader** — 响应式导航

### `contexts/ThemeContext.tsx`

全局主题状态管理：
- 读写 `localStorage` 持久化主题选择
- **圆形扩散过渡** — 点击切换时：
  1. 禁用所有元素 `transition`
  2. 创建全屏遮罩（新主题颜色）
  3. `clip-path: circle(0%)` 动画到 `circle(150vmax)` 展开（0.6s）
  4. 背景瞬间切换（遮罩遮住跳变）
  5. 动画结束移除遮罩和禁用 class

### `constants/DesignTokens.ts`

设计系统常量（受 astro-koharu 启发）：
- **配色方案** — 天蓝(#5bcffa) + 樱花粉(#f5abb9) + 白/深色
- **圆角** — sm(2) ~ 3xl(24)
- **阴影** — card 专用阴影
- **梯度** — Shoka 按钮渐变、Header 渐变
- **Glassmorphism** 卡片样式 — 毛玻璃效果 + 背景模糊

### `app/+html.tsx`

全局 HTML 根元素，包含：
- **CSS 动画** — `pageEnter`, `staggerFadeUp`, `auroraFloat[1-3]`, `particlePulse`, `themeReveal`
- **全局 transition 规则** — 背景色/边框色 0.35s 过渡
- **PWA 配置** — manifest、theme color、iOS meta tags

## 动画系统

所有动画采用 CSS keyframes + React 状态驱动，性能优化：

### 页面切换（Page Transition）

```
路由改变 → setPageEntered(false) → 双 rAF → setPageEntered(true)
↓
CSS: opacity 0→1, translateY 8px→0 (0.4s cubic-bezier)
```

**为什么双 rAF？** 确保浏览器先绘制初始状态，再触发 transition。

### 主题切换（Theme Reveal）

```
toggleColorScheme() → 添加 .theme-transitioning（禁用 transition）
→ 创建遮罩 clip-path: circle(0%)
→ setColorScheme() 瞬间切换背景
→ clip-path 动画到 circle(150vmax) 展开（0.6s）
→ 动画结束移除遮罩
```

### 交错入场（Stagger Animation）

```
for each item:
  className="stagger-item"
  style={{ '--stagger-delay': `${index * 80}ms` }}

CSS: animation: staggerFadeUp 0.5s both, animation-delay: var(--stagger-delay)
```

### Aurora 光斑（Aurora Float）

```
3 个光斑，各自：
- animation: auroraFloat[1-3] {18-25}s ease-in-out infinite
- 周期内：translate + scale + opacity 变化
- 效果：缓慢漂移 + 呼吸感
```

## 配色体系

### 浅色模式

| 用途 | 颜色 | Hex |
|------|------|-----|
| 主色 | 天蓝 | #5bcffa |
| 副色 | 樱花粉 | #f5abb9 |
| 背景起点 | 淡蓝 | #eaf4ff |
| 背景中点 | 淡薰衣草 | #f3eefa |
| 背景终点 | 淡粉 | #fdf0f4 |
| 文字 | 深灰 | #333333 |
| 边框 | 浅灰 | #e5e5e5 |

### 深色模式

| 用途 | 颜色 | Hex |
|------|------|-----|
| 主色 | 亮天蓝 | #7dd9fb |
| 副色 | 亮樱花粉 | #f7bdc8 |
| 背景起点 | 深海蓝 | #0a0f1e |
| 背景中点 | 深紫 | #100d20 |
| 背景终点 | 暗玫红 | #180c18 |
| 文字 | 浅灰 | #f2f2f2 |
| 边框 | 深灰 | #282828 |

## 响应式设计

### 断点

- **Desktop** — 宽度 ≥ 768px
  - 侧边栏固定宽度 256px（sticky）
  - 内容区自适应
  - 悬停交互

- **Mobile** — 宽度 < 768px
  - 隐藏侧边栏
  - 顶部 MobileHeader（56px）
  - Drawer 从左侧滑出（带背景遮罩）
  - 触摸友好的更大间距

### 关键 CSS

```tsx
useWindowDimensions() // React Native 获取窗口尺寸
const isMobile = width < 768
```

## Tamagui v2 注意事项

### Button 无 `color` 属性

改用 `<Text color="...">` 嵌套在 Button 内：

```tsx
<Button unstyled borderWidth={0} ...>
  <Text color="#5bcffa">Button Text</Text>
</Button>
```

### Lucide 图标需要解析的颜色

Lucide 图标不接受 Tamagui token 如 `$color`，需传入十六进制字符串：

```tsx
// ✗ 错误
<Cloud color="$primary" />

// ✓ 正确
<Cloud color="#5bcffa" />
```

### Unstyled 组件需手动配置

```tsx
<Button
  unstyled
  borderWidth={0}      // 必须移除边框
  alignItems="center"  // 必须手动设置
  justifyContent="center"
  padding="$4"
>
  ...
</Button>
```

## PWA 配置

应用已配置为 PWA，支持：

- **离线访问** — Service Worker 缓存资源
- **安装提示** — 浏览器自动提示安装到主屏
- **独立模式** — `display: "standalone"`
- **主题色** — #5bcffa（天蓝）
- **启动屏** — 自定义 splash 图

## 性能优化

1. **CSS 动画 vs JS** — 所有关键动画用 CSS keyframes（GPU 加速）
2. **Fixed 定位光斑** — Aurora 层用 `position: fixed` 不参与文档流
3. **pointer-events: none** — 交互元素不遮挡点击
4. **transition: none !important** — 主题切换时禁用 transition 防止干扰
5. **zIndex 分层** — 0(背景) → 1(内容) → 50(MobileHeader) → 99999(遮罩)

## 浏览器兼容性

- **Chrome/Edge** — ✓ 完全支持
- **Firefox** — ✓ 完全支持
- **Safari** — ✓ 支持（需 WebkitBackdropFilter for blur）
- **iOS Safari** — ✓ 支持 PWA
- **移动浏览器** — ✓ Responsive 完整适配

## 许可证

本项目采用 **GPL 3.0** 许可证。详见 [LICENSE](../LICENSE)。

---

**维护者** — LoofCloud Team
**最后更新** — 2026-02-13
