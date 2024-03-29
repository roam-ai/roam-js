var roam = require("../../../src/index")

const pk = process.env.roam_pk;

roam.Initialize(pk)
    .then((client)=>{
        client.setCallback(function(message, messageType,userID){console.log(message , " type:", messageType , " user: ", userID)})
        
        client.projectEventsSubscription()
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