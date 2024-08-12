use anchor_lang::prelude::*;

declare_id!("5KJrdYJAaTaxu4WFcktxp7wjCfLGa4xujvFSCK7HLpDW");

#[program]
pub mod crowdfundingdapp {
    use super::*;

   pub fn create(ctx:Context<Create>, name:String,description:String)->Result<()>{

    let campaign = &mut ctx.accounts.campaign;
    campaign.name = name;
    campaign.description = description;
    campaign.amount_donated = 0;
    campaign.admin = *ctx.accounts.user.key;
    Ok(())
   }
}

