import { AnalyzeScreen, AssetScreen, GiftScreen, InterestUsdActiveScreen, InterestUsdScreen, OrderScreen, RiskProfileScreen, TradeScreen } from '../screens/invest/TradeScreens'
import { AssetListScreen, GoalScreen, GoalsScreen, InvestScreen, InvestSearchScreen, LearnScreen, LessonScreen, PortfolioScreen } from '../screens/invest/InvestScreens'
import { ChatScreen, InvitationsScreen, InviteContactsScreen, InviteIntroScreen, InviteScreen, UsernameScreen } from '../screens/invite/InviteScreens'
import { DeferScreen, MsiDetailScreen, MsiHubScreen, MsiPartnerScreen, WithdrawFlowScreen, WithdrawIntroScreen } from '../screens/msi/MsiScreens'
import {
  AvatarScreen, BackgroundScreen, ChangePasscodeScreen, CustomizationScreen, EditEmailScreen, EditPhoneScreen, NotificationsScreen, PersonalDetailsScreen, ProfileLegalScreen, ProfileScreen, SettingsScreen,
} from '../screens/profile/ProfileScreens'
import { BeneficiariesScreen, DestinationsScreen, SecurityLimitScreen, SecurityScreen } from '../screens/profile/SecurityScreens'
import {
  CashbackIntroScreen, CashbackScreen, ChooseCashbackScreen, GreatChoiceScreen, MsiCashbackScreen, PartnerCategoryScreen, PartnerScreen, PartnersScreen, PlusManageScreen, PlusScreen, SelectedCategoriesScreen,
} from '../screens/rewards/RewardScreens'
import type { AppRoute } from './routes'

// Recompensas, MSI, inversiones, perfil, invitaciones y chat.
export const moreRoutes: AppRoute[] = [
  // Cashback y Plata+
  { path: '/cashback/intro', element: <CashbackIntroScreen />, presentation: 'modal', refs: ['PLT-0024', 'PLT-P-74c213'] },
  { path: '/cashback/choose', element: <ChooseCashbackScreen />, presentation: 'modal', refs: ['PLT-0025', 'PLT-0026', 'PLT-0027', 'PLT-0028', 'PLT-0033', 'PLT-0034', 'PLT-0035', 'PLT-P-74c215', 'PLT-P-74c217', 'PLT-P-74c219', 'PLT-P-74c21b', 'PLT-P-74c227', 'PLT-P-74c229', 'PLT-P-74c22b'] },
  { path: '/cashback/great', element: <GreatChoiceScreen />, presentation: 'fade', refs: ['PLT-0036', 'PLT-0037', 'PLT-0039', 'PLT-P-74c22d', 'PLT-P-74c22f', 'PLT-P-74c231'] },
  { path: '/cashback/selected', element: <SelectedCategoriesScreen />, presentation: 'modal', refs: ['PLT-P-74c239', 'PLT-P-74c23a', 'PLT-P-74c23f', 'PLT-P-eddc4a'] },
  { path: '/cashback/partners', element: <PartnersScreen />, refs: ['PLT-P-74c244', 'PLT-P-74c247', 'PLT-P-74c248', 'PLT-P-a1e45d', 'PLT-P-a1e45f', 'PLT-P-74c25d'] },
  { path: '/cashback/partners/:cat', element: <PartnerCategoryScreen />, refs: ['PLT-P-a1e464'], sample: '/cashback/partners/Travel' },
  { path: '/cashback', element: <CashbackScreen />, presentation: 'modal', refs: ['PLT-0131', 'PLT-0406', 'PLT-0407', 'PLT-0408', 'PLT-0525', 'PLT-P-74c234', 'PLT-P-74c236', 'PLT-P-74c237', 'PLT-P-74c265'] },
  { path: '/partner/:id', element: <PartnerScreen />, refs: ['PLT-P-74c25a', 'PLT-P-74c25b'], sample: '/partner/shein' },
  { path: '/msi-cashback', element: <MsiCashbackScreen />, refs: ['PLT-P-74c263', 'PLT-P-d616ab'] },
  { path: '/plus', element: <PlusScreen />, presentation: 'modal', refs: ['PLT-0029', 'PLT-0030', 'PLT-0031', 'PLT-0032', 'PLT-0417', 'PLT-P-74c21d', 'PLT-P-74c21f', 'PLT-P-74c221', 'PLT-P-74c223', 'PLT-P-68567c', 'PLT-P-145e15', 'PLT-P-145e17', 'PLT-P-145e19', 'PLT-P-145e5f', 'PLT-P-a0d06f', 'PLT-P-a0d072'] },
  { path: '/plus/manage', element: <PlusManageScreen />, presentation: 'modal', refs: ['PLT-P-a0d076'] },
  // MSI
  { path: '/msi', element: <MsiHubScreen />, refs: [] },
  { path: '/msi/defer', element: <DeferScreen />, presentation: 'modal', refs: ['PLT-P-a0ea84', 'PLT-P-a0ea86', 'PLT-P-a0ea9f', 'PLT-P-d6161e', 'PLT-P-d61618'] },
  { path: '/msi/withdraw', element: <WithdrawIntroScreen />, presentation: 'modal', refs: ['PLT-0200'] },
  { path: '/msi/withdraw/amount', element: <WithdrawFlowScreen />, presentation: 'modal', refs: ['PLT-0201', 'PLT-0202', 'PLT-0203', 'PLT-0204', 'PLT-0713', 'PLT-0714', 'PLT-0715'] },
  { path: '/msi/partner/:id', element: <MsiPartnerScreen />, refs: ['PLT-P-d61612', 'PLT-P-d61616'], sample: '/msi/partner/clip' },
  { path: '/msi/:id', element: <MsiDetailScreen />, presentation: 'modal', refs: ['PLT-0716', 'PLT-P-686357'], sample: '/msi/msi-uber' },
  // Inversiones
  { path: '/invest', element: <InvestScreen />, tab: true, refs: ['PLT-0490', 'PLT-0556', 'PLT-0557', 'PLT-0558', 'PLT-0559', 'PLT-0560', 'PLT-0581', 'PLT-0666'] },
  { path: '/invest/portfolio', element: <PortfolioScreen />, refs: ['PLT-0561', 'PLT-0562', 'PLT-0579', 'PLT-0580', 'PLT-0667', 'PLT-0668', 'PLT-0669', 'PLT-0701', 'PLT-0706', 'PLT-0707'] },
  { path: '/invest/analyze', element: <AnalyzeScreen />, refs: ['PLT-0670', 'PLT-0671', 'PLT-0672', 'PLT-0673', 'PLT-0695', 'PLT-0696', 'PLT-0697', 'PLT-0698'] },
  { path: '/invest/risk', element: <RiskProfileScreen />, presentation: 'modal', refs: ['PLT-0674', 'PLT-0675', 'PLT-0676', 'PLT-0677', 'PLT-0678', 'PLT-0679', 'PLT-0680', 'PLT-0681', 'PLT-0682', 'PLT-0683', 'PLT-0684', 'PLT-0685', 'PLT-0686', 'PLT-0687', 'PLT-0688', 'PLT-0689', 'PLT-0690', 'PLT-0691', 'PLT-0692', 'PLT-0693', 'PLT-0694'] },
  { path: '/invest/interest', element: <InterestUsdScreen />, presentation: 'modal', refs: ['PLT-0699', 'PLT-0700'] },
  { path: '/invest/interest/active', element: <InterestUsdActiveScreen />, refs: ['PLT-0702'] },
  { path: '/invest/asset/:sym', element: <AssetScreen />, refs: ['PLT-0586', 'PLT-0589', 'PLT-0617', 'PLT-0618', 'PLT-0619', 'PLT-0620', 'PLT-0621', 'PLT-0622', 'PLT-0623', 'PLT-0624', 'PLT-0625', 'PLT-0626', 'PLT-0627', 'PLT-0628', 'PLT-0629', 'PLT-0630', 'PLT-0631', 'PLT-0632', 'PLT-0633', 'PLT-0634', 'PLT-0635', 'PLT-0636', 'PLT-0637', 'PLT-0638', 'PLT-0645'], sample: '/invest/asset/GOOGL' },
  { path: '/invest/trade/:sym', element: <TradeScreen />, presentation: 'modal', refs: ['PLT-0572', 'PLT-0573', 'PLT-0574', 'PLT-0575', 'PLT-0576', 'PLT-0577', 'PLT-0578', 'PLT-0639', 'PLT-0640', 'PLT-0641', 'PLT-0642', 'PLT-0643', 'PLT-0644', 'PLT-0646', 'PLT-0647', 'PLT-0648', 'PLT-0649', 'PLT-0650', 'PLT-0651', 'PLT-0652', 'PLT-0653', 'PLT-0654', 'PLT-0655', 'PLT-0656', 'PLT-0657', 'PLT-0658', 'PLT-0659', 'PLT-0660', 'PLT-0661', 'PLT-0662'], sample: '/invest/trade/GOOGL?side=buy' },
  { path: '/invest/order/:id', element: <OrderScreen />, presentation: 'modal', refs: ['PLT-0703', 'PLT-0704', 'PLT-0705'] },
  { path: '/invest/gift', element: <GiftScreen />, presentation: 'modal', refs: ['PLT-0563', 'PLT-0564', 'PLT-0565', 'PLT-0566', 'PLT-0567', 'PLT-0568', 'PLT-0569', 'PLT-0570', 'PLT-0571'] },
  { path: '/invest/list/:id', element: <AssetListScreen />, refs: ['PLT-0592', 'PLT-0597', 'PLT-0598', 'PLT-0599', 'PLT-0608', 'PLT-0609', 'PLT-0610', 'PLT-0613'], sample: '/invest/list/most-popular' },
  { path: '/invest/search', element: <InvestSearchScreen />, presentation: 'fade', refs: ['PLT-0664', 'PLT-0665'] },
  { path: '/invest/goals', element: <GoalsScreen />, refs: ['PLT-0582'] },
  { path: '/invest/goal/:id', element: <GoalScreen />, refs: ['PLT-0583', 'PLT-0584', 'PLT-0585', 'PLT-0587', 'PLT-0588', 'PLT-0590', 'PLT-0591', 'PLT-0593', 'PLT-0594', 'PLT-0595', 'PLT-0596'], sample: '/invest/goal/grow' },
  { path: '/invest/learn', element: <LearnScreen />, refs: ['PLT-0615', 'PLT-0616'] },
  { path: '/invest/lesson/:id', element: <LessonScreen />, presentation: 'modal', refs: ['PLT-0600', 'PLT-0601', 'PLT-0602', 'PLT-0603', 'PLT-0604', 'PLT-0605', 'PLT-0606', 'PLT-0607'], sample: '/invest/lesson/buy' },
  // Perfil
  { path: '/profile', element: <ProfileScreen />, refs: ['PLT-0415', 'PLT-0416', 'PLT-0423', 'PLT-0424', 'PLT-0429', 'PLT-0481', 'PLT-0493', 'PLT-0500', 'PLT-0553', 'PLT-0554'] },
  { path: '/profile/avatar', element: <AvatarScreen />, presentation: 'modal', refs: ['PLT-0418', 'PLT-0419', 'PLT-0420', 'PLT-0421', 'PLT-0426', 'PLT-0427', 'PLT-0428'] },
  { path: '/profile/details', element: <PersonalDetailsScreen />, presentation: 'modal', refs: ['PLT-0432'] },
  { path: '/profile/phone', element: <EditPhoneScreen />, presentation: 'modal', refs: ['PLT-0433'] },
  { path: '/profile/email', element: <EditEmailScreen />, presentation: 'modal', refs: ['PLT-0434'] },
  { path: '/profile/legal', element: <ProfileLegalScreen />, presentation: 'modal', refs: ['PLT-0501'] },
  { path: '/security', element: <SecurityScreen />, presentation: 'modal', refs: ['PLT-0437', 'PLT-0438', 'PLT-0443', 'PLT-0444', 'PLT-0450', 'PLT-0451'] },
  { path: '/security/limit/:type', element: <SecurityLimitScreen />, presentation: 'modal', refs: ['PLT-0439', 'PLT-0440', 'PLT-0441', 'PLT-0442', 'PLT-0445', 'PLT-0446', 'PLT-0447', 'PLT-0448', 'PLT-0449', 'PLT-0452'], sample: '/security/limit/transactional' },
  { path: '/security/beneficiaries', element: <BeneficiariesScreen />, presentation: 'modal', refs: ['PLT-0453', 'PLT-0454', 'PLT-0455', 'PLT-0456', 'PLT-0457'] },
  { path: '/destinations', element: <DestinationsScreen />, presentation: 'modal', refs: ['PLT-0458', 'PLT-0459', 'PLT-0460', 'PLT-0461', 'PLT-0463', 'PLT-0464'] },
  { path: '/settings', element: <SettingsScreen />, presentation: 'modal', refs: ['PLT-0465', 'PLT-0466', 'PLT-0472'] },
  { path: '/settings/passcode', element: <ChangePasscodeScreen />, presentation: 'modal', refs: ['PLT-0467', 'PLT-0468', 'PLT-0469', 'PLT-0470', 'PLT-0471'] },
  { path: '/customization', element: <CustomizationScreen />, refs: ['PLT-0473', 'PLT-0479', 'PLT-0482', 'PLT-0483', 'PLT-0484', 'PLT-0485', 'PLT-0486'] },
  { path: '/customization/background', element: <BackgroundScreen />, presentation: 'modal', refs: ['PLT-0474', 'PLT-0475', 'PLT-0476', 'PLT-0477', 'PLT-0478'] },
  { path: '/notifications', element: <NotificationsScreen />, presentation: 'modal', refs: ['PLT-0494', 'PLT-0495', 'PLT-0496', 'PLT-0497', 'PLT-0498', 'PLT-0499'] },
  // Invitaciones y chat
  { path: '/invite', element: <InviteScreen />, tab: true, refs: ['PLT-0491', 'PLT-0535', 'PLT-0537', 'PLT-0538', 'PLT-0539', 'PLT-0543', 'PLT-0547', 'PLT-0548', 'PLT-0551'] },
  { path: '/invite/intro', element: <InviteIntroScreen />, presentation: 'modal', refs: ['PLT-0532', 'PLT-0533', 'PLT-0534'] },
  { path: '/invite/contacts', element: <InviteContactsScreen />, presentation: 'modal', refs: ['PLT-0540', 'PLT-0541', 'PLT-0542'] },
  { path: '/invite/invitations', element: <InvitationsScreen />, presentation: 'modal', refs: ['PLT-0544', 'PLT-0545', 'PLT-0546'] },
  { path: '/invite/username', element: <UsernameScreen />, presentation: 'modal', refs: ['PLT-0549', 'PLT-0550'] },
  { path: '/chat', element: <ChatScreen />, presentation: 'modal', refs: ['PLT-0435', 'PLT-0436', 'PLT-0492', 'PLT-0526', 'PLT-0527', 'PLT-0528', 'PLT-0529', 'PLT-0530', 'PLT-0531'] },
]
