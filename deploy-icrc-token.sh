if [ $# -ne 2 ]; then
    echo "Usage: $0 createToken <a> <b> <c>"
    echo ""
    echo "<a> is the deployer identity."
    echo "<b> is the network to deploy the token canister."
    return 1
fi

# Validate network
if [ "$2" != "ic" ] && [ "$2" != "local" ]; then
    echo "Error: Invalid network. Must be 'ic' or 'local'."
    return 1
fi

PRE_MINTED_TOKENS=10_000_000_000_000

TRANSFER_FEE=10_000

dfx identity new archive_controller 2>/dev/null
dfx identity use archive_controller
ARCHIVE_CONTROLLER=$(dfx identity get-principal)

TRIGGER_THRESHOLD=2000

CYCLE_FOR_ARCHIVE_CREATION=10000000000000

NUM_OF_BLOCK_TO_ARCHIVE=1000

TOKEN_NAME="OpenBlog Coin"

TOKEN_SYMBOL="OBC"

dfx identity use "$1"
DEFAULT=$(dfx identity get-principal)

MINTER=$(dfx canister id backend --network "$2")

FEATURE_FLAGS=true

dfx deploy icrc1_ledger_canister --argument "(variant {Init =
record {
     token_symbol = \"${TOKEN_SYMBOL}\";
     token_name = \"${TOKEN_NAME}\";
     minting_account = record { owner = principal \"${MINTER}\" };
     transfer_fee = ${TRANSFER_FEE};
     metadata = vec {};
     feature_flags = opt record{icrc2 = ${FEATURE_FLAGS}};
     initial_balances = vec { record { record { owner = principal \"${DEFAULT}\"; }; ${PRE_MINTED_TOKENS}; }; };
     archive_options = record {
         num_blocks_to_archive = ${NUM_OF_BLOCK_TO_ARCHIVE};
         trigger_threshold = ${TRIGGER_THRESHOLD};
         controller_id = principal \"${ARCHIVE_CONTROLLER}\";
         cycles_for_archive_creation = opt ${CYCLE_FOR_ARCHIVE_CREATION};
     };
 }
})" --network "$2"
