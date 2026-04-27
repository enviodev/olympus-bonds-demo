# Olympus Bonds Demo Indexer

Envio HyperIndex indexer covering 4 contracts across 1 chain.

## Chains

| Network | Chain ID |
|---|---|
| Ethereum Mainnet | 1 |

## Contracts

- **`BondFixedExpirySDA`**: `MarketClosed`, `MarketCreated`
- **`BondFixedTermSDA`**: `MarketClosed`, `MarketCreated`
- **`BondFixedTermTeller`**: `Bonded`
- **`BondFixedExpiryTeller`**: `Bonded`

## Schema entities (4)

`Market`, `MarketCreatedEvent`, `MarketClosedEvent`, `BondPurchase`

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

- [Node.js v22+ (v24 recommended)](https://nodejs.org/en/download/current)
- [pnpm](https://pnpm.io/installation)
- [Docker](https://www.docker.com/products/docker-desktop/) or [Podman](https://podman.io/)

## Resources

- [Envio docs](https://docs.envio.dev)
- [HyperIndex overview](https://docs.envio.dev/docs/HyperIndex/overview)
- [Discord](https://discord.gg/envio)
