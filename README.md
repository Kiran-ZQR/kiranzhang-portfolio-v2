# kiranzhang · Portfolio v2

独立的第二版作品集实验。原仓库与原站保持不变。

## 设计

首页以小写 kiranzhang 为开屏字标，包含真实关键资源加载进度、三个特质词切换、双片遮罩退出和字母错峰揭示；同一标签页内仅自动播放一次，可跳过或在页脚重播。原有四类作品、项目详情、About 和 Resume 内容保留。设计规则见 DESIGN.md。

## 发布

本仓库首次 Actions 会从原仓库的固定提交 8ef6cc91f1fb686467b7725089d5485d393580ff 导入完整素材与代码，恢复新版改动，并将完整副本提交至本仓库。后续编辑直接作用于这个独立副本，不会再次导入，不修改原仓库。

首次请在 Settings → Pages → Build and deployment 中将 Source 设为 GitHub Actions。随后 Publish portfolio v2 会发布到 https://kiran-zqr.github.io/kiranzhang-portfolio-v2/ 。

## 本地预览

导入完成后在项目目录使用任意静态 HTTP 服务器。无需安装运行时依赖。验证命令：

    node --check assets/js/v2.js
    node scripts/check-v2.mjs

## 权利

保留原模板 MIT 许可及原作品、简历、参考图和第三方库各自权利。Santalarch 仅作为视觉与交互设计研究来源，不包含其品牌、文案、项目图或源代码。
