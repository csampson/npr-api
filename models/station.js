/**
 * @overview Stations interface
 */

'use strict'

class Station {
  /**
   * @param {Database} database - Database client instance
   */
  constructor (database) {
    this.database = database
  }

  async all () {
    const results = await this.database.client.ft.search('stations', '*')

    return results.documents.map(({ value }) => ({
      ...value,
      links: JSON.parse(value.links)
    }))
  }
}

module.exports = Station
