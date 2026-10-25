import * as R from 'react/jsx-dev-runtime'
import { translateProps } from './wrap'

export const Fragment = R.Fragment
export function jsxDEV(type: never, props: never, key: never, isStatic: never, source: never, self: never) {
  return R.jsxDEV(type, translateProps(type, props) as never, key, isStatic, source, self)
}
export type { JSX } from 'react/jsx-dev-runtime'
