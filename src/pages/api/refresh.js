
import axios from "axios"
import { getData } from "@/lib/getData"
export default async function handler(req, res) {
    // console.log(req.body)
    if (req.method !== 'GET') {
        res.status(405).send({ error: 'Only GET requests allowed' })
        return
    }
    try {
        const array = await getData()
        return res.status(200).send({ message: 'Data fetched', data: array })
    } catch(e){1
        // console.log("refresh", e)
        return res.status(400).send({ error: 'Could not get data' })
    }
    
    
    }
