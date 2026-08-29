/**
 * i18n.js
 * BizTrack's translation engine.
 *
 * How it works:
 * - Wrap any text you want translated with data-i18n="key.path" (sets textContent).
 * - Use data-i18n-placeholder="key.path" for <input> placeholders.
 * - Use data-i18n-aria-label="key.path" for aria-label attributes.
 * - Use data-i18n-title="key.path" for title attributes.
 * - Drop a <select data-language-switcher></select> anywhere and this file
 *   will populate it with the supported languages and wire it up automatically.
 *
 * The chosen language is stored via storage.js (settings.language) so it
 * persists across every page and reload. Include this script on every page,
 * after storage.js and before your page-specific script.
 */

const SUPPORTED_LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'fr', label: 'Français' },
  { code: 'es', label: 'Español' },
  { code: 'pt', label: 'Português' },
  { code: 'ar', label: 'العربية', rtl: true }
];

const TRANSLATIONS = {
  en: {
    nav: {
      install: 'Install App', signIn: 'Sign in', getStarted: 'Get Started',
      dashboard: 'Dashboard', transactions: 'Transactions', reports: 'Reports',
      settings: 'Settings', logout: 'Log out'
    },
    hero: {
      eyebrow: 'Built for small businesses everywhere',
      title: 'Know where your business money goes.',
      subtitle: 'Track income, expenses and profit from one simple dashboard. No accounting background needed.',
      getStarted: 'Get Started', viewDemo: 'View Demo'
    },
    preview: { income: 'Income', expenses: 'Expenses', profit: 'Profit' },
    steps: {
      eyebrow: 'How it works',
      title: 'Three steps to a clear picture of your business',
      step1Title: 'Record', step1Desc: 'Add your income and expenses.',
      step2Title: 'Track', step2Desc: 'See every transaction in one place.',
      step3Title: 'Understand', step3Desc: 'Know your revenue, expenses and profit.'
    },
    features: {
      eyebrow: 'Features', title: "Everything you need, nothing you don't",
      incomeTitle: 'Income tracking', incomeDesc: 'Log every sale as it happens.',
      expenseTitle: 'Expense tracking', expenseDesc: 'Know exactly where money goes.',
      profitTitle: 'Profit tracking', profitDesc: "See what's really left over.",
      reportsTitle: 'Reports', reportsDesc: 'Breakdown by category, instantly.',
      historyTitle: 'Transaction history', historyDesc: 'Search, filter and sort with ease.',
      dashboardTitle: 'Simple dashboard', dashboardDesc: 'Everything at a glance.'
    },
    cta: { title: 'Start tracking your business today.', getStarted: 'Get Started' },
    footer: { tagline: 'BizTrack V1 — your data stays in this browser.' },
    auth: {
      getStartedFree: "Get started — it's free",
      createAccountTitle: 'Create your account.',
      createAccountSub: 'Start tracking sales, stock and cash in minutes.',
      nameLabel: 'Your name', namePlaceholder: 'Enter your full name',
      usernameLabel: 'Username', usernamePlaceholder: 'Choose a username',
      countryLabel: 'Country', currencyLabel: 'Currency',
      pinLabel: '4-digit PIN', pinPlaceholder: '••••', pinConfirmLabel: 'Confirm PIN',
      signInBtn: 'Sign in →', forgotPin: 'Forgot your PIN?',
      termsAgreePrefix: 'I agree to the', termsLink: 'Terms of Use and Privacy Policy',
      createAccountBtn: 'Create account →', haveAccount: 'Already have an account?',
      welcomeBack: 'Welcome back', signInTitle: 'Sign in to BizTrack.', signInSub: 'Pick up right where you left off.',
      usernamePlaceholderLogin: 'Enter your username', noAccount: "Don't have an account?", createOne: 'Create one',
      recoverTitle: 'Reset your PIN.', recoverSub: 'Enter your username and recovery code to set a new PIN.',
      recoveryCodeLabel: 'Recovery code', newPinLabel: 'New PIN', newPinConfirmLabel: 'Confirm new PIN',
      resetPinBtn: 'Reset PIN →', backToSignIn: 'Back to sign in',
      saveThisNow: 'Save this now', yourRecoveryCode: 'Your recovery code',
      recoveryCodeWarning: "There's no email on this account, so this code is the only way to reset your PIN if you forget it. Write it down or save it somewhere safe — it will not be shown again.",
      copyCode: 'Copy code', savedRecoveryCode: "I've saved my recovery code somewhere safe", continueArrow: 'Continue →',
      accountRecovery: 'Account recovery', pinReset: 'PIN reset',
      yourNewRecoveryCode: 'Your new recovery code',
      newRecoveryCodeWarning: "Your PIN has been reset. Your old recovery code no longer works — here is your new one. Save it somewhere safe, since it won't be shown again.",
      savedNewRecoveryCode: "I've saved my new recovery code somewhere safe", goToSignIn: 'Go to sign in →'
    },
    setup: {
      step1Title: "What's your business called?",
      step1Sub: "This is how it'll show up across your dashboard.",
      businessNameLabel: 'Business name', businessNamePlaceholder: 'e.g. Tobi Fashion',
      continueBtn: 'Continue →',
      step2Title: 'What kind of business is it?',
      step2Sub: "We'll tailor your categories to match.",
      typeRetail: 'Retail', typeService: 'Service', typeFood: 'Food & Drink', typeFreelance: 'Freelance / Other',
      logoLabel: 'Business logo (optional)', uploadLogoBtn: 'Upload logo',
      backBtn: 'Back', finishBtn: 'Finish setup'
    },
    common: {
      save: 'Save', cancel: 'Cancel', delete: 'Delete', edit: 'Edit', add: 'Add',
      search: 'Search', loading: 'Loading…', confirm: 'Confirm', language: 'Language'
    }
  },
  fr: {
    nav: {
      install: "Installer l'application", signIn: 'Se connecter', getStarted: 'Commencer',
      dashboard: 'Tableau de bord', transactions: 'Transactions', reports: 'Rapports',
      settings: 'Paramètres', logout: 'Se déconnecter'
    },
    hero: {
      eyebrow: 'Conçu pour les petites entreprises, partout',
      title: "Sachez où va l'argent de votre entreprise.",
      subtitle: "Suivez vos revenus, dépenses et bénéfices depuis un tableau de bord simple. Aucune notion de comptabilité requise.",
      getStarted: 'Commencer', viewDemo: 'Voir la démo'
    },
    preview: { income: 'Revenus', expenses: 'Dépenses', profit: 'Bénéfice' },
    steps: {
      eyebrow: 'Comment ça marche',
      title: 'Trois étapes pour avoir une vision claire de votre entreprise',
      step1Title: 'Enregistrer', step1Desc: 'Ajoutez vos revenus et vos dépenses.',
      step2Title: 'Suivre', step2Desc: 'Consultez chaque transaction au même endroit.',
      step3Title: 'Comprendre', step3Desc: "Connaissez votre chiffre d'affaires, vos dépenses et votre bénéfice."
    },
    features: {
      eyebrow: 'Fonctionnalités', title: 'Tout ce dont vous avez besoin, rien de superflu',
      incomeTitle: 'Suivi des revenus', incomeDesc: 'Enregistrez chaque vente au fur et à mesure.',
      expenseTitle: 'Suivi des dépenses', expenseDesc: "Sachez exactement où va l'argent.",
      profitTitle: 'Suivi du bénéfice', profitDesc: "Voyez ce qu'il vous reste réellement.",
      reportsTitle: 'Rapports', reportsDesc: 'Répartition par catégorie, instantanément.',
      historyTitle: 'Historique des transactions', historyDesc: 'Recherchez, filtrez et triez facilement.',
      dashboardTitle: 'Tableau de bord simple', dashboardDesc: "Tout en un coup d'œil."
    },
    cta: { title: "Commencez à suivre votre entreprise dès aujourd'hui.", getStarted: 'Commencer' },
    footer: { tagline: 'BizTrack V1 — vos données restent dans ce navigateur.' },
    auth: {
      getStartedFree: "Commencer — c'est gratuit",
      createAccountTitle: 'Créez votre compte.',
      createAccountSub: 'Commencez à suivre vos ventes, votre stock et votre trésorerie en quelques minutes.',
      nameLabel: 'Votre nom', namePlaceholder: 'Entrez votre nom complet',
      usernameLabel: "Nom d'utilisateur", usernamePlaceholder: "Choisissez un nom d'utilisateur",
      countryLabel: 'Pays', currencyLabel: 'Devise',
      pinLabel: 'Code PIN à 4 chiffres', pinPlaceholder: '••••', pinConfirmLabel: 'Confirmer le code PIN',
      signInBtn: 'Se connecter →', forgotPin: 'Code PIN oublié ?',
      termsAgreePrefix: "J'accepte les", termsLink: "Conditions d'utilisation et la Politique de confidentialité",
      createAccountBtn: 'Créer un compte →', haveAccount: 'Vous avez déjà un compte ?',
      welcomeBack: 'Content de vous revoir', signInTitle: 'Connectez-vous à BizTrack.', signInSub: 'Reprenez là où vous vous étiez arrêté.',
      usernamePlaceholderLogin: "Entrez votre nom d'utilisateur", noAccount: "Vous n'avez pas de compte ?", createOne: 'Créez-en un',
      recoverTitle: 'Réinitialisez votre code PIN.', recoverSub: "Entrez votre nom d'utilisateur et votre code de récupération pour définir un nouveau code PIN.",
      recoveryCodeLabel: 'Code de récupération', newPinLabel: 'Nouveau code PIN', newPinConfirmLabel: 'Confirmer le nouveau code PIN',
      resetPinBtn: 'Réinitialiser le PIN →', backToSignIn: 'Retour à la connexion',
      saveThisNow: 'Sauvegardez ceci maintenant', yourRecoveryCode: 'Votre code de récupération',
      recoveryCodeWarning: "Ce compte n'a pas d'e-mail associé, donc ce code est le seul moyen de réinitialiser votre PIN si vous l'oubliez. Notez-le ou sauvegardez-le en lieu sûr — il ne sera plus jamais affiché.",
      copyCode: 'Copier le code', savedRecoveryCode: "J'ai sauvegardé mon code de récupération en lieu sûr", continueArrow: 'Continuer →',
      accountRecovery: 'Récupération de compte', pinReset: 'PIN réinitialisé',
      yourNewRecoveryCode: 'Votre nouveau code de récupération',
      newRecoveryCodeWarning: "Votre PIN a été réinitialisé. Votre ancien code de récupération ne fonctionne plus — voici le nouveau. Sauvegardez-le en lieu sûr, car il ne sera plus jamais affiché.",
      savedNewRecoveryCode: "J'ai sauvegardé mon nouveau code de récupération en lieu sûr", goToSignIn: 'Aller à la connexion →'
    },
    setup: {
      step1Title: "Comment s'appelle votre entreprise ?",
      step1Sub: "C'est ainsi qu'elle apparaîtra dans votre tableau de bord.",
      businessNameLabel: "Nom de l'entreprise", businessNamePlaceholder: 'ex. Tobi Fashion',
      continueBtn: 'Continuer →',
      step2Title: "Quel type d'entreprise est-ce ?",
      step2Sub: 'Nous adapterons vos catégories en conséquence.',
      typeRetail: 'Commerce de détail', typeService: 'Services', typeFood: 'Restauration', typeFreelance: 'Freelance / Autre',
      logoLabel: "Logo de l'entreprise (facultatif)", uploadLogoBtn: 'Téléverser un logo',
      backBtn: 'Retour', finishBtn: 'Terminer la configuration'
    },
    common: {
      save: 'Enregistrer', cancel: 'Annuler', delete: 'Supprimer', edit: 'Modifier', add: 'Ajouter',
      search: 'Rechercher', loading: 'Chargement…', confirm: 'Confirmer', language: 'Langue'
    }
  },
  es: {
    nav: {
      install: 'Instalar app', signIn: 'Iniciar sesión', getStarted: 'Comenzar',
      dashboard: 'Panel', transactions: 'Transacciones', reports: 'Informes',
      settings: 'Configuración', logout: 'Cerrar sesión'
    },
    hero: {
      eyebrow: 'Hecho para pequeñas empresas en todas partes',
      title: 'Sepa a dónde va el dinero de su negocio.',
      subtitle: 'Controle ingresos, gastos y ganancias desde un panel simple. No se necesitan conocimientos de contabilidad.',
      getStarted: 'Comenzar', viewDemo: 'Ver demo'
    },
    preview: { income: 'Ingresos', expenses: 'Gastos', profit: 'Ganancia' },
    steps: {
      eyebrow: 'Cómo funciona',
      title: 'Tres pasos para tener una visión clara de su negocio',
      step1Title: 'Registrar', step1Desc: 'Agregue sus ingresos y gastos.',
      step2Title: 'Seguir', step2Desc: 'Vea cada transacción en un solo lugar.',
      step3Title: 'Entender', step3Desc: 'Conozca sus ingresos, gastos y ganancias.'
    },
    features: {
      eyebrow: 'Funciones', title: 'Todo lo que necesita, nada de más',
      incomeTitle: 'Seguimiento de ingresos', incomeDesc: 'Registre cada venta al instante.',
      expenseTitle: 'Seguimiento de gastos', expenseDesc: 'Sepa exactamente a dónde va el dinero.',
      profitTitle: 'Seguimiento de ganancias', profitDesc: 'Vea lo que realmente le queda.',
      reportsTitle: 'Informes', reportsDesc: 'Desglose por categoría, al instante.',
      historyTitle: 'Historial de transacciones', historyDesc: 'Busque, filtre y ordene con facilidad.',
      dashboardTitle: 'Panel sencillo', dashboardDesc: 'Todo de un vistazo.'
    },
    cta: { title: 'Empiece a controlar su negocio hoy mismo.', getStarted: 'Comenzar' },
    footer: { tagline: 'BizTrack V1 — sus datos permanecen en este navegador.' },
    auth: {
      getStartedFree: 'Empezar — es gratis',
      createAccountTitle: 'Cree su cuenta.',
      createAccountSub: 'Comience a controlar ventas, inventario y efectivo en minutos.',
      nameLabel: 'Su nombre', namePlaceholder: 'Ingrese su nombre completo',
      usernameLabel: 'Nombre de usuario', usernamePlaceholder: 'Elija un nombre de usuario',
      countryLabel: 'País', currencyLabel: 'Moneda',
      pinLabel: 'PIN de 4 dígitos', pinPlaceholder: '••••', pinConfirmLabel: 'Confirmar PIN',
      signInBtn: 'Iniciar sesión →', forgotPin: '¿Olvidó su PIN?',
      termsAgreePrefix: 'Acepto los', termsLink: 'Términos de Uso y la Política de Privacidad',
      createAccountBtn: 'Crear cuenta →', haveAccount: '¿Ya tiene una cuenta?',
      welcomeBack: 'Bienvenido de nuevo', signInTitle: 'Inicie sesión en BizTrack.', signInSub: 'Continúe donde lo dejó.',
      usernamePlaceholderLogin: 'Ingrese su nombre de usuario', noAccount: '¿No tiene una cuenta?', createOne: 'Cree una',
      recoverTitle: 'Restablezca su PIN.', recoverSub: 'Ingrese su nombre de usuario y código de recuperación para establecer un nuevo PIN.',
      recoveryCodeLabel: 'Código de recuperación', newPinLabel: 'Nuevo PIN', newPinConfirmLabel: 'Confirmar nuevo PIN',
      resetPinBtn: 'Restablecer PIN →', backToSignIn: 'Volver a iniciar sesión',
      saveThisNow: 'Guarde esto ahora', yourRecoveryCode: 'Su código de recuperación',
      recoveryCodeWarning: 'No hay correo electrónico en esta cuenta, así que este código es la única forma de restablecer su PIN si lo olvida. Anótelo o guárdelo en un lugar seguro — no se mostrará de nuevo.',
      copyCode: 'Copiar código', savedRecoveryCode: 'He guardado mi código de recuperación en un lugar seguro', continueArrow: 'Continuar →',
      accountRecovery: 'Recuperación de cuenta', pinReset: 'PIN restablecido',
      yourNewRecoveryCode: 'Su nuevo código de recuperación',
      newRecoveryCodeWarning: 'Su PIN ha sido restablecido. Su antiguo código de recuperación ya no funciona — aquí está el nuevo. Guárdelo en un lugar seguro, ya que no se mostrará de nuevo.',
      savedNewRecoveryCode: 'He guardado mi nuevo código de recuperación en un lugar seguro', goToSignIn: 'Ir a iniciar sesión →'
    },
    setup: {
      step1Title: '¿Cómo se llama su negocio?',
      step1Sub: 'Así es como aparecerá en su panel.',
      businessNameLabel: 'Nombre del negocio', businessNamePlaceholder: 'ej. Tobi Fashion',
      continueBtn: 'Continuar →',
      step2Title: '¿Qué tipo de negocio es?',
      step2Sub: 'Adaptaremos sus categorías en consecuencia.',
      typeRetail: 'Comercio minorista', typeService: 'Servicios', typeFood: 'Comida y bebida', typeFreelance: 'Freelance / Otro',
      logoLabel: 'Logo del negocio (opcional)', uploadLogoBtn: 'Subir logo',
      backBtn: 'Atrás', finishBtn: 'Finalizar configuración'
    },
    common: {
      save: 'Guardar', cancel: 'Cancelar', delete: 'Eliminar', edit: 'Editar', add: 'Agregar',
      search: 'Buscar', loading: 'Cargando…', confirm: 'Confirmar', language: 'Idioma'
    }
  },
  pt: {
    nav: {
      install: 'Instalar app', signIn: 'Entrar', getStarted: 'Começar',
      dashboard: 'Painel', transactions: 'Transações', reports: 'Relatórios',
      settings: 'Configurações', logout: 'Sair'
    },
    hero: {
      eyebrow: 'Feito para pequenas empresas em todo lugar',
      title: 'Saiba para onde vai o dinheiro do seu negócio.',
      subtitle: 'Acompanhe receitas, despesas e lucro em um painel simples. Não é necessário conhecimento em contabilidade.',
      getStarted: 'Começar', viewDemo: 'Ver demonstração'
    },
    preview: { income: 'Receita', expenses: 'Despesas', profit: 'Lucro' },
    steps: {
      eyebrow: 'Como funciona',
      title: 'Três passos para uma visão clara do seu negócio',
      step1Title: 'Registrar', step1Desc: 'Adicione suas receitas e despesas.',
      step2Title: 'Acompanhar', step2Desc: 'Veja cada transação em um só lugar.',
      step3Title: 'Entender', step3Desc: 'Conheça sua receita, despesas e lucro.'
    },
    features: {
      eyebrow: 'Recursos', title: 'Tudo o que você precisa, nada além disso',
      incomeTitle: 'Controle de receitas', incomeDesc: 'Registre cada venda instantaneamente.',
      expenseTitle: 'Controle de despesas', expenseDesc: 'Saiba exatamente para onde vai o dinheiro.',
      profitTitle: 'Controle de lucro', profitDesc: 'Veja o que realmente sobra.',
      reportsTitle: 'Relatórios', reportsDesc: 'Detalhamento por categoria, instantaneamente.',
      historyTitle: 'Histórico de transações', historyDesc: 'Pesquise, filtre e ordene com facilidade.',
      dashboardTitle: 'Painel simples', dashboardDesc: 'Tudo em um só lugar.'
    },
    cta: { title: 'Comece a acompanhar seu negócio hoje.', getStarted: 'Começar' },
    footer: { tagline: 'BizTrack V1 — seus dados ficam neste navegador.' },
    auth: {
      getStartedFree: 'Começar — é grátis',
      createAccountTitle: 'Crie sua conta.',
      createAccountSub: 'Comece a acompanhar vendas, estoque e caixa em minutos.',
      nameLabel: 'Seu nome', namePlaceholder: 'Digite seu nome completo',
      usernameLabel: 'Nome de usuário', usernamePlaceholder: 'Escolha um nome de usuário',
      countryLabel: 'País', currencyLabel: 'Moeda',
      pinLabel: 'PIN de 4 dígitos', pinPlaceholder: '••••', pinConfirmLabel: 'Confirmar PIN',
      signInBtn: 'Entrar →', forgotPin: 'Esqueceu seu PIN?',
      termsAgreePrefix: 'Concordo com os', termsLink: 'Termos de Uso e a Política de Privacidade',
      createAccountBtn: 'Criar conta →', haveAccount: 'Já tem uma conta?',
      welcomeBack: 'Bem-vindo de volta', signInTitle: 'Entre no BizTrack.', signInSub: 'Continue de onde parou.',
      usernamePlaceholderLogin: 'Digite seu nome de usuário', noAccount: 'Não tem uma conta?', createOne: 'Crie uma',
      recoverTitle: 'Redefina seu PIN.', recoverSub: 'Digite seu nome de usuário e código de recuperação para definir um novo PIN.',
      recoveryCodeLabel: 'Código de recuperação', newPinLabel: 'Novo PIN', newPinConfirmLabel: 'Confirmar novo PIN',
      resetPinBtn: 'Redefinir PIN →', backToSignIn: 'Voltar para o login',
      saveThisNow: 'Salve isso agora', yourRecoveryCode: 'Seu código de recuperação',
      recoveryCodeWarning: 'Não há e-mail nesta conta, então este código é a única forma de redefinir seu PIN caso o esqueça. Anote-o ou salve-o em um lugar seguro — ele não será mostrado novamente.',
      copyCode: 'Copiar código', savedRecoveryCode: 'Salvei meu código de recuperação em um lugar seguro', continueArrow: 'Continuar →',
      accountRecovery: 'Recuperação de conta', pinReset: 'PIN redefinido',
      yourNewRecoveryCode: 'Seu novo código de recuperação',
      newRecoveryCodeWarning: 'Seu PIN foi redefinido. Seu código de recuperação antigo não funciona mais — aqui está o novo. Salve-o em um lugar seguro, pois não será mostrado novamente.',
      savedNewRecoveryCode: 'Salvei meu novo código de recuperação em um lugar seguro', goToSignIn: 'Ir para o login →'
    },
    setup: {
      step1Title: 'Qual é o nome do seu negócio?',
      step1Sub: 'É assim que ele aparecerá no seu painel.',
      businessNameLabel: 'Nome do negócio', businessNamePlaceholder: 'ex. Tobi Fashion',
      continueBtn: 'Continuar →',
      step2Title: 'Que tipo de negócio é?',
      step2Sub: 'Vamos ajustar suas categorias de acordo.',
      typeRetail: 'Varejo', typeService: 'Serviços', typeFood: 'Alimentação e bebidas', typeFreelance: 'Freelance / Outro',
      logoLabel: 'Logotipo do negócio (opcional)', uploadLogoBtn: 'Enviar logotipo',
      backBtn: 'Voltar', finishBtn: 'Concluir configuração'
    },
    common: {
      save: 'Salvar', cancel: 'Cancelar', delete: 'Excluir', edit: 'Editar', add: 'Adicionar',
      search: 'Pesquisar', loading: 'Carregando…', confirm: 'Confirmar', language: 'Idioma'
    }
  },
  ar: {
    nav: {
      install: 'تثبيت التطبيق', signIn: 'تسجيل الدخول', getStarted: 'ابدأ الآن',
      dashboard: 'لوحة التحكم', transactions: 'المعاملات', reports: 'التقارير',
      settings: 'الإعدادات', logout: 'تسجيل الخروج'
    },
    hero: {
      eyebrow: 'مصمم للشركات الصغيرة في كل مكان',
      title: 'اعرف إلى أين تذهب أموال عملك.',
      subtitle: 'تتبع الإيرادات والمصروفات والأرباح من لوحة تحكم بسيطة واحدة. لا حاجة لخلفية محاسبية.',
      getStarted: 'ابدأ الآن', viewDemo: 'عرض تجريبي'
    },
    preview: { income: 'الإيرادات', expenses: 'المصروفات', profit: 'الربح' },
    steps: {
      eyebrow: 'كيف يعمل',
      title: 'ثلاث خطوات للحصول على صورة واضحة لعملك',
      step1Title: 'سجّل', step1Desc: 'أضف إيراداتك ومصروفاتك.',
      step2Title: 'تتبّع', step2Desc: 'شاهد كل معاملة في مكان واحد.',
      step3Title: 'افهم', step3Desc: 'اعرف إيراداتك ومصروفاتك وأرباحك.'
    },
    features: {
      eyebrow: 'الميزات', title: 'كل ما تحتاجه، ولا شيء أكثر من ذلك',
      incomeTitle: 'تتبع الإيرادات', incomeDesc: 'سجّل كل عملية بيع فور حدوثها.',
      expenseTitle: 'تتبع المصروفات', expenseDesc: 'اعرف بالضبط إلى أين تذهب الأموال.',
      profitTitle: 'تتبع الأرباح', profitDesc: 'شاهد ما يتبقى لك فعليًا.',
      reportsTitle: 'التقارير', reportsDesc: 'تفصيل حسب الفئة، فوريًا.',
      historyTitle: 'سجل المعاملات', historyDesc: 'ابحث وصفِّ ورتّب بسهولة.',
      dashboardTitle: 'لوحة تحكم بسيطة', dashboardDesc: 'كل شيء في لمحة واحدة.'
    },
    cta: { title: 'ابدأ بتتبع عملك اليوم.', getStarted: 'ابدأ الآن' },
    footer: { tagline: 'BizTrack V1 — تبقى بياناتك في هذا المتصفح.' },
    auth: {
      getStartedFree: 'ابدأ الآن — مجانًا',
      createAccountTitle: 'أنشئ حسابك.',
      createAccountSub: 'ابدأ بتتبع المبيعات والمخزون والنقد في دقائق.',
      nameLabel: 'اسمك', namePlaceholder: 'أدخل اسمك الكامل',
      usernameLabel: 'اسم المستخدم', usernamePlaceholder: 'اختر اسم مستخدم',
      countryLabel: 'الدولة', currencyLabel: 'العملة',
      pinLabel: 'رمز PIN المكون من 4 أرقام', pinPlaceholder: '••••', pinConfirmLabel: 'تأكيد رمز PIN',
      signInBtn: 'تسجيل الدخول ←', forgotPin: 'هل نسيت رمز PIN؟',
      termsAgreePrefix: 'أوافق على', termsLink: 'شروط الاستخدام وسياسة الخصوصية',
      createAccountBtn: 'إنشاء حساب ←', haveAccount: 'هل لديك حساب بالفعل؟',
      welcomeBack: 'مرحبًا بعودتك', signInTitle: 'سجّل الدخول إلى BizTrack.', signInSub: 'تابع من حيث توقفت.',
      usernamePlaceholderLogin: 'أدخل اسم المستخدم', noAccount: 'ليس لديك حساب؟', createOne: 'أنشئ واحدًا',
      recoverTitle: 'إعادة تعيين رمز PIN الخاص بك.', recoverSub: 'أدخل اسم المستخدم ورمز الاسترداد لتعيين رمز PIN جديد.',
      recoveryCodeLabel: 'رمز الاسترداد', newPinLabel: 'رمز PIN جديد', newPinConfirmLabel: 'تأكيد رمز PIN الجديد',
      resetPinBtn: 'إعادة تعيين رمز PIN ←', backToSignIn: 'العودة لتسجيل الدخول',
      saveThisNow: 'احفظ هذا الآن', yourRecoveryCode: 'رمز الاسترداد الخاص بك',
      recoveryCodeWarning: 'لا يوجد بريد إلكتروني مرتبط بهذا الحساب، لذا فإن هذا الرمز هو الطريقة الوحيدة لإعادة تعيين رمز PIN الخاص بك في حال نسيانه. اكتبه أو احفظه في مكان آمن — لن يتم عرضه مرة أخرى.',
      copyCode: 'نسخ الرمز', savedRecoveryCode: 'لقد حفظت رمز الاسترداد الخاص بي في مكان آمن', continueArrow: 'متابعة ←',
      accountRecovery: 'استرداد الحساب', pinReset: 'تمت إعادة تعيين رمز PIN',
      yourNewRecoveryCode: 'رمز الاسترداد الجديد الخاص بك',
      newRecoveryCodeWarning: 'تمت إعادة تعيين رمز PIN الخاص بك. لم يعد رمز الاسترداد القديم يعمل — إليك الرمز الجديد. احفظه في مكان آمن، لأنه لن يتم عرضه مرة أخرى.',
      savedNewRecoveryCode: 'لقد حفظت رمز الاسترداد الجديد في مكان آمن', goToSignIn: 'الذهاب لتسجيل الدخول ←'
    },
    setup: {
      step1Title: 'ما اسم عملك؟',
      step1Sub: 'هكذا سيظهر في لوحة التحكم الخاصة بك.',
      businessNameLabel: 'اسم العمل', businessNamePlaceholder: 'مثال: Tobi Fashion',
      continueBtn: 'متابعة ←',
      step2Title: 'ما نوع هذا العمل؟',
      step2Sub: 'سنخصص فئاتك لتناسبه.',
      typeRetail: 'تجارة تجزئة', typeService: 'خدمات', typeFood: 'طعام ومشروبات', typeFreelance: 'عمل حر / أخرى',
      logoLabel: 'شعار العمل (اختياري)', uploadLogoBtn: 'رفع الشعار',
      backBtn: 'رجوع', finishBtn: 'إنهاء الإعداد'
    },
    common: {
      save: 'حفظ', cancel: 'إلغاء', delete: 'حذف', edit: 'تعديل', add: 'إضافة',
      search: 'بحث', loading: 'جارٍ التحميل…', confirm: 'تأكيد', language: 'اللغة'
    }
  }
};

function getCurrentLanguage() {
  const settings = getSettings();
  return settings.language || 'en';
}

function setLanguage(code) {
  saveSettings({ language: code });
  applyLanguage();
}

/** Look up a key like "setup.step1Title", falling back to English, then to the key itself. */
function t(key, fallback) {
  const lookup = (dict) => key.split('.').reduce(
    (obj, part) => (obj && obj[part] !== undefined ? obj[part] : undefined),
    dict
  );
  const lang = getCurrentLanguage();
  const value = lookup(TRANSLATIONS[lang] || TRANSLATIONS.en);
  if (value !== undefined) return value;
  const enValue = lookup(TRANSLATIONS.en);
  return enValue !== undefined ? enValue : (fallback || key);
}

/** Re-render every translatable element on the page and sync any language switchers. */
function applyLanguage() {
  const lang = getCurrentLanguage();
  const langMeta = SUPPORTED_LANGUAGES.find((l) => l.code === lang) || SUPPORTED_LANGUAGES[0];

  document.documentElement.setAttribute('lang', lang);
  document.documentElement.setAttribute('dir', langMeta.rtl ? 'rtl' : 'ltr');

  document.querySelectorAll('[data-i18n]').forEach((el) => {
    el.textContent = t(el.getAttribute('data-i18n'));
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach((el) => {
    el.setAttribute('placeholder', t(el.getAttribute('data-i18n-placeholder')));
  });
  document.querySelectorAll('[data-i18n-aria-label]').forEach((el) => {
    el.setAttribute('aria-label', t(el.getAttribute('data-i18n-aria-label')));
  });
  document.querySelectorAll('[data-i18n-title]').forEach((el) => {
    el.setAttribute('title', t(el.getAttribute('data-i18n-title')));
  });

  document.querySelectorAll('[data-language-switcher]').forEach((select) => {
    if (!select.options.length) {
      SUPPORTED_LANGUAGES.forEach((l) => {
        const opt = document.createElement('option');
        opt.value = l.code;
        opt.textContent = l.label;
        select.appendChild(opt);
      });
      select.addEventListener('change', () => setLanguage(select.value));
    }
    select.value = lang;
  });
}

document.addEventListener('DOMContentLoaded', applyLanguage);
