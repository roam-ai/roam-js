var roam = require("../../../src/index")

const pk = process.env.roam_pk;
const groupID = process.env.group_id;

roam.Initialize(pk)
    .then((client)=>{
        client.setCallback(function(message, messageType,userID){console.log(message , " type:", messageType , " user: ", userID)})
        
        client.groupEventsSubscription(groupID)
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
                    console.log(err)
                })
            }
            )
        })
        .catch((err)=>{
            console.log(err)
        })
        
})
.catch((err)=>{
    console.log(err)
})