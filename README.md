# OpenBlog

This project is a simple open blogging protocol built on the Internet Computer. It allows users to create posts for free and when they get to a certain level and pay ICRC-1 tokens to be able to make more posts.

The future plan is for it to evolve into a blogging platform where writers can fully monetize their contents.

## Prerequisites

Before you can start building on the Internet Computer, you need to install the DFX command-line tool. You can find instructions on how to do this in the [SDK documentation](https://sdk.dfinity.org/docs/quickstart/quickstart-intro.html).

## Tech Stack

This project uses the following technologies:

- [Motoko](https://sdk.dfinity.org/docs/language-guide/motoko.html) for the backend canister
- [React](https://reactjs.org/) for the frontend

## Running the project locally

If you want to test your project locally, you can use the following commands:

Install Backend dependencies

```bash
mops install
```

If you don't already have `ic-mops`, check the [documentation]() out to install it.

Deploy the backend canister and generate it's declarations

```bash
# Starts the replica, running in the background
dfx start --background

# Deploys the backend canister to the replica and generates your candid interface
dfx generate backend
dfx deploy backend
```

Deploy the ICRC 1 Token canister

```bash
./deploy-icrc-token.sh DevJourney local
```

Set the ICRC-1 token canister id

```bash
dfx canister call backend set_icrc1_token_canister "(\"$(dfx canister id icrc1_ledger_canister)\")"
```

Send ICRC-1 tokens to a principal

```bash
dfx canister call icrc1_ledger_canister icrc1_transfer "(record { to = record { owner = principal \"PRINCIPAL_HERE\";};  amount = 10000000000;})"
```

Start the frontend server

```bash
cd src/frontend
npm start
```

Which will start a server at `http://localhost:3000`, proxying API requests to the replica at port 4943.

### Usage

1. Visit the frontend URL and then sign up using the sign up button
2. You can read posts if you are not logged in, so you don't need to login or signup to read posts
3. Head to the profile section to create a new post
4. You can create a post using the create post button
5. Then when writing your blog post you can use Markdown format and see the preview of your blog directly on the right of the editor
6. When you are done you can set the status of the blog to one of the following (Published, Draft, or Archive). Published posts are posts that can be read by anyone.

### Future Features

1. Allow users to edit blog posts
2. Allow readers to donate to writers
3. Allow writers to add tags to blogs
4. Allow writers to create blog series.
5. Upgrade to the the `transfer_from` and `approve` methods for charging members and readers.

### Note on frontend environment variables

If you are hosting frontend code somewhere without using DFX, you may need to make one of the following adjustments to ensure your project does not fetch the root key in production:

- set`DFX_NETWORK` to `ic` if you are using Webpack
- use your own preferred method to replace `process.env.DFX_NETWORK` in the autogenerated declarations
  - Setting `canisters -> {asset_canister_id} -> declarations -> env_override to a string` in `dfx.json` will replace `process.env.DFX_NETWORK` with the string in the autogenerated declarations
- Write your own `createActor` constructor

### Resources

- [ICRC-1 Token Standard](https://internetcomputer.org/docs/current/references/icrc1-standard)

- [Setting up ICP Ledger](https://internetcomputer.org/docs/current/developer-docs/defi/icp-tokens/ledger-local-setup)

- [Using the ICRC-1 Ledger](https://internetcomputer.org/docs/current/developer-docs/defi/icrc-1/using-icrc1-ledger)

- [Internet Identity](https://internetcomputer.org/docs/current/references/ii-spec)
