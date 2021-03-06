import { expect } from 'chai'
import {
  getOp,
  tailspin,
} from '../../src/utils'

import scopes from '../../src/scopes'

describe('utils test', () => {
  it('getOp# 字符串', () => {
    expect(getOp('foo', {foo: 2})).deep.equal({where: {foo: 2}})
  })

  it('getOp# 数组', () => {

    const data = {
      a: 2,
      d_alias: 'foo',
      e: 13,
      f: 23,
      a1: 2,
      d1_alias: 'foo',
      e1: 13,
      f1: 23,
      bar1: 1,
      title: 23
    }

    const options = [
      'a',
      'bar',
      '!b',
      ['c', 1],
      ['d', '@d_alias'],
      ['!e', 1],
      ['!f', '@f_alias'],
      // op
      'a1>',
      '!b1>',
      ['c1>', 1],
      ['c1<', 3],
      ['d1>', '@d1_alias'],
      ['!e1>', 1],
      ['!f1>', '@f1_alias'],
      ['!title $like', d => `%${d.title}%`]
    ]


    const result = {
      where: {
        bar: undefined,
        a: 2,
        c: 1,
        d: 'foo',
        e: 1,
        a1: { gt: 2 },
        c1: { gt: 1, lt: 3 },
        d1: { gt: 'foo' },
        e1: { gt: 1 },
        title: {
          like: '%23%'
        }
      }
    }

    expect(getOp(options, data)).deep.equal(result)
  })

  it('tailspin# 对象路径测试', () => {
    expect(tailspin({
      a: {
        b: [1, 2, 4, {
          c: 10
        }]
      }
    }, 'a.b[3].c')).equal(10)
  })
})


describe('scopes utils', () => {
  const requestData = {
    comment: true,
    count: 3
  }

  it('it# 布尔值', () => {
    expect(scopes.it(false, () => ({result: 1}), [() => ({result: 2}), (d) => ({_count: d.count})])(requestData)).deep.equal({result: 2, _count: 3})
  })


  it('it# 字段', () => {
    expect(scopes.it('comment', () => ({result: 1}), () => ({result: 2}))(requestData)).deep.equal({result: 1})
  })

  it('it# 函数', () => {
    expect(scopes.it(d => d.count > 2, () => ({result: 1}), () => ({result: 2}))(requestData)).deep.equal({result: 1})
  })

  it('itField#', () => {
    const data = {
      'name': d => ({result: 1}),
      'age': [d => ({result: 2}), d => ({_count: d.count})],
    }
    requestData.sort = 'name'
    expect(scopes.itField('sort', data)(requestData)).deep.equal({result: 1})
    requestData.sort = 'age'
    expect(scopes.itField('sort', data)(requestData)).deep.equal({result: 2, _count: 3})
  })

})