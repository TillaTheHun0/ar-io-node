export type JsonTag = {
  name: string;
  value: string;
}

export type JsonTags = JsonTag[];

export interface JsonBlock {
  indep_hash: string;
  height: number;
  nonce: string;
  hash: string;
  previous_block: string | undefined;
  timestamp: number;
  diff: string;
  cumulative_diff: string | undefined;
  last_retarget: string | undefined;
  reward_addr: string | undefined; // undefined for block 0
  reward_pool: string;
  block_size: string;
  weave_size: string;
  usd_to_ar_rate_dividend: string | undefined;
  usd_to_ar_rate_divisor: string | undefined;
  scheduled_usd_to_ar_rate_dividend: string | undefined;
  scheduled_usd_to_ar_rate_divisor: string | undefined;
  hash_list_merkle: string;
  wallet_list: string;
  tx_root: string;
  tags: JsonTags;
  txs: string[];
  // TODO check for other fields
}

export interface JsonTransaction {
  id: string;
  signature: string;
  format: number;
  last_tx: string;
  owner: string;
  target: string;
  quantity: string;
  reward: string;
  data_size: string;
  data_root: string;
  tags: JsonTags;
  // TODO check for other fields
}

export interface ChainApiClientInterface {
  getBlockByHeight(height: number): Promise<JsonBlock>;
  getTransaction(txId: string): Promise<JsonTransaction>;
}

export interface ChainDatabaseInterface {
  insertBlockAndTxs(block: JsonBlock, transactions: JsonTransaction[]): Promise<void>;
  //getMaxIndexedHeight(): Promise<number>;
}
