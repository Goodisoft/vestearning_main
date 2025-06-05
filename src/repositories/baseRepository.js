/**
 * @description Base repository for all CRUD operations
 *
 */

class BaseRepository {
  constructor(model) {
    this.model = model;
  }

  /**
   * @description create document in the db
   * @param {*} data
   * @returns created documents
   */
  async create(data) {
    
    try {
      const document = new this.model(data);
      return await document.save();
    } catch (error) {      
      throw new Error(`Error creating document: ${error.message}`);
    }
  }

  /**
   * @description updates a documents with a given id
   * @param {*} id of the document to update
   * @param {*} data new data to be updated
   * @returns the updated documents
   */
  async update(id, data) {
    try {
      const document = await this.model.findByIdAndUpdate(id, data, {
        new: true,
      });
      if (!document) {
        throw new Error("Document not found");
      }
      return document;
    } catch (error) {
      throw new Error(`Error updating document: ${error.message}`);
    }
  }

  /**
   * @description find Document by id  and returns a single document
   * @param {*} id of the document
   * @returns a sing document
   */
  async findById(id) {
    try {
      const document = await this.model.findById(id);
      if (!document) {
        throw new Error("Document not found");
      }
      return document;
    } catch (error) {
      throw new Error(`Error finding document: ${error.message}`);
    }
  }

  /**
   * @description Takes db field name and the value
   * @param {*} field name in the db
   * @param {*} value to find
   * @returns a single document that matches the value
   */
  async findByField(field, value) {
    try {
      const query = {};
      query[field] = value;
      const document = await this.model.findOne(query);
      if (!document) {
        throw new Error("Document not found");
      }
      return document;
    } catch (error) {
      throw new Error(`Error finding document by field: ${error.message}`);
    }
  }

  /**
   * @description takes multiple fields and find documents with the match
   * @param {*} fields
   * @returns list of documents
   */
  async findByFields(fields) {
    try {
      const query = { ...fields }; // Spread the fields object into the query
      const documents = await this.model.find(query);
      if (!documents || documents.length === 0) {
        throw new Error("No documents found");
      }
      return documents;
    } catch (error) {
      throw new Error(`Error finding documents by fields: ${error.message}`);
    }
  }

  /**
   * @description Takes the id of the document that is to be deleted
   * @param {*} id of the document to be deleted
   * @returns returns the documents
   */
  async delete(id) {
    try {
      const document = await this.model.findByIdAndDelete(id);
      if (!document) {
        throw new Error("Document not found");
      }
      return document;
    } catch (error) {
      throw new Error(`Error deleting document: ${error.message}`);
    }
  }

  /**
   * @description finds all documents
   * @returns list of documents
   */
  async findAll() {
    try {
      return await this.model.find();
    } catch (error) {
      throw new Error(`Error finding all documents: ${error.message}`);
    }
  }
}

module.exports = BaseRepository;
