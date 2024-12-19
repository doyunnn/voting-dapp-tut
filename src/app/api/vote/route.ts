import {ActionGetResponse, ActionPostRequest, ACTIONS_CORS_HEADERS, createPostResponse} from "@solana/actions";
import {Connection, PublicKey, Transaction} from "@solana/web3.js";
import {Voting} from '@/../anchor/target/types/voting'
import {Program} from "@coral-xyz/anchor";
import * as anchor from '@coral-xyz/anchor'

const IDL = require('@/../anchor/target/idl/voting.json')

export const OPTIONS = GET;


export async function GET(request: Request) {
  const response: ActionGetResponse ={
    icon: 'https://hips.hearstapps.com/hmg-prod/images/peanut-butter-vegan-1556206811.jpg?crop=0.6666666666666666xw:1xh;center,top&resize=1200:*',
    title: 'Vote for Peanut Butter',
    description: 'Vote for your favorite peanut butter!',
    label: 'Vote Now!',
    links: {
        actions: [
          {
            type: 'post',
            label: 'Vote for Crunchy',
            href: 'http://localhost:3000/api/vote?candidate=Crunchy',
          },
          {
            type: 'post',
            label: 'Vote for Crunchy',
            href: 'http://localhost:3000/api/vote?candidate=Smooth',
          },
        ]
    }
  }
  return Response.json(response,{headers: ACTIONS_CORS_HEADERS});
}

export async function POST(request: Request) {
  const url = new URL(request.url)
  const candidate = url.searchParams.get('candidate')

  if (candidate !== 'Crunchy' && candidate !== 'Smooth') {
    return new Response('Invalid candidate', {status: 400, headers: ACTIONS_CORS_HEADERS})
  }

  const connection = new Connection('http://127.0.0.1:8899', 'confirmed')
  const program: Program<Voting> = new Program(IDL, {connection})

  const body: ActionPostRequest = await request.json()
  let voter

  try{
    voter = new PublicKey(body.account)
  }catch (error){
    return new Response('Invalid account', {status: 400, headers: ACTIONS_CORS_HEADERS})
  }

  const instruction = await program.methods
      .vote(candidate, new anchor.BN(1))
      .accounts({
        signer: voter
      })
      .instruction()

  const blockhash = await connection.getLatestBlockhash()

  const transaction = new Transaction({
        feePayer: voter,
        blockhash: blockhash.blockhash,
        lastValidBlockHeight: blockhash.lastValidBlockHeight,
      })
      .add(instruction)

  const response = await createPostResponse({
    fields: {
      transaction,
    }
  })

  return Response.json(response, {headers: ACTIONS_CORS_HEADERS})
}
