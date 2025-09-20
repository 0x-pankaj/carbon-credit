# Carbon Credit Tokenization MVP

A decentralized carbon credit tokenization platform built on Solana that converts carbon credit certificates into tradeable SPL tokens.


## Overview

This MVP enables users to:
- Submit carbon credit certificates and receive tokenized representation
- Trade carbon credit tokens peer-to-peer
- Integrate with Raydium and other DEXs for liquidity
- Burn tokens for carbon offset verification
- Verify certificate authenticity and ownership

## Key Features

### Tokenization
- **1 Ton = 10,000 CC Tokens** (4 decimal precision)
- **Single Token Standard** - All certificates mint the same SPL token
- **Instant Minting** upon certificate submission

### Trading & Liquidity
- **P2P Trading** built into the smart contract
- **Raydium Compatible** - Add to liquidity pools
- **Standard SPL Token** - Works with all Solana wallets and DEXs

### Security & Verification
- **Certificate Validation** with unique identifiers
- **Admin Controls** for deactivating fraudulent certificates
- **Audit Trail** with timestamps and ownership tracking
- **Burn Mechanism** for carbon offset verification

## Architecture

```
User Submits Certificate -> Smart Contract Validates -> Mints CC Tokens -> User Can Trade/Add to DEX
```

### Smart Contract Functions
- `initialize()` - Set up the program
- `submit_certificate()` - Submit certificate and mint tokens
- `transfer_tokens()` - P2P token transfers
- `burn_tokens()` - Burn tokens for carbon offsetting
- `deactivate_certificate()` - Admin function to disable certificates
- `get_certificate_info()` - View certificate details

## Quick Start

### Prerequisites
- [Rust](https://rustup.rs/) installed
- [Solana CLI](https://docs.solana.com/cli/install-solana-cli-tools) installed
- [Anchor Framework](https://www.anchor-lang.com/docs/installation) installed

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/carbon-credit-mvp.git
   cd carbon-credit-mvp
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Build the program**
   ```bash
   anchor build
   ```

4. **Deploy to devnet**
   ```bash
   anchor deploy --provider.cluster devnet
   ```

5. **Run tests**
   ```bash
   anchor test
   ```

## Program Usage

### Initialize Program
```rust
// Initialize the carbon credit program
initialize(admin_pubkey)
```

### Submit Carbon Credit Certificate
```rust
// Submit certificate and mint tokens
submit_certificate(
    certificate_number: "CC-2024-001",
    tons_amount: 5  // 5 tons = 50,000 tokens
)
```

### Transfer Tokens
```rust
// Transfer tokens between users
transfer_tokens(
    amount: 10000  // Transfer 10,000 tokens (1 ton equivalent)
)
```

### Burn Tokens for Offset
```rust
// Burn tokens to offset carbon
burn_tokens(
    amount: 5000  // Burn 5,000 tokens (0.5 tons)
)
```

## Token Economics

- **Token Symbol**: CC (Carbon Credit)
- **Decimals**: 4
- **Conversion Rate**: 1 ton CO2 = 10,000 CC tokens
- **Total Supply**: Dynamic (based on submitted certificates)

## Project Structure

```
.
├── programs/
│   └── carbon-credit/
│       ├── src/
│       │   └── lib.rs          # Main program logic
│       └── Cargo.toml
├── tests/
│   └── carbon-credit.ts    # Test files
├── app/                        # Frontend (optional)
├── Anchor.toml                 # Anchor configuration
├── Cargo.toml                  # Workspace configuration
└── package.json                # Node dependencies
```

## Integration Examples

### Adding to Raydium Liquidity Pool

After deployment, users can:
1. Get CC token mint address from the program
2. Create liquidity pools on Raydium with SOL/CC or USDC/CC pairs
3. Add liquidity and earn fees from carbon credit trading

### Wallet Integration

The CC tokens are standard SPL tokens and work with:
- Phantom Wallet
- Solflare
- Sollet
- Any SPL token compatible wallet

## Testing

Run the test suite:

```bash
# Run all tests
anchor test

# Run specific test
anchor test --skip-deploy
```

### Test Coverage
- Program initialization
- Certificate submission and token minting
- Token transfers between users
- Token burning for carbon offsetting
- Admin controls and certificate deactivation

## API Reference

### Program Methods

#### `initialize(admin: Pubkey)`
- **Purpose**: Initialize the carbon credit program
- **Parameters**: `admin` - Admin public key
- **Returns**: Transaction signature

#### `submit_certificate(certificate_number: String, tons_amount: u64)`
- **Purpose**: Submit carbon credit certificate and mint tokens
- **Parameters**:
  - `certificate_number` - Unique certificate identifier
  - `tons_amount` - Amount of carbon credits in tons
- **Returns**: Transaction signature
- **Tokens Minted**: `tons_amount * 10,000`

#### `transfer_tokens(amount: u64)`
- **Purpose**: Transfer tokens between users
- **Parameters**: `amount` - Number of tokens to transfer
- **Returns**: Transaction signature

#### `burn_tokens(amount: u64)`
- **Purpose**: Burn tokens for carbon offsetting
- **Parameters**: `amount` - Number of tokens to burn
- **Returns**: Transaction signature

## Security Considerations

- **Certificate Uniqueness**: Each certificate number can only be submitted once
- **Admin Controls**: Only admin can deactivate certificates
- **Input Validation**: All inputs are validated for correctness
- **PDA Security**: Uses Program Derived Addresses for secure account management
- **Audit Trail**: All transactions are recorded on-chain

## Roadmap

- [ ] Frontend web application
- [ ] Mobile app integration
- [ ] Oracle integration for certificate verification
- [ ] Multi-signature admin controls
- [ ] Staking mechanism for long-term carbon credit holding
- [ ] Integration with major carbon credit registries

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow Rust and Anchor best practices
- Add tests for new features
- Update documentation for API changes
- Use meaningful commit messages

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.



## Acknowledgments

- Built with [Anchor Framework](https://www.anchor-lang.com/)
- Powered by [Solana](https://solana.com)
- Inspired by the global carbon credit market

---

**⚠️ Disclaimer**: This is an MVP (Minimum Viable Product) for demonstration purposes. Please conduct thorough testing and audits before using in production environments.
