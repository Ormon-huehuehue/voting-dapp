use anchor_lang::prelude::*;

declare_id!("coUnmi3oBUtwtd9fjeAvSsJssXh5A5xyPbhpewyzRVF");

#[program]
pub mod voting{
use super::*;

  pub fn initialize_poll( 
    ctx : Context<InitializePoll>,
    poll_id : u64,
    description : String,
    poll_start : u64, 
    poll_end : u64) -> Result<()>{
    
      let poll = &mut ctx.accounts.poll;
      poll.poll_id = poll_id;
      poll.poll_start = poll_start;
      poll.poll_end = poll_end;
      poll.description = description;
      poll.candidate_count = 0;

      Ok(())  
  }

  pub fn initialize_candidate(
    ctx : Context<InitializeCandidate>,
    candidate_name : String, _poll_id : u64)-> Result<()>{

    let candidate = &mut ctx.accounts.candidate_account;
    candidate.candidate_name = candidate_name;
    candidate.candidate_votes = 0;

    let poll = &mut ctx.accounts.poll_account;
    poll.candidate_count += 1;

    Ok(())
  }


  pub fn vote(
    ctx : Context<Vote>,
    _candidate_name : String,
    _poll_id : u64
  )-> Result<()>{
    let candidate = &mut ctx.accounts.candidate_account;
    candidate.candidate_votes += 1;

    Ok(())
  }

}


#[derive(Accounts)]
#[instruction(candidate_name : String, poll_id : u64)]
pub struct Vote<'info>{
  #[account()]
  pub signer : Signer<'info>,

  #[account(
    seeds = [poll_id.to_le_bytes().as_ref()],
    bump
  )]
  pub poll_account : Account<'info, Poll>,

  #[account(
    seeds = [poll_id.to_le_bytes().as_ref(), candidate_name.as_bytes()],
    bump
  )]
  pub candidate_account : Account<'info, Candidate>,
}


#[derive(Accounts)]
#[instruction(candidate_name : String, poll_id : u64)]
pub struct InitializeCandidate<'info>{
  #[account(mut)]
  pub signer : Signer<'info>,

  #[account(
    seeds = [poll_id.to_le_bytes().as_ref()],
    bump
  )]
  pub poll_account : Account<'info, Poll>,

  #[account(
    init, 
    payer = signer,
    space = 8 + Candidate::INIT_SPACE,
    seeds = [poll_id.to_le_bytes().as_ref(), candidate_name.as_bytes()],
    bump
  )]
  pub candidate_account : Account<'info, Candidate>,

  pub system_program : Program<'info, System>
}


#[derive(Accounts)]
#[instruction(poll_id : u64)]
pub struct InitializePoll<'info>{
  #[account(mut)]
  pub signer : Signer<'info>,
  #[account(
    init, 
    payer = signer,
    space = 8 + Poll::INIT_SPACE,
    seeds = [poll_id.to_le_bytes().as_ref()],
    bump

  )]
  pub poll : Account<'info, Poll>,
  pub system_program : Program<'info, System>
}

#[account]
#[derive(InitSpace)]
pub struct Candidate{
  #[max_len(32)]
  pub candidate_name : String,
  pub candidate_votes : u64
}


#[account]
#[derive(InitSpace)]
pub struct Poll{
  pub poll_id : u64,

  #[max_len(32)]
  pub poll_name : String,

  #[max_len(280)]
  pub description : String,
  pub poll_start : u64,
  pub poll_end : u64,
  pub candidate_count : u64
}