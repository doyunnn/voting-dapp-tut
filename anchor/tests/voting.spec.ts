import * as anchor from '@coral-xyz/anchor'
import { Program } from '@coral-xyz/anchor'
import { Voting } from '../target/types/voting'
import { BankrunProvider, startAnchor } from 'anchor-bankrun'
import { PublicKey } from '@solana/web3.js'

const IDL = require('../target/idl/voting.json')

const votingAddress = new PublicKey('3tVZ7wTxuJPc4vNbRXWKB69pv6y9vxDadM45xEmgdbMf') // need to change deployed id

describe('voting', () => {

  let context;
  let provider;
  // basic way
  anchor.setProvider(anchor.AnchorProvider.env())
  let votingProgram = anchor.workspace.Voting as Program<Voting>;


  beforeAll( async () => {
    /*
    bankrun way
    context = await startAnchor('', [{ name: 'voting', programId: votingAddress }], [])
    provider = new BankrunProvider(context)

     votingProgram = new Program<Voting>(IDL, provider)
     */
  })

  it('initializer Poll', async () => {
    await votingProgram.methods
        .initializePoll(
            new anchor.BN(1),
            'What is your favorite type of peanut butter?',
            new anchor.BN(0),
            new anchor.BN(1834578745),
        )
        .rpc()

    const [pollAddress] = PublicKey.findProgramAddressSync(
        [new anchor.BN(1).toArrayLike(Buffer, 'le', 8)],
        votingAddress,
    )

    const poll = await votingProgram.account.poll.fetch(pollAddress)
    console.log(poll)

    // expect(poll.pollId.toNumber()).toEqual(1)
    expect(poll.description).toEqual('What is your favorite type of peanut butter?')
    expect(poll.pollStart.toNumber()).toBeLessThan(poll.pollEnd.toNumber())
  })

  it("initializer Candidate", async () => {
    await votingProgram.methods
        .initializeCandidate(
            "Smooth",
            new anchor.BN(1),
        ).rpc()
    await votingProgram.methods
        .initializeCandidate(
            "Crunchy",
            new anchor.BN(1),
        ).rpc()

    const [crunchyAddress] = PublicKey.findProgramAddressSync(
        [new anchor.BN(1).toArrayLike(Buffer, 'le', 8), Buffer.from("Crunchy")],
        votingAddress,
    )

    const crunchyCandidate = await votingProgram.account.candidate.fetch(crunchyAddress)
    console.log(crunchyCandidate)
    expect(crunchyCandidate.candidateVotes.toNumber()).toEqual(0)

    const [smoothAddress] = PublicKey.findProgramAddressSync(
        [new anchor.BN(1).toArrayLike(Buffer, 'le', 8), Buffer.from("Smooth")],
        votingAddress,
    )

    const smoothCandidate = await votingProgram.account.candidate.fetch(smoothAddress)
    console.log(smoothCandidate)
    // expect(smoothCandidate.candidateVotes.toNumber()).toEqual(0)
  })

  it("vote", async () => {
    await votingProgram.methods
        .vote(
            "Smooth",
            new anchor.BN(1),
        ).rpc()

    const [smoothAddress] = PublicKey.findProgramAddressSync(
        [new anchor.BN(1).toArrayLike(Buffer, 'le', 8), Buffer.from("Smooth")],
        votingAddress,
    )

    const smoothCandidate = await votingProgram.account.candidate.fetch(smoothAddress)
    console.log(smoothCandidate)
    // expect(smoothCandidate.candidateVotes.toNumber()).toEqual(1)
  })
})
