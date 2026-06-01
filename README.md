# jizhihui 2026 世界杯赛程日历

这是一个 GitHub Pages 版的 2026 世界杯日历订阅项目。发布后，订阅地址会类似：

```text
https://<你的 GitHub 用户名>.github.io/jizhihui-worldcup-2026-calendar/jizhihui-world-cup-2026-calendar.zh.ics
```

订阅后，日历 App 会显示当天赛程；比赛进行中或结束后，标题会显示比分。日历名称和订阅文件名都以 `jizhihui` 开头，能看出来是你制作的。

## 自动更新

`.github/workflows/update-calendar.yml` 会在以下情况更新 `docs/jizhihui-world-cup-2026-calendar.zh.ics`：

- 每 30 分钟定时运行；
- 推送到 `main` 后运行；
- 在 GitHub Actions 页面手动运行。

数据来源：

- ESPN 赛程页：https://www.espn.com/soccer/scoreboard?league=fifa.world
- ESPN JSON 端点：`https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/scoreboard`

## 本地验证

```bash
npm test
npm run generate:offline
```

`generate:offline` 会生成一个占位 ICS，保证 Pages 链接先可用。正式更新由 GitHub Actions 在云端拉取 ESPN 数据后完成。
