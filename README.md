# Olympus Bonds Indexer

An indexer for OlympusDAO's bond markets (the Bond Protocol auctioneers and tellers) on Ethereum, built with [Envio HyperIndex](https://docs.envio.dev). Tracks fixed-expiry and fixed-term bond market lifecycle and bond purchases.

## Chains

| Chain | ID |
|---|---|
| Ethereum Mainnet | 1 |

## What it indexes

### Auctioneers (SDAs)
- `BondFixedExpirySDA` (`0x007FEA7A23da99F3Ce7eA34F976f32BF79A09C43`, `0x007FEA2a31644F20b0fE18f69643890b6F878AA6`, `0x007FEA32545a39Ff558a1367BBbC1A22bc7ABEfD`): `MarketCreated`, `MarketClosed`
- `BondFixedTermSDA` (`0x007F7A58103a31109F848Df1A14F7020E1F1b28A`, `0x007F7A6012A5e03f6F388dd9F19Fd1D754Cfc128`, `0x007F7A1cb838A872515c8ebd16bE4b14Ef43a222`): `MarketCreated`, `MarketClosed`

### Tellers
- `BondFixedExpiryTeller`: bond purchases on fixed-expiry markets
- `BondFixedTermTeller`: bond purchases on fixed-term markets

## Schema

4 GraphQL entities:

- `Market`: aggregated market state (token pair, vesting, initial price, status)
- `MarketCreatedEvent`, `MarketClosedEvent`: lifecycle events
- `BondPurchase`: individual bond purchases via either teller

## Run locally

```bash
pnpm install
pnpm dev
```

GraphQL playground at [http://localhost:8080](http://localhost:8080) (local password: `testing`).

## Generate from `config.yaml` or `schema.graphql`

```bash
pnpm codegen
```

## Pre-requisites

- [Node.js (use v18 or newer)](https://nodejs.org/en/download/current)
- [pnpm](https://pnpm.io/installation)
- [Docker](https://www.docker.com/products/docker-desktop/) or [Podman](https://podman.io/)

## Resources

- [Envio docs](https://docs.envio.dev)
- [HyperIndex overview](https://docs.envio.dev/docs/HyperIndex/overview)
- [Discord](https://discord.gg/envio)
