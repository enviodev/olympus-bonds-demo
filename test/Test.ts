import assert from "assert";
import { TestHelpers, BondFixedExpirySDA_MarketClosed } from "envio";
const { MockDb, BondFixedExpirySDA } = TestHelpers;

describe("BondFixedExpirySDA contract MarketClosed event tests", () => {
  // Create mock db
  const mockDb = MockDb.createMockDb();

  // Creating mock for BondFixedExpirySDA contract MarketClosed event
  const event = BondFixedExpirySDA.MarketClosed.createMockEvent({/* It mocks event fields with default values. You can overwrite them if you need */});

  it("BondFixedExpirySDA_MarketClosed is created correctly", async () => {
    // Processing the event
    const mockDbUpdated = await BondFixedExpirySDA.MarketClosed.processEvent({
      event,
      mockDb,
    });

    // Getting the actual entity from the mock database
    let actualBondFixedExpirySDAMarketClosed = mockDbUpdated.entities.BondFixedExpirySDA_MarketClosed.get(
      `${event.chainId}_${event.block.number}_${event.logIndex}`
    );

    // Creating the expected entity
    const expectedBondFixedExpirySDAMarketClosed: BondFixedExpirySDA_MarketClosed = {
      id: `${event.chainId}_${event.block.number}_${event.logIndex}`,
      id: event.params.id,
    };
    // Asserting that the entity in the mock database is the same as the expected entity
    assert.deepEqual(actualBondFixedExpirySDAMarketClosed, expectedBondFixedExpirySDAMarketClosed, "Actual BondFixedExpirySDAMarketClosed should be the same as the expectedBondFixedExpirySDAMarketClosed");
  });
});
