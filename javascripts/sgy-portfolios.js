// Only works in the browser for a signed-in user.
// The paths are absolute but relative to the Schoology domain, for this is
// intended to be used by userscripts.
// For users that aren't signed in, they need to get a SESS cookie.

console.log('sgy-portfolios.js loaded!', new Date())

/*
color_code: null
created_at: "2020-03-19 16:39:53 -0700"
crop_info: {xoffset: 195, yoffset: 0, width: 2053, height: 1858}
  height: 1858
  width: 2053
  xoffset: 195
  yoffset: 0
cropped_file_id: 3451533818
cropped_file_info: {id: 3451533818, fileId: null, type: 2,…}
  conversionFailed: false
  conversionPending: false
  fileId: null
  filemime: "image/jpeg"
  filename: "WIN_20200124_18_32_31_Scan.jpg"
  id: 3451533818
  image_presets: {,…}
    album_large: "https://asset-cdn.schoology.com/system/files/imagecache/album_large/svc/portfolio/202003/WIN_20200124_18_32_31_Scan_5e7403243098b.jpg"
    album_source: "https://asset-cdn.schoology.com/system/files/imagecache/album_source/svc/portfolio/202003/WIN_20200124_18_32_31_Scan_5e7403243098b.jpg"
    album_thumbnail: "https://asset-cdn.schoology.com/system/files/imagecache/album_thumbnail/svc/portfolio/202003/WIN_20200124_18_32_31_Scan_5e7403243098b.jpg"
    profile_big: "https://asset-cdn.schoology.com/system/files/imagecache/profile_big/svc/portfolio/202003/WIN_20200124_18_32_31_Scan_5e7403243098b.jpg"
    profile_reg: "https://asset-cdn.schoology.com/system/files/imagecache/profile_reg/svc/portfolio/202003/WIN_20200124_18_32_31_Scan_5e7403243098b.jpg"
    profile_sm: "https://asset-cdn.schoology.com/system/files/imagecache/profile_sm/svc/portfolio/202003/WIN_20200124_18_32_31_Scan_5e7403243098b.jpg"
    profile_tiny: "https://asset-cdn.schoology.com/system/files/imagecache/profile_tiny/svc/portfolio/202003/WIN_20200124_18_32_31_Scan_5e7403243098b.jpg"
  md5Checksum: "75c8deca0d046e30186b21d5aafbda56"
  pdfConversion: null
  publicURI: null
  swfConversion: null
  tempURI: "https://files-cdn.schoology.com/75c8deca0d046e30186b21d5aafbda56?content-type=image%2Fjpeg&content-disposition=attachment%3B%2Bfilename%3D%22WIN_20200124_18_32_31_Scan.jpg%22&Expires=1606367642&Signature=DRL8ToltXTKQk52E-qWP4yYtvhL6MCOY8nEYP3AjoCZ9IKN6ouWK9G4lUj4IHKMXpzrjR8nwKLq93~TR3IQwJz0YXsD-491uM20RhPZTVk~Y2kdPLTa2iouuMmpyPIqqqGiMy-Ui09yrhT58os2VKoeYESAFHkgBO22fyfbL0dw3~WZnAqqgmLtPlAU9TibcNfleru2WduCQyZ08TILsc-174EWrxJQb9koNqc1DjenNVRika1Wp7Q4JbB1NNGqogcXfk08y9-aR1njFTY1R4Jv3brxsg1MzzBzEp96hxheP06rWFPXcUZXd9fjUkfJwxZG7aNzGQlA0fjMAIZzNFQ__&Key-Pair-Id=APKAJ6LPJQLQJLURLVDQ"
  type: 2
description: "Google had been advertising the excellent camera quality of their Pixel. My mom apparently has one, so I'm using it to take these photos as opposed to the Microsoft Surface rear camera"
editable: true
file_id: 3451533675
file_info: {id: 3451533675, fileId: null, type: 2,…}
  conversionFailed: false
  conversionPending: false
  fileId: null
  filemime: "image/jpeg"
  filename: "WIN_20200124_18_32_31_Scan.jpg"
  id: 3451533675
  image_presets: {,…}
    album_large: "https://asset-cdn.schoology.com/system/files/imagecache/album_large/svc/portfolio/202003/WIN_20200124_18_32_31_Scan_5e7403241ed62.jpg"
    album_source: "https://asset-cdn.schoology.com/system/files/imagecache/album_source/svc/portfolio/202003/WIN_20200124_18_32_31_Scan_5e7403241ed62.jpg"
    album_thumbnail: "https://asset-cdn.schoology.com/system/files/imagecache/album_thumbnail/svc/portfolio/202003/WIN_20200124_18_32_31_Scan_5e7403241ed62.jpg"
    profile_big: "https://asset-cdn.schoology.com/system/files/imagecache/profile_big/svc/portfolio/202003/WIN_20200124_18_32_31_Scan_5e7403241ed62.jpg"
    profile_reg: "https://asset-cdn.schoology.com/system/files/imagecache/profile_reg/svc/portfolio/202003/WIN_20200124_18_32_31_Scan_5e7403241ed62.jpg"
    profile_sm: "https://asset-cdn.schoology.com/system/files/imagecache/profile_sm/svc/portfolio/202003/WIN_20200124_18_32_31_Scan_5e7403241ed62.jpg"
    profile_tiny: "https://asset-cdn.schoology.com/system/files/imagecache/profile_tiny/svc/portfolio/202003/WIN_20200124_18_32_31_Scan_5e7403241ed62.jpg"
  md5Checksum: "69df05ecdc9b578e8bbde8d89c75a553"
  pdfConversion: null
  publicURI: null
  swfConversion: null
  tempURI: "https://files-cdn.schoology.com/69df05ecdc9b578e8bbde8d89c75a553?content-type=image%2Fjpeg&content-disposition=attachment%3B%2Bfilename%3D%22WIN_20200124_18_32_31_Scan.jpg%22&Expires=1606367642&Signature=UMwARg-sotUhsU9om-HG0qXa9b4Mv3pjUKrvsdFAekunZLlJ2XR06~YjxLsduaummLnORTowUxiKoafHcuCOfkO~6okoesSCFvvbV67WQYaRIGNBBkBcabuKpb~ZJ~Km-FGHPXZAi0pVMe6MJy0l6DQWOScJppfFMdOEjAy-mR27Ovud6v35MkGcAG1CC2fJv180ccxArcyj76Nfvn2ASxX1dw8SKPBk1xT~06-zS~Wet6bJJb5dk2jvYuaQEpJVZmJZfjy~LYFhQytVLfuKfrhx5yoNzYylaEOfwg~~I7o-TSuDUiv4HchptZNuv3UMztlfUSM2TNMbIJkfhUabrw__&Key-Pair-Id=APKAJ6LPJQLQJLURLVDQ"
  type: 2
id: 3811224
item_count: 4
position: "-k"
public_hash: "b2a6fa75ab914578f1cce3b74023de91"
public_share_url: "http://pausd.schoology.com/public-portfolio/b2a6fa75ab914578f1cce3b74023de91"
published: true
title: "Art spectrum B°: Coronavirus strikes"
updated_at: "2020-05-27 13:28:06 -0700"
use_file_id: 1
user_id: 2017219
*/

export function responseOk (response) {
  if (response.ok) {
    return response
  } else {
    throw new Error(`Unacceptable HTTP status ${response.status} from ${response.url}.`)
  }
}

let csrfToken
async function portfolioFetch (path, { headers = {}, ...options } = {}) {
  if (!csrfToken) {
    csrfToken = fetch('/portfolios/init')
      .then(responseOk)
      .then(r => r.json())
      .then(({ data: { csrfToken } }) => csrfToken)
  }
  return fetch('/portfolios/' + path, {
    ...options,
    headers: {
      ...headers,
      'X-Csrf-Token': await csrfToken
    }
  })
    .then(responseOk)
    .then(r => r.json())
    .then(({ data }) => data)
}

const { uid: myUserId } = siteNavigationUiProps.props.user

export const ItemType = {
  ASSIGNMENT: 'assignment',
  FILE: 'file',
  LINK: 'link',
  PAGE: 'page'
}

class Base {
  constructor (id, data = null) {
    this.id = id
    this.data = data
  }

  async get () {
    this.data = await portfolioFetch(this.path)
    return this
  }

  async update (changes) {
    this.data = await portfolioFetch(this.path, {
      method: 'PUT',
      body: JSON.stringify(changes)
    })
    return this
  }

  async delete () {
    this.data = await portfolioFetch(this.path, {
      method: 'DELETE'
    })
    return this
  }
}

class Item extends Base {
  constructor (portfolio, id, data = null) {
    super(id, data)
    this.portfolio = portfolio
    this.path = `users/${portfolio.user.id}/portfolios/${portfolio.id}/items/${id}`
  }
}

class Portfolio extends Base {
  constructor (user, id, data = null) {
    super(id, data)
    this.user = user
    this.path = `users/${user.id}/portfolios/${id}`
  }

  publish () {
    this.data = portfolioFetch(this.path + '/publish', { method: 'POST' })
    return this
  }

  unpublish () {
    this.data = portfolioFetch(this.path + '/unpublish', { method: 'POST' })
    return this
  }

  items () {
    if (this.data && this.data.items) {
      return this.data.items.map(item => new Item(this, item.id, item))
    } else {
      return []
    }
  }

  createItem (type = ItemType.PAGE, init = { metadata: {} }) {
    return portfolioFetch(this.path + `/items`, {
      method: 'POST',
      body: JSON.stringify({ ...init, item_type: type })
    })
      .then(data => new Item(this, data.id, data))
  }

  item (id) {
    return new Item(this, id, null)
  }
}

export class User {
  constructor (userId = myUserId) {
    this.id = userId
    this.path = `users/${this.id}/portfolios`
  }

  async portfolios () {
    return portfolioFetch(this.path)
      .then(({ portfolios }) =>
        portfolios.map(portfolio => new Portfolio(this, portfolio.id, portfolio)))
  }

  async createPortfolio (init = {}) {
    return portfolioFetch(this.path, {
      method: 'POST',
      body: JSON.stringify(init)
    })
      .then(data => new Portfolio(this, data.id, data))
  }

  portfolio (id) {
    return new Portfolio(this, id, null)
  }
}
