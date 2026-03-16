export type Project = {
  name: string;
  description: string;
  tech: string;
  link?: string;
  bullets?: string[];
  company?: string;
  dates?: string;
  responsibilities?: string[];
  challenges?: string[];
  achievements?: string[];
};

export type Header = {
  name: string;
  title: string;
  titleEn?: string;
  contact: Record<string, string>;
  status?: string;
};

export type Education = {
  school: string;
  degree: string;
  major: string;
  dates: string;
  gpa: string;
  highlights: string[];
};

export type Experience = {
  company: string;
  role: string;
  dates: string;
  location: string;
  bullets: string[];
};

export type Skill = {
  name: string;
  level: number;
};

export type SkillsByCategory = {
  label: string;
  items: string[];
};

export type OpenSourceProject = {
  name: string;
  description: string;
  link: string;
};

export type ResumeData = {
  birthDate: string;
  header: Header;
  summary: string;
  education: Education[];
  experience: Experience[];
  projects: Project[];
  skills: Skill[];
  skillsByCategory?: SkillsByCategory[];
  openSourceProjects?: OpenSourceProject[];
  certifications: { name: string; issuer: string; date: string }[];
};

export function getAge(birthDate: string): number {
  const [year, month, day] = birthDate.split(".").map(Number);
  const today = new Date();
  let age = today.getFullYear() - year;
  const m = today.getMonth() + 1;
  if (m < month || (m === month && today.getDate() < day)) age--;
  return age;
}

export function getWorkYears(experience: { dates: string }[]): string {
  const today = new Date();
  let totalMonths = 0;
  for (const exp of experience) {
    const [startStr, endStr] = exp.dates.split(" - ").map((s) => s.trim());
    if (!startStr || !endStr) continue;
    const [y1, m1] = startStr.split("/").map(Number);
    const start = new Date(y1, (m1 || 1) - 1, 1);
    const end =
      endStr === "至今"
        ? today
        : (() => {
            const [y2, m2] = endStr.split("/").map(Number);
            return new Date(y2, (m2 || 1) - 1, 1);
          })();
    const months =
      (end.getFullYear() - start.getFullYear()) * 12 +
      (end.getMonth() - start.getMonth());
    totalMonths += Math.max(0, months);
  }
  const years = Math.floor(totalMonths / 12);
  return `${years}年`;
}

export function formatDateRange(dates: string): string {
  const [startStr, endStr] = dates.split(" - ").map((s) => s.trim());
  if (!startStr || !endStr) return dates;

  if (endStr !== "至今") return dates;

  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = String(today.getMonth() + 1).padStart(2, "0");

  return `${startStr} - ${currentYear}/${currentMonth}`;
}

export const resumeData: ResumeData = {
  birthDate: "1998.10.26",
  header: {
    name: "雷光银",
    title: "前端开发工程师",
    titleEn: "Frontend Developer",
    contact: {
      email: "672228275@qq.com",
      phone: "17608337515",
      location: "",
      website: "https://leyen.me",
      github: "",
      linkedin: "",
    },
    status: "离职",
  },
  summary:
    "拥有 6 年前端开发经验，专注于 Vue3、TypeScript 方向，具备后台管理系统、官网与 Web 应用项目的开发和交付经验。熟悉现代前端工程化体系，能够独立完成需求分析、技术方案设计、组件封装、功能开发与上线部署。具备良好的 UI 还原能力与产品协作意识，关注代码质量、开发效率与用户体验，并持续关注 AI 应用、Agent 与自动化工具在实际业务中的落地价值。",
  education: [
    {
      school: "西南交通大学",
      degree: "本科",
      major: "交通运营管理",
      dates: "2016 - 2019",
      gpa: "",
      highlights: [],
    },
  ],
  experience: [
    {
      company: "天津二维科技有限公司",
      role: "前端开发工程师",
      dates: "2022/12 - 至今",
      location: "天津",
      bullets: [],
    },
    {
      company: "广锋科技有限公司",
      role: "前端开发工程师",
      dates: "2020/02 - 2022/12",
      location: "四川",
      bullets: [],
    },
  ],
  projects: [
    {
      name: "全能工匠",
      description: "装修工人接单系统、商城系统",
      company: "广锋科技有限公司",
      dates: "2022/07 - 2022/12",
      tech: "Vue2, Vue3, uView, Uniapp, ElementPlus",
      link: "",
      bullets: [],
      responsibilities: [
        "承担项目技术选型、项目搭建与设计、基础组件与业务组件封装",
        "完成用户端首页模块、论坛模块、电商后台管理系统开发",
      ],
      challenges: [
        "keep-alive 缓存组件、vuex 持久化数据",
        "论坛评论模块递归组件设计",
        "使用反向代理解决开发环境跨域问题",
        "问答模块组件化开发，自定义实现 v-model",
        "工匠电商后台权限管理模块开发，基于 RBAC 权限模型动态路由，前后端分离权限认证，自定义指令 v-has 实现按钮组件级权限控制",
      ],
      achievements: [
        "优化第三方组件库，抽象公共业务逻辑与公共组件，重新定义适合公司的前端脚手架",
        "推广 Eslint 前端标准化代码规范",
        "新项目广泛采用函数式编程、Vue3+TypeScript+Pinia",
      ],
    },
    {
      name: "阳光物业",
      description: "物业缴费系统",
      company: "广峰科技有限公司",
      dates: "2022/04 - 2022/06",
      tech: "Vue3, ElementPlus, Pinia",
      link: "",
      bullets: [],
      responsibilities: [
        "使用 Vue3 进行项目搭建与开发，采用最新 setup 语法进行开发",
        "封装 H5 支付模块",
        "使用 mock 服务加速项目开发与测试",
        "使用 yarn 替代 npm 包管理器，了解 pnpm 包管理器",
        "使用 vite 替代 webpack 项目构建服务",
      ],
      challenges: [
        "用户数据导出 Excel 实现",
        "使用 echarts 实现用户缴费统计可视化",
        "使用事件委托优化项目列表性能",
      ],
      achievements: [
        "理解并推广 Vue3 生态，封装 Hooks 提升项目开发效率",
      ],
    },
    {
      name: "蜀道黑牛",
      description: "专业卖牛肉的商城系统",
      company: "广峰科技有限公司",
      dates: "2021/03 - 2021/06",
      tech: "Vue2, uView, Uniapp, Element",
      link: "",
      bullets: [],
      responsibilities: [
        "完成电商项目搭建、基础组件与业务组件封装",
        "使用 ApiPost 进行项目管理、mock 服务、API 服务",
        "高质量还原设计稿",
      ],
      challenges: [
        "项目页面分包优化、组件按需引入",
      ],
      achievements: [
        "根据项目体量提前判断是否分包，建立分包规范",
      ],
    },
    {
      name: "阳光物业",
      description: "物业缴费系统",
      company: "广峰科技有限公司",
      dates: "2022/04 - 2022/06",
      tech: "Vue3, ElementPlus, Pinia",
      link: "",
      bullets: [],
      responsibilities: [
        "使用 Vue3 进行项目搭建与开发，采用最新 setup 语法进行开发",
        "封装 H5 支付模块",
        "使用 mock 服务加速项目开发与测试",
        "使用 yarn 替代 npm 包管理器，了解 pnpm 包管理器",
        "使用 vite 替代 webpack 项目构建服务",
      ],
      challenges: [
        "用户数据导出 Excel 实现",
        "使用 echarts 实现用户缴费统计可视化",
        "使用事件委托优化项目列表性能",
      ],
      achievements: [
        "理解并推广 Vue3 生态，封装 Hooks 提升项目开发效率",
      ],
    },
    {
      name: "蜀道黑牛",
      description: "专业卖牛肉的商城系统",
      company: "广峰科技有限公司",
      dates: "2021/03 - 2021/06",
      tech: "Vue2, uView, Uniapp, Element",
      link: "",
      bullets: [],
      responsibilities: [
        "完成电商项目搭建、基础组件与业务组件封装",
        "使用 ApiPost 进行项目管理、mock 服务、API 服务",
        "高质量还原设计稿",
      ],
      challenges: [
        "项目页面分包优化、组件按需引入",
      ],
      achievements: [
        "根据项目体量提前判断是否分包，建立分包规范",
      ],
    },
    {
      name: "阳光物业",
      description: "物业缴费系统",
      company: "广峰科技有限公司",
      dates: "2022/04 - 2022/06",
      tech: "Vue3, ElementPlus, Pinia",
      link: "",
      bullets: [],
      responsibilities: [
        "使用 Vue3 进行项目搭建与开发，采用最新 setup 语法进行开发",
        "封装 H5 支付模块",
        "使用 mock 服务加速项目开发与测试",
        "使用 yarn 替代 npm 包管理器，了解 pnpm 包管理器",
        "使用 vite 替代 webpack 项目构建服务",
      ],
      challenges: [
        "用户数据导出 Excel 实现",
        "使用 echarts 实现用户缴费统计可视化",
        "使用事件委托优化项目列表性能",
      ],
      achievements: [
        "理解并推广 Vue3 生态，封装 Hooks 提升项目开发效率",
      ],
    },
    {
      name: "蜀道黑牛",
      description: "专业卖牛肉的商城系统",
      company: "广峰科技有限公司",
      dates: "2021/03 - 2021/06",
      tech: "Vue2, uView, Uniapp, Element",
      link: "",
      bullets: [],
      responsibilities: [
        "完成电商项目搭建、基础组件与业务组件封装",
        "使用 ApiPost 进行项目管理、mock 服务、API 服务",
        "高质量还原设计稿",
      ],
      challenges: [
        "项目页面分包优化、组件按需引入",
      ],
      achievements: [
        "根据项目体量提前判断是否分包，建立分包规范",
      ],
    },
  ],
  skills: [
    { name: "Vue2 / Vue3", level: 90 },
    { name: "JavaScript / TypeScript", level: 88 },
    { name: "Uniapp / 小程序", level: 85 },
    { name: "HTML / CSS / Scss", level: 90 },
    { name: "Element / AntDesign", level: 85 },
    { name: "Git / Webpack", level: 80 },
  ],
  skillsByCategory: [
    {
      label: "语言",
      items: ["HTML", "CSS", "JavaScript", "TypeScript"],
    },
    {
      label: "技术",
      items: [
        "React",
        "Vue",
        "Next.js",
        "Nuxt",
        "Pinia",
        "Zustand",
        "Tailwind CSS",
        "Sass",
        "Jest",
        "Vitest",
        "Babel",
      ],
    },
  ],
  openSourceProjects: [
    {
      name: "ReAct Agent",
      description: "基于 ReAct 模式的智能开发助手，TUI 界面，支持文件操作、代码编辑、Git 管理",
      link: "https://github.com/leyen-me/ReAct-Agent",
    },
    {
      name: "Flask Starter",
      description: "全开源快速开发平台，Vue3 + Flask + Sqlalchemy，支持动态权限菜单",
      link: "https://github.com/leyen-me/flask-starter",
    },
    {
      name: "TinyJS",
      description: "轻量级 JavaScript 解释器，支持 ES6+，用于理解词法分析、语法解析与运行时",
      link: "https://github.com/leyen-me/tinyjs",
    },
    {
      name: "Prompt",
      description: "AI 提示词展示平台，现代化界面，支持搜索与标签筛选",
      link: "https://github.com/leyen-me/prompt",
    },
  ],
  certifications: [],
};
