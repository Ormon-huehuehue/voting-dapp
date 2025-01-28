import * as  anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Keypair, PublicKey } from "@solana/web3.js";
import { BankrunProvider, startAnchor } from "anchor-bankrun";
import { Voting } from "anchor/target/types/voting";

const IDL = require("../target/idl/voting.json");

const votingProgramId = new PublicKey("coUnmi3oBUtwtd9fjeAvSsJssXh5A5xyPbhpewyzRVF");

describe('Voting', ()=>{

  let context;
  let provider : BankrunProvider; 
  let votingProgram : Program<Voting>;

  beforeAll(async () => {
    context = await startAnchor("", [{ name: "voting", programId: votingProgramId }], []);
    provider = new BankrunProvider(context);
    votingProgram = new Program<Voting>(IDL, provider);
});


  it('Initialize Poll', async()=>{
    await votingProgram.methods.initializePoll(
      new anchor.BN(2), // poll id
      "What is your favourite type of peanut nutter?",  //description
      new anchor.BN(0), // poll start
      new anchor.BN(1737993400) //poll end
    ).rpc();

  

    const [pollAddress] = PublicKey.findProgramAddressSync(
      [ new anchor.BN(2).toArrayLike(Buffer, 'le', 8) ],
      votingProgramId
    )

    const poll = await votingProgram.account.poll.fetch(pollAddress);

    
    // expect(poll.pollId.toNumber()).toEqual(2);
    // expect(poll.description).toEqual("What is your favourite type of peanut nutter?");
    // expect(poll.pollStart.toNumber()).toBeLessThan(poll.pollEnd.toNumber());

    console.log("POLL :", poll);

  });

  it("Initialize candidate", async()=>{

     // Define poll_id and candidate_name
    const pollId = new anchor.BN(2);
    const candidateName = "nutter";

    await votingProgram.methods
    .initializeCandidate(candidateName, pollId) // Pass candidateName (string) and pollId (u64)
    .rpc();
  
    const [candidateAddress] = PublicKey.findProgramAddressSync(
      [
       pollId.toArrayLike(Buffer, 'le', 8),
       Buffer.from(candidateName)
      ],
      votingProgramId
    )

      // Fetch the candidate account
    const candidate = await votingProgram.account.candidate.fetch(candidateAddress);
    console.log("Candidate Account:", candidate);

  })


  it("Vote", async()=>{
    
  })

})
