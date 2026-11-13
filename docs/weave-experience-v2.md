# 五元编织：双镜头体验交付

> 已由用户的新方向取代：当前为左 80% 完整织机（40°）、右 20% 独立轮盘。查看 weave-experience-v4.md。本文保留为前版记录。

2026-10-10。基于原静态站增量实现，未迁移框架、未发布。第三分类入口仍是 life-weave.html。

## 文件和分阶段交付

- Phase 1：assets/js/weave-experience-state.js + scripts/test-weave-state.cjs，纯状态契约及 8 项回归测试。
- Phase 2：新增 assets/js/weave-experience.js，复用 assets/js/loom-model.js 的同一 scene、model、Renderer。两个 PerspectiveCamera 通过 Scissor/Viewport 分屏；1.3 秒裁切展开与相机插值。桌面 65:35，窄屏上下 52:48。输入指针中心来自右侧/下方相机投影，不按全画布误算。
- Phase 3：复用原木架及布面附着位置，新增连续折面从胸梁向前垂落。CanvasTexture 逐行显现，转轮、打纬器和踏板跟随实际角度。原连续布面几何仍保留，空白首页显示它。没有新增悬浮图案面板。
- Phase 4：首圈默认木，整圈边界可重复选任意元素，未选自动循环。半圈结束、空结果、PNG、继续、显式重置、返回保留均已接入。localStorage 保存状态事件的紧凑结果，生成规则完全确定，可重建全部布面；未保存 Three 对象或大图片。
- Phase 5：新增 assets/css/weave-experience.css，原纸色/灰绿/木质保留，SVG 经线纬线 pattern 裁入字形，每字独立扫描揭示；约三秒织字，后出现模型。支持跳过、提前进入和 reduced-motion。删除 HTML 旧底部整行，原作详情及模型入口留在“关于原作”。
- Phase 6：触摸 Pointer Capture、跨 ±π、键盘小步、断拖、桌面/手机宽度、空状态、重复圈、8 圈边界、重新打开恢复均测试。阴影图避免两个视口重复刷新；纹理和几何不逐帧重建。

## 算法与容量

assets/js/life-weave-core.js 未修改。每圈以原五行 seed 图案播种（8 个位置，邻近重复），叠加前圈的演化网格；完成该圈时展示 B3/S23 的下一代。不是原来按时间自动演化 18 代，也不是新相生相克规则。历史圈段保持独立，不清除以前织物。

纹理为 1000 × 2048，每圈 256 行，上限 8 圈。此选择让纹样不再挤入 64 行的细条，也避免超过 2048 的纹理高度。超过两圈时在布面内连续缩放适配历史长布；导出仍保留全部原始行数。上限不是五行任务要求。

正转推进使用历史最大角度；反转有机械反馈，不减少进度，回到旧位置后才继续生长。元素只能在整圈边界选择，已经生成的部分不会被改写。结束预览不补齐部分圈。

## 验证

从工作区父目录运行：

```
node --test kiran-portfolio-home/scripts/test-weave-state.cjs
node .preview/test-weave-v2.cjs
node .preview/test-weave-v2-edges.cjs
```

浏览器：本地 Chrome headless，SwiftShader。桌面测试真实 mouse 圆周拖动；移动端通过 CDP touchStart/touchMove/touchEnd 模拟真实触摸事件，不直接调用业务转动函数。

覆盖：鼠标半圈、松手冻结、预览 PNG 编码、首圈迭代、手动水元素、返回续织、刷新恢复、390px 不横溢、触摸半圈、反向及重复弧不刷进度、8 圈限制、保存纹样恢复后 PNG 完全一致、空结果禁用下载、显式重置、减少动态效果、无 JavaScript 错误。

人工截图检查：.preview/weave-v2-home.png、weave-v2-desktop.png、weave-v2-mobile.png、weave-v2-half.png。

## 验证边界

- 测试是桌面浏览器及触摸模拟，未在真实手机硬件上测 GPU 性能。
- 已验证 PNG 生成与内容一致性；浏览器最终保存位置由下载设置决定。
- 原参考模型是视觉重建，连杆运动为合理示意，不是精确机械物理仿真。
- WebGL 失败沿用原有错误提示并禁用开始；不提供伪造的可玩 2D 替身。
- 本地持久化取决于浏览器对 file URL / localStorage 的允许情况；不可用会提示先下载。
