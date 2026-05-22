export default {
  title: "الأدوات",
  subtitle:
    "فعّل أو عطّل مجموعات الأدوات التي يمكن لوكيلك استخدامها أثناء المحادثات",
  web: {
    label: "البحث على الويب",
    description: "البحث على الويب واستخراج المحتوى من الروابط",
  },
  browser: {
    label: "المتصفح",
    description: "التنقل والنقر والكتابة والتفاعل مع صفحات الويب",
  },
  terminal: {
    label: "الطرفية",
    description: "تنفيذ أوامر الشل والسكريبتات",
  },
  file: {
    label: "عمليات الملفات",
    description: "قراءة وكتابة والبحث وإدارة الملفات",
  },
  code_execution: {
    label: "تنفيذ الكود",
    description: "تنفيذ كود Python والشل مباشرةً",
  },
  vision: { label: "الرؤية", description: "تحليل الصور والمحتوى المرئي" },
  image_gen: {
    label: "توليد الصور",
    description: "توليد صور بـ DALL-E ونماذج أخرى",
  },
  tts: { label: "تحويل النص إلى كلام", description: "تحويل النص إلى صوت منطوق" },
  skills: {
    label: "المهارات",
    description: "إنشاء وإدارة وتنفيذ المهارات القابلة لإعادة الاستخدام",
  },
  memory: {
    label: "الذاكرة",
    description: "تخزين المعرفة الدائمة واستردادها",
  },
  session_search: {
    label: "بحث في الجلسات",
    description: "البحث عبر المحادثات السابقة",
  },
  clarify: {
    label: "أسئلة الاستيضاح",
    description: "طرح أسئلة على المستخدم عند الحاجة",
  },
  delegation: {
    label: "التفويض",
    description: "إنشاء وكلاء فرعيين للمهام المتوازية",
  },
  cronjob: {
    label: "المهام المجدولة",
    description: "إنشاء وإدارة المهام المجدولة",
  },
  moa: {
    label: "مزيج الوكلاء",
    description: "تنسيق عدة نماذج ذكاء اصطناعي معاً",
  },
  todo: {
    label: "تخطيط المهام",
    description: "إنشاء وإدارة قوائم المهام للتكاليف المعقدة",
  },
  mcpServers: "خوادم MCP",
  mcpDescription:
    "خوادم بروتوكول سياق النموذج المُعدَّة في config.yaml. أدرها عبر <code>hermes mcp add/remove</code> في الطرفية.",
  http: "HTTP",
  stdio: "stdio",
  disabled: "معطّل",
} as const;
