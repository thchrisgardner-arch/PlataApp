import {
  BillAmountScreen, BillCategoryScreen, BillConfirmScreen, BillDoneScreen, BillsScreen, MyBillScreen, MyBillsScreen, ProviderScreen, ScanScreen,
} from '../screens/payments/BillScreens'
import { FavoritesScreen, PaySearchScreen, PaymentsScreen } from '../screens/payments/PaymentsScreen'
import { RecipientScreen, TransferAmountScreen, TransferConfirmScreen, TransferDoneScreen } from '../screens/payments/TransferScreens'
import { AnalyticsCategoryScreen, AnalyticsScreen, ReceiptScreen, ReceivedScreen, TransactionsScreen, TxDetailScreen } from '../screens/tx/TxScreens'
import type { AppRoute } from './routes'
import { moreRoutes } from './routes3'

// Pagos y movimientos
export const extraRoutes: AppRoute[] = [
  { path: '/pay', element: <PaymentsScreen />, tab: true, refs: ['PLT-0257', 'PLT-0258', 'PLT-0270', 'PLT-0271', 'PLT-0287', 'PLT-0305', 'PLT-0315', 'PLT-0316', 'PLT-0321', 'PLT-0325', 'PLT-0326', 'PLT-0327', 'PLT-0336', 'PLT-0397', 'PLT-0398', 'PLT-0399', 'PLT-0726'] },
  { path: '/pay/search', element: <PaySearchScreen />, presentation: 'fade', refs: ['PLT-0401', 'PLT-0402', 'PLT-0403', 'PLT-0404'] },
  { path: '/favorites', element: <FavoritesScreen />, presentation: 'modal', refs: ['PLT-0380', 'PLT-0381', 'PLT-0382', 'PLT-0383', 'PLT-0384', 'PLT-0385', 'PLT-0386', 'PLT-0387', 'PLT-0388', 'PLT-0389'] },
  { path: '/transfer/recipient', element: <RecipientScreen />, presentation: 'modal', refs: ['PLT-0259', 'PLT-0260', 'PLT-0272', 'PLT-0273', 'PLT-0274', 'PLT-0275', 'PLT-0296', 'PLT-0297', 'PLT-0306', 'PLT-0307', 'PLT-0308', 'PLT-0353', 'PLT-0390', 'PLT-0391', 'PLT-0392'], sample: '/transfer/recipient?method=clabe' },
  { path: '/transfer/amount', element: <TransferAmountScreen />, refs: ['PLT-0261', 'PLT-0262', 'PLT-0263', 'PLT-0264', 'PLT-0276', 'PLT-0277', 'PLT-0278', 'PLT-0279', 'PLT-0280', 'PLT-0281', 'PLT-0282', 'PLT-0283', 'PLT-0284', 'PLT-0298', 'PLT-0299', 'PLT-0300', 'PLT-0309', 'PLT-0310', 'PLT-0354', 'PLT-0355', 'PLT-0356', 'PLT-0357', 'PLT-0393', 'PLT-0394'] },
  { path: '/transfer/confirm', element: <TransferConfirmScreen />, refs: ['PLT-0265', 'PLT-0266', 'PLT-0285', 'PLT-0301', 'PLT-0311', 'PLT-0358', 'PLT-0395'] },
  { path: '/transfer/done/:id', element: <TransferDoneScreen />, presentation: 'fade', refs: ['PLT-0267', 'PLT-0286', 'PLT-0302', 'PLT-0312', 'PLT-0359', 'PLT-0360', 'PLT-0396'] },
  { path: '/receipt/:id', element: <ReceiptScreen />, presentation: 'modal', refs: ['PLT-0268', 'PLT-0269', 'PLT-0303', 'PLT-0304', 'PLT-0313', 'PLT-0314', 'PLT-0351', 'PLT-0352', 'PLT-0412', 'PLT-P-68635f', 'PLT-P-d61662', 'PLT-P-d616a6'], sample: '/receipt/tx-uber1' },
  { path: '/bills', element: <BillsScreen />, presentation: 'modal', refs: ['PLT-0324', 'PLT-0341', 'PLT-0725'] },
  { path: '/bills/amount', element: <BillAmountScreen />, refs: ['PLT-0346', 'PLT-0347', 'PLT-0348', 'PLT-0364', 'PLT-0371', 'PLT-0376'] },
  { path: '/bills/confirm', element: <BillConfirmScreen />, refs: ['PLT-0349', 'PLT-0365', 'PLT-0372', 'PLT-0377'] },
  { path: '/bills/done/:id', element: <BillDoneScreen />, presentation: 'fade', refs: ['PLT-0350', 'PLT-0366', 'PLT-0373', 'PLT-0378'] },
  { path: '/bills/scan', element: <ScanScreen />, presentation: 'modal', refs: ['PLT-0367', 'PLT-0368'] },
  { path: '/bills/provider/:id', element: <ProviderScreen />, refs: ['PLT-0344', 'PLT-0345', 'PLT-0361', 'PLT-0362'], sample: '/bills/provider/amd' },
  { path: '/bills/:cat', element: <BillCategoryScreen />, refs: ['PLT-0342', 'PLT-0343'], sample: '/bills/water' },
  { path: '/my-bills', element: <MyBillsScreen />, refs: ['PLT-0369', 'PLT-0374', 'PLT-0379'] },
  { path: '/my-bills/:id', element: <MyBillScreen />, presentation: 'modal', refs: ['PLT-0363', 'PLT-0370', 'PLT-0375'], sample: '/my-bills/cfe' },
  { path: '/transactions', element: <TransactionsScreen />, refs: ['PLT-0145', 'PLT-0256', 'PLT-0410', 'PLT-0708', 'PLT-P-d6eccb', 'PLT-P-d6ecce', 'PLT-P-d6ecd1', 'PLT-P-d6ecd3', 'PLT-P-d6ecd6', 'PLT-P-d6ecd7', 'PLT-P-d6ecda', 'PLT-P-31925c'] },
  { path: '/tx/:id', element: <TxDetailScreen />, presentation: 'modal', refs: ['PLT-0409', 'PLT-0411', 'PLT-P-68635b', 'PLT-P-68635d', 'PLT-P-d616a4'], sample: '/tx/tx-uber1' },
  { path: '/analytics', element: <AnalyticsScreen />, presentation: 'modal', refs: ['PLT-0129', 'PLT-P-d6ed33', 'PLT-P-251cb0', 'PLT-P-251cb3', 'PLT-P-319258', 'PLT-P-31925b', 'PLT-P-d6ece4', 'PLT-P-d6ed31'] },
  { path: '/analytics/:cat', element: <AnalyticsCategoryScreen />, presentation: 'modal', refs: ['PLT-P-251caa', 'PLT-P-251cac', 'PLT-P-251caf'], sample: '/analytics/Taxi?m=4' },
  { path: '/received', element: <ReceivedScreen />, presentation: 'modal', refs: ['PLT-0130'] },
  ...moreRoutes,
]
