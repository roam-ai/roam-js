<p align="center">
  <a href="https://roam.ai" target="_blank" align="left">
    <img src="https://github.com/roam-ai/roam-js/blob/master/logo.png?raw=true" width="180">
  </a>
  <br />
</p>
<img alt="npm" src="https://img.shields.io/npm/v/roam-js">

# Official Roam Javascript SDK

A Javascript library for Roam Location Subscription. It is used to subscribe to user's locations at project level or location of a single user.

roam-js supports subscription to the following location data:
- Specific user 
- All users of a group
- All users of project

Note: Before you get started [signup to our dashboard](https://roam.ai/) to get your Publishable Keys.

# Installation:

## Via NPM
You can install our package using npm.
```
npm install roam-js
```

## Via CDN
roam-js bundle is available through http://unpkg.com, specifically at https://unpkg.com/roam-js/dist/roam.min.js. See http://unpkg.com for the full documentation on version ranges.

# Usage
You can think this library as a wrapper around our REST API which needs your Publishable Key for authorization and it works as per project level. It is fairly simple to use:
- `Initialize()` the package with the publishable key. This will return an instance of our client.
- Define your custom callback function. `client.setCallback(fn)`
- Create an instance of subscription. You can create subscription for project, user or group of users using the following methods on client:
    + `projectSubscription()` takes no parameters
    + `groupSubscription(greoupID)` - takes in group ID as parameter
    + `userSubscription(userID)` - takes in a single user ID or a array of user ids as parameter
- Use `subscribe()` method on the created subscription to start receiving realtime location data
- To stop receiving data, call unsubscribe method. 
- To `disconnect()` call disconnect method on client.
Please find the example usage below:
```
var roam = require("roam-js")

const pk = process.env.roam_pk;

roam.Initialize(pk)
    .then((client)=>{
        client.setCallback(function(message){console.log(message)})
        
        client.projectSubscription()
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
```

# Methods

## Initialize
First order of process is initialization of the library.
Initialize function takes in publishable key as parameter. You can get the publishable key from our dashboard once you have created a project.
Initialize returns a promise of our client.  

```
client = await roam.Initialize("<Your publishable key>")
```

## Setting up callback function
Once initialized, we recommend setting up a callback function. This callback function will be called once you receive any location data from our backend.
```
var callback = function(data){
    console.log(data)
}
client.setCallback(callback)
```

## Subscription
roam-js supports 3 types of subscriptions:
 - project subscription
 - user subscription
 - group subscription

### Project Subscription
To create a subscription that allow you to subscribe to location data of all users within the project, you can use `projectSubscription()` method of client. It does not take in any parameter.
```
subscription = await client.projectSubscription()
```

### Group Subscription
To create a subscription that allow you to subscribe to location data of all users within the group, you can use `groupSubscription(groupID)` method of client. It takes group ID as parameter.
```
subscription = await client.groupSubscription('<Enter group id>')
```

### User Subscription
To create a subscription that allow you to subscribe to location data a user or multiple usesrs, you can use `userSubscription(groupID)` method of client. It takes user ID as parameter. 
```
subscription = await client.groupSubscription('user_1')
```
To subscribe to multiple users pass in user ids in an array as parameter
```
subscription = await client.groupSubscription(['user_1','user_2'])
```
### Subscribe to a subscription
All of the above methods will give you an subscription promise. You can subscribe to the subscription by using the following:
```
subscription.subscribe()
```
This will return a promise with a message whether subscription was subscribed successfully or throws an error.

### Unsubscribe from a subscription
To stop getting location updates from a subscription you can use ubsubscribe method.
```
subscription.unsubscribe()
```
This will return a promise with a message whether unsubscribe was subscribed successfully or throws an error.

## Disconnect
To disconnect from our server, call disconnect method on the client.
```
client.disconnect()
```

## Example
See example codes in `examples/`.
To run the example, clone this repository, add your sdk key as environment veriable `pk` and run the app.

## Need Help?
If you have any problems or issues over our SDK, feel free to create a github issue or submit a request on [Roam Help](https://geosparkai.atlassian.net/servicedesk/customer/portal/2).
