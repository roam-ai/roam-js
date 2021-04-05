var roam = require("../../src/index")

const pk = process.env.roam_pk;
const groupID = process.env.group_id;

roam.Initialize(pk)
    .then((client)=>{
        client.setCallback(function(message){console.log(message)})
        
        client.groupSubscription(groupID)
        .then((subscription)=>{
            subscription.subscribe()
            .then((msg)=>{
                console.log(msg)
                subscription.unsubscribe()
                .then((msg)=>{
                    console.log(msg)
                    client.disconnect().then((msg)=>{
                        console.log(msg)
                    })
                })
                .catch((err)=>{
                    throw(err)
                })
            }
            )
        })
        .catch((err)=>{
            throw(err)
        })
        
})
.catch((err)=>{
    throw(err)
})