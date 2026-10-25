import * as R from 'react/jsx-runtime'
import { translateProps } from './wrap'

export const Fragment = R.Fragment
export function jsx(type: never, props: never, key?: never) { return R.jsx(type, translateProps(type, props) as never, key) }
export function jsxs(type: never, props: never, key?: never) { return R.jsxs(type, translateProps(type, props) as never, key) }
export type { JSX } from 'react/jsx-runtime'
