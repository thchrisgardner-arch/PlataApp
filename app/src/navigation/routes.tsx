import { Navigate, type RouteObject } from 'react-router-dom'
import { AccountRouter, AhorroScreen } from '../screens/accounts/AccountScreens'
import {
  AhorroOpenedScreen, CreditPaymentScreen, DocScreen, InsuranceScreen, InsuranceTypeScreen, InterestScreen, LegalScreen, LimitsScreen, PlataAhorroScreen, StatementsScreen, VerifyScreen,
} from '../screens/accounts/AhorroFlows'
import { BetweenScreen, CashBanksScreen, CashStoresScreen, DepositCardScreen } from '../screens/accounts/MoveScreens'
import { CreatePasscodeScreen, FaceIdScreen, LockScreen, OtpScreen, PermissionsScreen, PhoneScreen, SplashScreen } from '../screens/auth/AuthScreens'
import { CardScreen, PinActivateScreen, PinInfoScreen, SetPinScreen } from '../screens/cards/CardScreens'
import { DeliveryNewScreen, DeliveryTrackScreen, PackagingScreen } from '../screens/cards/DeliveryScreens'
import { HomeScreen } from '../screens/home/HomeScreen'
import { NotFoundScreen } from '../screens/NotFoundScreen'
import { extraRoutes } from './routes2'

export type AppRoute = RouteObject & {
  presentation?: 'push' | 'modal' | 'fade' | 'none'
  tab?: boolean
  /** Capturas de referencia (docs/catalogo-pantallas.md); vacío = reconstrucción aproximada */
  refs?: string[]
  /** Ejemplo navegable para la prueba de barrido de rutas */
  sample?: string
}

export const routes: AppRoute[] = [
  { path: '/', element: <Navigate to="/home" replace /> },
  // Onboarding
  { path: '/auth/splash', element: <SplashScreen />, presentation: 'fade', refs: ['PLT-0001'] },
  { path: '/auth/permissions', element: <PermissionsScreen />, presentation: 'fade', refs: ['PLT-0002', 'PLT-0003', 'PLT-0004', 'PLT-0005'] },
  { path: '/auth/phone', element: <PhoneScreen />, refs: ['PLT-0006', 'PLT-0007', 'PLT-0008'] },
  { path: '/auth/otp', element: <OtpScreen />, presentation: 'modal', refs: ['PLT-0009', 'PLT-0010', 'PLT-0011', 'PLT-0012'] },
  { path: '/auth/passcode', element: <CreatePasscodeScreen />, refs: ['PLT-0013', 'PLT-0014', 'PLT-0015', 'PLT-0016', 'PLT-0017'] },
  { path: '/auth/faceid', element: <FaceIdScreen />, refs: ['PLT-0018', 'PLT-0019', 'PLT-0020'] },
  { path: '/auth/lock', element: <LockScreen />, presentation: 'fade', refs: [] },
  // Home y cuentas
  { path: '/home', element: <HomeScreen />, tab: true, refs: ['PLT-0021', 'PLT-0022', 'PLT-0023', 'PLT-0405', 'PLT-0512', 'PLT-0727'] },
  { path: '/account/:id', element: <AccountRouter />, refs: ['PLT-0132', 'PLT-0134', 'PLT-0135', 'PLT-0205', 'PLT-0206', 'PLT-0207'], sample: '/account/credito' },
  { path: '/ahorro/new', element: <PlataAhorroScreen />, presentation: 'modal', refs: ['PLT-0210', 'PLT-0211', 'PLT-0212', 'PLT-0236', 'PLT-0237', 'PLT-0238', 'PLT-0239', 'PLT-0240', 'PLT-0241', 'PLT-0242'] },
  { path: '/ahorro/opened/:id', element: <AhorroOpenedScreen />, presentation: 'fade', refs: ['PLT-0213', 'PLT-0243'] },
  { path: '/ahorro/:id', element: <AhorroScreen />, refs: ['PLT-0215', 'PLT-0226', 'PLT-0228', 'PLT-0232', 'PLT-0233', 'PLT-0245', 'PLT-0251', 'PLT-0255'] },
  { path: '/interest/:id', element: <InterestScreen />, refs: ['PLT-0227'], sample: '/interest/cuenta' },
  { path: '/between', element: <BetweenScreen />, presentation: 'modal', refs: ['PLT-0218', 'PLT-0219', 'PLT-0220', 'PLT-0222', 'PLT-0248', 'PLT-0249', 'PLT-0250', 'PLT-0289', 'PLT-0290', 'PLT-0292', 'PLT-0295', 'PLT-0709', 'PLT-0710', 'PLT-0712'] },
  { path: '/deposit/card', element: <DepositCardScreen />, presentation: 'modal', refs: ['PLT-0328', 'PLT-0329', 'PLT-0330'] },
  { path: '/deposit/cash-stores', element: <CashStoresScreen />, presentation: 'modal', refs: ['PLT-0318', 'PLT-0337', 'PLT-0338'] },
  { path: '/deposit/cash-banks', element: <CashBanksScreen />, presentation: 'modal', refs: ['PLT-0339', 'PLT-0340'] },
  { path: '/statements/:id', element: <StatementsScreen />, refs: ['PLT-0188'], sample: '/statements/credito' },
  { path: '/legal/:id', element: <LegalScreen />, refs: ['PLT-0189'], sample: '/legal/credito' },
  { path: '/doc/:id', element: <DocScreen />, presentation: 'modal', refs: ['PLT-0190', 'PLT-0191', 'PLT-0192', 'PLT-0193', 'PLT-0502', 'PLT-0552'], sample: '/doc/contract' },
  { path: '/insurance', element: <InsuranceScreen />, refs: ['PLT-0194', 'PLT-0197', 'PLT-0198'] },
  { path: '/insurance/:type', element: <InsuranceTypeScreen />, presentation: 'modal', refs: ['PLT-0195', 'PLT-0196'], sample: '/insurance/disability' },
  { path: '/limits', element: <LimitsScreen />, presentation: 'modal', refs: ['PLT-0231'] },
  { path: '/verify', element: <VerifyScreen />, refs: ['PLT-0431'] },
  { path: '/credit-payment', element: <CreditPaymentScreen />, refs: ['PLT-0176', 'PLT-0177', 'PLT-0178', 'PLT-0179', 'PLT-0180', 'PLT-0181', 'PLT-0182'] },
  // Tarjetas
  { path: '/card/:id', element: <CardScreen />, refs: ['PLT-0136', 'PLT-0137', 'PLT-0138', 'PLT-0139', 'PLT-0140', 'PLT-0141', 'PLT-0142', 'PLT-0143', 'PLT-0144', 'PLT-0146', 'PLT-0147', 'PLT-0148', 'PLT-0149', 'PLT-0150', 'PLT-0151', 'PLT-0152', 'PLT-0153', 'PLT-0155', 'PLT-0156', 'PLT-0157', 'PLT-0158', 'PLT-0161', 'PLT-0162', 'PLT-0163', 'PLT-0164', 'PLT-0165', 'PLT-0166', 'PLT-0167', 'PLT-0168', 'PLT-0169', 'PLT-0170', 'PLT-0171', 'PLT-0172', 'PLT-0173', 'PLT-0174', 'PLT-0175', 'PLT-0518', 'PLT-0519', 'PLT-0520', 'PLT-0521', 'PLT-0522', 'PLT-0523', 'PLT-0723'], sample: '/card/c9586' },
  { path: '/card/:id/pin-info', element: <PinInfoScreen />, presentation: 'modal', refs: ['PLT-0159', 'PLT-0160'], sample: '/card/c9586/pin-info' },
  { path: '/card/:id/set-pin', element: <SetPinScreen />, presentation: 'modal', refs: ['PLT-0717', 'PLT-0718', 'PLT-0719', 'PLT-0720', 'PLT-0721'], sample: '/card/c9586/set-pin' },
  { path: '/card/:id/pin-activate', element: <PinActivateScreen />, presentation: 'modal', refs: ['PLT-0722'], sample: '/card/c9586/pin-activate' },
  { path: '/delivery/new', element: <DeliveryNewScreen />, presentation: 'modal', refs: ['PLT-0505', 'PLT-0506', 'PLT-0507', 'PLT-0508', 'PLT-0509', 'PLT-0510', 'PLT-0511'], sample: '/delivery/new?account=cuenta' },
  { path: '/delivery/packaging', element: <PackagingScreen />, presentation: 'modal', refs: ['PLT-0514', 'PLT-0515', 'PLT-0516'] },
  { path: '/delivery/:id', element: <DeliveryTrackScreen />, refs: ['PLT-0513', 'PLT-0517'] },
  ...extraRoutes,
  { path: '*', element: <NotFoundScreen /> },
]
