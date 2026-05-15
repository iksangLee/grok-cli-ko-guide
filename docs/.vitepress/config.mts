import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "Grok CLI Korean Guide",
  description: "Grok CLI 공식 문서를 기반으로 한 한국어 가이드",
  lang: 'ko-KR',
  cleanUrls: true,

  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/01-getting-started' }
    ],

    sidebar: [
      {
        text: 'Grok CLI Korean Guide',
        items: [
          { text: 'Getting Started', link: '/01-getting-started' },
          { text: 'Authentication', link: '/02-authentication' },
          { text: 'Getting Started with Extensions', link: '/03-getting-started-with-extensions' },
          { text: 'Keyboard Shortcuts', link: '/04-keyboard-shortcuts' },
          { text: 'Slash Commands', link: '/05-slash-commands' },
          { text: 'Configuration', link: '/06-configuration' },
          { text: 'Theming', link: '/07-theming' },
          { text: 'MCP Server Guide', link: '/08-mcp-server-guide' },
          { text: 'Skills', link: '/09-skills' },
          { text: 'Plugins & Marketplace', link: '/10-plugins-and-marketplace' },
          { text: 'Hooks Guide', link: '/11-hooks-guide' },
          { text: 'Project Rules', link: '/12-project-rules' },
          { text: 'Memory', link: '/13-memory' },
          { text: 'Headless Mode', link: '/14-headless-mode' },
          { text: 'Agent Mode', link: '/15-agent-mode' },
          { text: 'Subagents', link: '/16-subagents' },
          { text: 'Sessions', link: '/17-sessions' },
          { text: 'Sandbox', link: '/18-sandbox' },
          { text: 'Plan Mode', link: '/19-plan-mode' },
          { text: 'Background Tasks', link: '/20-background-tasks' },
          { text: 'Terminal Support', link: '/21-terminal-support' },
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/leeiksang' }
    ],

    // 문서 오른쪽에 목차 표시
    outline: {
      level: [2, 3],
      label: 'On this page'
    },

    // 마지막 수정일 표시
    lastUpdated: {
      text: 'Last updated',
      formatOptions: {
        dateStyle: 'medium'
      }
    }
  }
})
