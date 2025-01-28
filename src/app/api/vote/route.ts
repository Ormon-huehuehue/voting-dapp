import { Program } from "@coral-xyz/anchor";
import {ACTIONS_CORS_HEADERS, ActionGetResponse, ActionPostRequest, createPostResponse} from "@solana/actions";
import { Connection, PublicKey, Transaction, VersionedTransaction } from "@solana/web3.js";
import { Voting } from "anchor/target/types/voting";
import * as anchor from "@coral-xyz/anchor";

const IDL = require("@/anchor/target/idl/voting.json");


export async function GET(request: Request) {
    const actionMetadata : ActionGetResponse = {
        icon : "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Ftse1.mm.bing.net%2Fth%3Fid%3DOIP.AuaqpJwTBaish7RJL-FB9QHaE8%26pid%3DApi&f=1&ipt=0d29914225244bf592b6fd824e03330ba412fd3f8be5a9ab3f414bbaefd978ac&ipo=images",
        title : "Vote for your favourite type of peanut butter",
        description : "Vote between crunchy and smooth PB",
        label : "VOTE",
        links : {
            actions : [
               {
                label : "Vote for Crunchy",
                href:  "/api/vote?candidate=Crunchy",
                type : 'post'
               },
               {
                label : "Vote for Smooth",
                href:  "/api/vote?candidate=Smooth",
                type : 'post'
               }
            ]
        }
    };

    return  Response.json(actionMetadata, {
        headers : ACTIONS_CORS_HEADERS
    });
  }
  
export async function POST(req : Request){

    const url = new URL(req.url);
    const candidate = url.searchParams.get("candidate");

    if(candidate !=="Crunchy" && candidate !== "Smooth"){
        return new Response("Invalid candidate", {
            status : 400,
            headers : ACTIONS_CORS_HEADERS
        });
    }

    const connection = new Connection("http://localhost:8899", "confirmed");
    const program : Program<Voting> = new Program(IDL, {connection});    
    const body : ActionPostRequest =  await req.json();

    let voter;

    try{
        voter = new PublicKey(body.account);
    }
    catch(err){
        return new Response("Invalid account",{
            status :400,
            headers : ACTIONS_CORS_HEADERS
        })
    }

    const instruction = await program.methods
    .vote(candidate, new anchor.BN(2))
    .accounts({
        signer : voter
    })
    .instruction();

    const blockhash = await connection.getLatestBlockhash();

    const transaction = new Transaction({
        feePayer : voter,
        blockhash : blockhash.blockhash,
        lastValidBlockHeight : blockhash.lastValidBlockHeight
    }).add(instruction);

    const response = await createPostResponse({
        fields : {
            transaction : transaction,
            type : "transaction"
        }
    })

    return Response.json(response,{
        headers : ACTIONS_CORS_HEADERS
    })
}