// blockchain.js
// Extended Blockchain with Proof-of-Work, Transactions, and Tampering Detection

const crypto = require('crypto');

/** A single block in the blockchain */
class Block {
  /**
   * @param {number} index
   * @param {string} timestamp
   * @param {Array<Object>} transactions
   * @param {string} previousHash
   */
  constructor(index, timestamp, transactions, previousHash = '') {
    this.index = index;
    this.timestamp = timestamp;
    this.transactions = transactions;
    this.previousHash = previousHash;
    this.nonce = 0;
    this.hash = this.calculateHash();
  }

  /** Compute the SHA-256 hash of the block's contents */
  calculateHash() {
    return crypto
      .createHash('sha256')
      .update(
        this.index +
        this.timestamp +
        JSON.stringify(this.transactions) +
        this.previousHash +
        this.nonce
      )
      .digest('hex');
  }

  /**
   * Mine the block by finding a hash with `difficulty` leading zeros
   * @param {number} difficulty
   */
  mineBlock(difficulty) {
    const target = '0'.repeat(difficulty);
    while (this.hash.substring(0, difficulty) !== target) {
      this.nonce++;
      this.hash = this.calculateHash();
    }
    console.log(` Block mined (index=${this.index}): ${this.hash}`);
    console.log(` ➤ Nonce: ${this.nonce}\n`);
  }
}

/** The Blockchain class holds and validates blocks */
class Blockchain {
  constructor(difficulty = 3) {
    this.chain = [this.createGenesisBlock()];
    this.difficulty = Math.max(difficulty, 3); // Enforce minimum difficulty
  }

  createGenesisBlock() {
    return new Block(0, Date.now().toString(), [{ info: 'Genesis Block' }], '0');
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  /**
   * Adds a block to the chain after mining
   * @param {Block} newBlock
   */
  addBlock(newBlock) {
    newBlock.previousHash = this.getLatestBlock().hash;
    newBlock.mineBlock(this.difficulty);
    this.chain.push(newBlock);
  }

  /**
   * Validate the blockchain integrity
   * @returns {boolean}
   */
  isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const current = this.chain[i];
      const previous = this.chain[i - 1];

      if (current.hash !== current.calculateHash()) {
        return false;
      }

      if (current.previousHash !== previous.hash) {
        return false;
      }
    }
    return true;
  }
}

/* -------------------------- DEMO -------------------------- */
function main() {
  const myCoin = new Blockchain(3);

  console.log('⛏️  Mining block #1...');
  myCoin.addBlock(new Block(1, Date.now().toString(), [
    { from: 'Alice', to: 'Bob', amount: 50 },
    { from: 'John', to: 'Karen', amount: 30 },
  ]));

  console.log('⛏️  Mining block #2...');
  myCoin.addBlock(new Block(2, Date.now().toString(), [
    { from: 'Charlie', to: 'Dana', amount: 75 },
  ]));

  console.log('⛏️  Mining block #3...');
  myCoin.addBlock(new Block(3, Date.now().toString(), [
    { from: 'Eve', to: 'Frank', amount: 20 },
    { from: 'Gina', to: 'Hank', amount: 10 },
  ]));

  console.log('\n🔍 Full blockchain:\n');
  console.log(JSON.stringify(myCoin, null, 2));

  console.log('\n✅ Is chain valid?', myCoin.isChainValid());

  // Tampering test
  console.log('\n🚨 Tampering with block #1...');
  myCoin.chain[1].transactions[0].amount = 9999; // malicious change

  console.log('❌ Is chain valid after tamper?', myCoin.isChainValid());
}

main();
