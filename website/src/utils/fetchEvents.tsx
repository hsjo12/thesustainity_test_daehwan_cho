import { Contract, Provider, DeferredTopicFilter } from "ethers";

const singleCall = async (
  contract: Contract,
  eventFilter: DeferredTopicFilter,
  fromBlockOrBlockHash: number | string,
  toBlock?: number | string
): Promise<any[]> => {
  return await contract.queryFilter(eventFilter, fromBlockOrBlockHash, toBlock);
};

const multipleCalls = async (
  provider: Provider,
  contract: Contract,
  eventFilter: DeferredTopicFilter,
  blockLimitRange: number,
  fromBlockOrBlockHash: number | string,
  toBlock?: number | string
): Promise<any[]> => {
  const fromBlockNumber = Number(fromBlockOrBlockHash);
  const toBlockNumber = Number(
    !toBlock || toBlock === "latest" ? await provider.getBlockNumber() : toBlock
  );
  const totalBlocks = toBlockNumber - fromBlockNumber;

  const count = Math.ceil(totalBlocks / blockLimitRange);
  let events: any[] = [];
  let startingBlock = fromBlockNumber;

  for (let index = 0; index < count; index++) {
    const fromRangeBlock = startingBlock;
    const toRangeBlock =
      index === count - 1 ? toBlockNumber : startingBlock + blockLimitRange;

    events = events.concat(
      await singleCall(contract, eventFilter, fromRangeBlock, toRangeBlock)
    );

    startingBlock = toRangeBlock + 1;
  }

  return events;
};

export const fetchEvents = async (
  provider: Provider,
  contract: Contract,
  eventFilter: DeferredTopicFilter,
  fromBlockOrBlockHash: number | string,
  toBlock?: number | string,
  blockLimitRange?: number | null
): Promise<any[]> => {
  try {
    if (blockLimitRange == null) {
      return await singleCall(
        contract,
        eventFilter,
        fromBlockOrBlockHash,
        toBlock
      );
    } else if (blockLimitRange > 0) {
      return await multipleCalls(
        provider,
        contract,
        eventFilter,
        blockLimitRange,
        fromBlockOrBlockHash,
        toBlock
      );
    } else {
      return [];
    }
  } catch (error) {
    console.error("Single call failed, attempting multiple calls:", error);
    return [];
  }
};
