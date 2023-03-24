import axios from "axios"
export async function getData() {
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
                        createdAt
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
    return array
}