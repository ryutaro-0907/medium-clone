// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import sanityClient from '@sanity/client';
import { ReadStream } from 'fs';

export const config = {
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    apiVersion: "2021-03-25",
    useCdn: process.env.NODE_ENV === "production",
    token: process.env.SANITY_API_TOKEN
}

const client = sanityClient(config);

export default async function createComment(
  req: NextApiRequest,
  res: NextApiResponse
) {
    console.log('req.body:', req.body)
    const { _id, name, email, comment } = req.body;
    try {
        await client.create({
            _type: "comment",
            post: {
                _type: "reference",
                _ref: _id,
            },
            name,
            email,
            comment,
        });
    } catch (err) {
        return res.status(500).json({message: "Could not submit comment", err});
    }
    console.log('comment submited')
    return res.status(200).json({message: "Comment submited."})

}
