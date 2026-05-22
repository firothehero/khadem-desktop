export default {
  title: "الذاكرة",
  subtitle:
    "ما يتذكره خادم عنك وعن بيئتك عبر الجلسات.",
  sessions: "الجلسات",
  messages: "الرسائل",
  memories: "الذكريات",
  providersTitle: "المزودون",
  agentMemory: "ذاكرة الوكيل",
  userProfile: "الملف الشخصي",
  entries: "{{count}} مدخل",
  addMemory: "إضافة ذاكرة",
  addFailed: "فشل إضافة المدخل",
  updateFailed: "فشل تحديث المدخل",
  saveFailed: "فشل الحفظ",
  entriesPlaceholder:
    "مثال: المستخدم يُفضّل TypeScript على JavaScript. استخدم الوضع الصارم دائماً.",
  userProfilePlaceholder:
    "مثال: الاسم: أحمد. مطوّر أول. يُفضّل الإجابات المختصرة. يستخدم macOS مع zsh. المنطقة الزمنية: AST.",
  noProvidersFound: "لم يُعثر على مزودي ذاكرة في هذا التثبيت.",
  openProviderWebsite: "فتح موقع المزوّد",
  noMemoriesYet:
    "لا توجد ذكريات بعد. سيحفظ خادم المعلومات المهمة أثناء المحادثة.",
  noMemoryEntries: "لا توجد مدخلات في الذاكرة بعد.",
  noToolsetsFound: "لم يُعثر على مجموعات أدوات.",
  addManuallyHint: "يمكنك أيضاً إضافة ذكريات يدوياً باستخدام الزر أعلاه.",
  userProfileHint:
    "أخبر خادم عن نفسك — الاسم والدور والتفضيلات وأسلوب التواصل.",
  providersHint:
    "مزودو الذاكرة القابلون للتوصيل يمنحون خادم ذاكرة طويلة الأمد متقدمة. الذاكرة المدمجة (أعلاه) دائماً نشطة إلى جانب المزوّد المختار.",
  providersHintActive: "نشط: <strong>{{provider}}</strong>",
  providersHintInactive: "لا يوجد مزوّد خارجي نشط — يستخدم المدمج فقط.",
  enterEnvKey: "أدخل {{key}}",
  chars: "{{count}} حرف",
  cancel: "إلغاء",
  save: "حفظ",
  edit: "تعديل",
  deleteConfirm: "حذف؟",
  yes: "نعم",
  no: "لا",
  saveProfile: "حفظ الملف الشخصي",
  active: "نشط",
  deactivate: "تعطيل",
  activating: "جارٍ التفعيل...",
  activate: "تفعيل",
  providers: {
    honcho:
      "نمذجة مستخدم ذكاء اصطناعي عبر الجلسات مع بحث دلالي وحوار جدلي",
    hindsight:
      "ذاكرة طويلة الأمد مع رسم بياني للمعرفة واسترجاع متعدد الاستراتيجيات",
    mem0: "استخراج حقائق من النماذج اللغوية من جهة الخادم مع بحث دلالي وإزالة التكرار تلقائياً",
    retaindb: "واجهة API لذاكرة سحابية مع بحث هجين و7 أنواع ذاكرة",
    supermemory:
      "ذاكرة دلالية طويلة الأمد مع استرجاع الملف الشخصي واستخراج الكيانات",
    holographic:
      "مخزن حقائق SQLite محلي مع بحث FTS5 وتقييم الثقة (لا يحتاج مفتاح API)",
    openviking:
      "ذاكرة مُدارة بالجلسة مع استرجاع متدرج وتصفح المعرفة",
    byterover: "شجرة معرفة دائمة مع استرجاع متدرج عبر أداة brv",
  },
} as const;
