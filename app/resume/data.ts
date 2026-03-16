export type Project = {
  name: string;
  description: string;
  tech?: string;
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
      name: "智慧工地",
      company: "天津二维科技有限公司",
      dates: "2023/02 - 2024/01",
      description:
        "面向中海油清洁能源部门建设的多项目智慧工地平台，覆盖人员管理、安全监管、设备监控和数据可视化场景，提供项目分布展示、工地地图、人员/安全帽定位、电子围栏、视频监控、环境监测、设备告警等功能，并接入基于 LLM + RAG 的智能问答能力。",
      responsibilities: [
        "负责项目约 60% 的前端模块开发，深度参与大屏、地图、权限等核心功能建设。",
        "完成人员进出、视频监控、环境监测、设备告警、项目概况等业务模块的页面开发与接口联调。",
        "完成登录鉴权、角色菜单权限、按钮权限、动态路由等权限能力接入。",
        "对接 WVP 国标视频平台，实现监控画面接入与展示。",
        "参与接入基于 LLM + RAG 的智能问答能力，负责前端交互、接口联调及结果展示。",
        "负责项目打包发布、Nginx 配置与转发、环境区分、Docker 部署及线上问题排查。",
      ],
    },
    {
      name: "电气检测",
      company: "天津二维科技有限公司",
      dates: "2024/04 - 2024/09",
      description:
        "面向电力与配电设备监测场景建设的可视化监控平台，围绕设备接入、实时状态监测、告警管理和运维分析等需求，提供设备台账管理、遥测/遥信监测、低压母排展示、历史趋势分析、主动与已处理告警、告警规则配置、设备数据映射及服务监控等功能。",
      responsibilities: [
        "负责前端核心模块开发，参与首页大屏、设备监控、告警管理、规则配置、设备管理等页面建设。",
        "对接设备监测与告警相关接口，基于 WebSocket 实现设备状态、在线情况和告警消息的实时刷新。",
        "完成遥测、遥信、低压母排、历史趋势等监测页面开发，支持按设备类型与设备维度查看运行状态。",
        "参与告警规则、规则明细、字段映射等配置能力建设，支撑设备数据与业务字段的映射管理。",
        "完成登录鉴权、动态菜单路由、按钮权限等后台通用能力接入，并参与上线部署和问题排查。",
      ],
    },
    {
      name: "钻完井设计精细化管理系统",
      company: "天津二维科技有限公司",
      dates: "2025/02 - 2026/01",
      description:
        "面向钻完井工程设计场景建设的综合业务平台，融合探井工程管理、井史数据管理和流程审批能力，支持工程基础信息维护、邻井数据选取、井相关业务数据导入、模板化文件生成、在线文档编辑、流程审批流转和历史版本查看等功能。",
      responsibilities: [
        "负责前端核心业务模块开发，参与探井工程管理、井史数据管理、流程审批和在线文档协同等功能建设。",
        "参与工程设计文件制作流程开发，支持基础信息填写、邻井、地层压力、钻井液、钻头等数据选择，以及模板选择和文件生成状态轮询。",
        "对接 OnlyOffice 在线文档编辑能力，实现设计文件在线编辑、预览和流程节点内协同处理。",
        "参与 BPM 流程页面开发，支持流程文件上传、审批通过、回退、流程图查看、历史版本查看和项目信息联动。",
        "参与井史数据相关页面开发，支持井数据查询、导入及多类业务数据展示分析。",
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
