import { describe, expect, it } from 'vitest'

import { extractMediaIds, mediaUrl, parseMediaUrl } from './media'

const ID = '3f2504e0-4f89-41d3-9a0c-0305e82c3301'
const OTHER = 'a1b2c3d4-e5f6-4a5b-8c9d-0e1f2a3b4c5d'

describe('mediaUrl y parseMediaUrl', () => {
  it('van y vuelven', () => {
    expect(parseMediaUrl(mediaUrl(ID))).toBe(ID)
  })

  it('rechaza lo que no es una referencia nuestra', () => {
    expect(parseMediaUrl('https://ejemplo.com/foto.png')).toBeNull()
    expect(parseMediaUrl('carti:no-es-un-uuid')).toBeNull()
    expect(parseMediaUrl('')).toBeNull()
  })
})

describe('extractMediaIds', () => {
  it('encuentra la referencia de una imagen', () => {
    expect(extractMediaIds(`![diagrama](${mediaUrl(ID)})`)).toEqual([ID])
  })

  it('mira anverso y reverso a la vez', () => {
    const ids = extractMediaIds(`![a](${mediaUrl(ID)})`, `![b](${mediaUrl(OTHER)})`)
    expect(ids.sort()).toEqual([ID, OTHER].sort())
  })

  it('no repite si la misma imagen sale dos veces', () => {
    expect(extractMediaIds(`![a](${mediaUrl(ID)}) y otra vez ![a](${mediaUrl(ID)})`)).toEqual([ID])
  })

  it('ignora imágenes externas', () => {
    expect(extractMediaIds('![web](https://ejemplo.com/foto.png)')).toEqual([])
  })

  it('con texto sin imágenes devuelve lista vacía', () => {
    expect(extractMediaIds('Una carta normal y corriente')).toEqual([])
  })

  it('normaliza a minúsculas', () => {
    expect(extractMediaIds(`![a](carti:${ID.toUpperCase()})`)).toEqual([ID])
  })
})
