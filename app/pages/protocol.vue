<template>
  <Container size="xl">
    <header class="protocol-header">
      <h1>内容分级协议</h1>
      <p class="sub">P1 – P5 · 以深度为尺，而非篇幅</p>
    </header>

    <div class="protocol-intro">
      <p>
        本博客文章按技术深度分为五个等级，帮助读者快速判断文章是否适合自己。<br />
        分级依据是 <strong>技术深度</strong>，而非代码量或文章长度。
      </p>
    </div>

    <Table :columns="columns" :data="protocolData" />

    <section class="guide">
      <h2>我应该从哪一级开始读？</h2>
      <ul>
        <li>
          <strong>刚接触某个领域</strong> → 从 P1 开始，了解生态和基础配置
        </li>
        <li>
          <strong>有一定经验，想深入实践</strong> → P2–P3，看具体接入和重构方案
        </li>
        <li>
          <strong>负责项目架构或工程化</strong> → P4–P5，关注交付链路和底层实现
        </li>
        <li>
          <strong>遇到具体问题时</strong> →
          直接搜索对应主题，参考该文章的等级标注
        </li>
      </ul>
    </section>

    <NuxtLink to="/series" class="back-link">← 返回系列索引</NuxtLink>
  </Container>
</template>

<script setup lang="ts">
import { Container, Table } from "moongate-vue";

const columns = [
  { key: "level", title: "等级" },
  { key: "definition", title: "核心定义" },
  { key: "features", title: "典型特征" },
  { key: "examples", title: "代表作" },
];

const protocolData = [
  {
    level: "P1",
    definition: "生态适配",
    features: "框架/工具集成与配置",
    examples: "Nuxt i18n、Sitemap 自动化",
  },
  {
    level: "P2",
    definition: "模组接入",
    features: "第三方模块接入，涉及数据流与接口",
    examples: "Drizzle ORM、GitHub OAuth",
  },
  {
    level: "P3",
    definition: "逻辑重构",
    features: "核心业务逻辑设计与重构",
    examples: "URL 状态绑定、多级引用评论区、主题设计系统",
  },
  {
    level: "P4",
    definition: "交付自动化",
    features: "CI/CD、部署、监控等交付链路工程化",
    examples: "GitHub Actions + Docker/Caddy 部署",
  },
  {
    level: "P5",
    definition: "底层驱动",
    features: "编译器扩展、插件系统等基础设施",
    examples: "（待解锁）",
  },
];
</script>

<style scoped>
.protocol-header {
  margin-bottom: 2.5rem;
  padding-bottom: 1.25rem;
  border-bottom: 1px solid var(--ui-border);
}

.protocol-header h1 {
  margin: 0;
  font-size: 1.8rem;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: var(--ui-text);
}

.protocol-header .sub {
  margin-top: 0.15rem;
  font-size: 0.95rem;
  color: var(--ui-text-muted);
}

.protocol-intro {
  padding: 1rem 1.25rem;
  margin-bottom: 2rem;
  font-size: 0.95rem;
  color: var(--ui-text-dim);
  background: var(--ui-bg-muted);
  border-left: 3px solid var(--ui-border-dim);
}

.protocol-intro p {
  margin: 0;
}

.protocol-intro strong {
  font-weight: 600;
  color: var(--ui-text);
}

.guide {
  margin-top: 2.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--ui-border);
}

.guide h2 {
  font-size: 1.2rem;
  font-weight: 600;
  margin-bottom: 0.75rem;
  color: var(--ui-text);
}

.guide ul {
  padding: 0;
  margin: 0;
  list-style: none;
}

.guide li {
  padding: 0.3rem 0 0.3rem 1.25rem;
  position: relative;
  color: var(--ui-text-dim);
}

.guide li::before {
  content: "·";
  position: absolute;
  left: 0;
  color: var(--ui-text-muted);
}

.guide li strong {
  color: var(--ui-text);
}

.back-link {
  display: inline-block;
  margin-top: 2.5rem;
  font-size: 0.9rem;
  color: var(--ui-text-muted);
  text-decoration: none;
}

.back-link:hover {
  color: var(--ui-text);
}
</style>
