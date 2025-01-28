import * as  anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Keypair, PublicKey } from "@solana/web3.js";
import { BankrunProvider, startAnchor } from "anchor-bankrun";
import { Voting } from "anchor/target/types/voting";

const IDL = require("../target/idl/voting.json");

const votingProgramId = new PublicKey("6973L6gnj3rsP5WKshituzg26bjnepoxZK5KWJW6xSbs");

describe('Voting', ()=>{

  let context;
  let provider; 
    
  // let votingProgram : Program<Voting>;  // use this for testing without deploying

  // use this for locally deployed program
  anchor.setProvider(anchor.AnchorProvider.env())
  let votingProgram = anchor.workspace.Voting as Program<Voting>;


  beforeAll(async () => {
    //run this for testing without deploying

    // context = await startAnchor("", [{ name: "voting", programId: votingProgramId }], []);
    // provider = new BankrunProvider(context);
    // votingProgram = new Program<Voting>(IDL, provider);
});


  it('Initialize Poll', async()=>{
    await votingProgram.methods.initializePoll(
      new anchor.BN(2), // poll id
      "What is your favourite type of peanut butter?",  //description
      new anchor.BN(0), // poll start
      new anchor.BN(1737993400) //poll end
    ).rpc();

  

    const [pollAddress] = PublicKey.findProgramAddressSync(
      [ new anchor.BN(2).toArrayLike(Buffer, 'le', 8) ],
      votingProgramId
    )

    const poll = await votingProgram.account.poll.fetch(pollAddress);

    
    expect(poll.pollId.toNumber()).toEqual(2);
    expect(poll.description).toEqual("What is your favourite type of peanut butter?");
    expect(poll.pollStart.toNumber()).toBeLessThan(poll.pollEnd.toNumber());

    console.log("POLL :", poll);

  });

  it("Initialize candidate", async()=>{

     // Define poll_id
    const pollId = new anchor.BN(2);


    await votingProgram.methods
    .initializeCandidate("Smooth", pollId) // Pass candidateName (string) and pollId (u64)
    .rpc();


    await votingProgram.methods
    .initializeCandidate("Crunchy", pollId) // Pass candidateName (string) and pollId (u64)
    .rpc();
  
    const [crunchyAddress] = PublicKey.findProgramAddressSync(
      [
       pollId.toArrayLike(Buffer, 'le', 8),
       Buffer.from("Crunchy")
      ],
      votingProgramId
    )
    const [smoothAddress] = PublicKey.findProgramAddressSync(
      [
       pollId.toArrayLike(Buffer, 'le', 8),
       Buffer.from("Smooth")
      ],
      votingProgramId
    )

      // Fetch the candidate account
    const crunchyCandidate = await votingProgram.account.candidate.fetch(crunchyAddress);
    console.log("Candidate Account:", crunchyCandidate);
    expect(crunchyCandidate.candidateVotes.toNumber()).toEqual(0);

  

    const smoothCandidate = await votingProgram.account.candidate.fetch(smoothAddress);
    console.log("Candidate Account:", smoothCandidate);
    expect(smoothCandidate.candidateVotes.toNumber()).toEqual(0);

  })


  it("Vote", async()=>{
    await votingProgram.methods
    .vote(
      "Smooth",
      new anchor.BN(2)
    )
    .rpc();

    const [smoothAddress] = PublicKey.findProgramAddressSync(
      [
       new anchor.BN(2).toArrayLike(Buffer, 'le', 8),
       Buffer.from("Smooth")
      ],
      votingProgramId
    )

    const smoothCandidate = await votingProgram.account.candidate.fetch(smoothAddress);
    console.log("Candidate Account:", smoothCandidate);
    expect(smoothCandidate.candidateVotes.toNumber()).toEqual(1);
  })

})
