
import axios from "axios"
export default async function handler(req, res) {
    // console.log(req.body)
    if (req.method !== 'GET') {
        res.status(405).send({ error: 'Only GET requests allowed' })
        return
    }
    try {
        var array = []
        var again = true
        do {
            const response = await axios({
                url: process.env.HYGRAPH_URL,
                method:"POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${process.env.HYGRAPH_API_KEY}` },
                data: {
                    "operationName":"GetAllData",
                    "query": `
                    query GetAllData {
                        registeredUsers(orderBy: updatedAt_DESC, first: 100, skip: ${array.length}) {
                          exchanges(orderBy: createdAt_ASC, first: 10) {
                            prompt
                            response
                            helpful
                            helpfulDetails
                            createdAt
                            category
                          }
                          details {
                            region
                            job
                            country
                          }
                          chosenApps
                        }
                      }
                                        
                `
                },
            })
            // var page = response.data.data.registeredUsers
            // response.data.data.registeredUsers.map((user, index)=>{
            //     var date = new Date(user.exchanges[0].createdAt)
            //     page[index][date] = `${date.getUTCFullYear()}-${date.getUTCMonth()+1}-${date.getUTCDate()}`
            // })
            array = [].concat(array, response.data.data.registeredUsers)
            // console.log(response.data.data)
            if (response.data.data.registeredUsers.length < 100) {
                again = false
            }
        } while (again)
        return res.status(200).send({ message: 'Data fetched', data: array })
    } catch(e){1
        // console.log("refresh", e)
        return res.status(400).send({ error: 'Could not get data' })
    }
    
    
    }
