// @ts-check
const CosmosClient = require('@azure/cosmos').CosmosClient;
// For simplicity we'll set a constant partition key
class TaskDao {
  /**
   * Manages reading, adding, and updating Tasks in Cosmos DB
   * @param {CosmosClient} cosmosClient
   * @param {string} databaseId
   * @param {string} containerId
   * @param {string} partitionKey
   */
  constructor(cosmosClient, databaseId, containerId, partitionKey) {
    this.client = cosmosClient
    this.databaseId = databaseId
    this.collectionId = containerId
    this.partitionKey = partitionKey

    this.database = null
    this.container = null
  }

  async init() {
    console.log('Setting up the database...')
    const dbResponse = await this.client.databases.createIfNotExists({
      id: this.databaseId
    })
    this.database = dbResponse.database
    console.log('Setting up the database...done!')
    console.log('Setting up the container...')
    const partitionKey = { kind: 'Hash', paths: [this.partitionKey] }
    const { container } = await this.database.containers.createIfNotExists({
      id: this.collectionId,
      partitionKey
    })

    this.container = container
    console.log('Setting up the container...done!')
  }

  async find(querySpec) {
    console.log('Querying for items from the database')
    if (!this.container) {
      throw new Error('Collection is not initialized.')
    }
    const { resources } = await this.container.items.query(querySpec).fetchAll()
    return resources;
  }

  async addItem(itemBody) {
    console.log('Adding an item to the database')
    const { item } = await this.container.items.create(itemBody);
    return item;
  }

  async updateItem(itemId,partitionKeyName,replaceItem) {
    console.log('Update an item in the database')
    const { resource: replaced } = await this.container
      .item(itemId, partitionKeyName)
      .replace(replaceItem)
    return replaced;
  }

  async getItem(itemId,partitionKeyName) {
    console.log('Getting an item from the database')
    if (!this.container) {
      throw new Error('Collection is not initialized.')
    }
    const { resource } =  await this.container.item(itemId,partitionKeyName).read();
    return resource;
  }

  async deleteItem(itemId,partitionKeyName) {
    console.log('Getting an item from the database')
    const { resource } = await this.container.item(itemId, partitionKeyName).delete()
    return resource
  }
}

module.exports = TaskDao
