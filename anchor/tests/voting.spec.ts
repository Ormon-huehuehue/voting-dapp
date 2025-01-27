import * as  anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Keypair, PublicKey } from "@solana/web3.js";
import { BankrunProvider, startAnchor } from "anchor-bankrun";
import { Voting } from "anchor/target/types/voting";

const IDL = require("../target/idl/voting.json");

const votingAddress = new PublicKey("coUnmi3oBUtwtd9fjeAvSsJssXh5A5xyPbhpewyzRVF");

describe('Voting', ()=>{
  it('Initialize Poll', async()=>{
    const context = await startAnchor("",[],[]);
    const provider = new BankrunProvider(context);

    const votingProgram = new Program<Voting>(
      IDL,
      provider
    );

    await votingProgram.methods.initializePoll(
      new anchor.BN(1), // poll id
      "What is your favourite type of peanut butter?",  //description
      new anchor.BN(0), // poll start
      new anchor.BN(1737976883) //poll end
    ).rpc();


    const [pollAddress] = PublicKey.findProgramAddressSync(
      [ new anchor.BN(1).toArrayLike(Buffer, 'le', 8) ],
      votingAddress
    )

    const poll = await votingProgram.account.poll.fetch(pollAddress);

    console.log("POLL :", poll);

    expect(poll.pollId.toNumber()).toEqual(1);
    expect(poll.description).toEqual("What is your favourite type of peanut butter?");
    expect(poll.pollStart.toNumber()).toBeLessThan(poll.pollEnd.toNumber());

  });
})
