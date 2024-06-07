import dayjs, { Dayjs } from 'dayjs'
import { gnlCpy } from '@lib/utils'

export default class Filer {
  key: string
  name: string
  path: string
  otype: 'send' | 'receive'
  createdAt: Dayjs

  constructor() {
    this.key = ''
    this.name = ''
    this.path = ''
    this.otype = 'send'
    this.createdAt = dayjs(null)
  }

  reset() {
    this.key = ''
    this.name = ''
    this.path = ''
    this.otype = 'send'
    this.createdAt = dayjs(null)
  }

  static copy(src: any, tgt?: Filer, force = false) {
    return gnlCpy(Filer, src, tgt, { force, cpyMapper: { createdAt: (src: any) => dayjs(src) } })
  }
}
