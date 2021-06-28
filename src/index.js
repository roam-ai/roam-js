var mqtt = require('async-mqtt')
var uuid4 = require('uuid4')
var crypto = require('crypto');
var axios = require('axios').default;
var debug = require('debug')('roam-js')
var hash = crypto.createHash('sha512');

// Constants used for Subscriptions
const host = 'sdk.geospark.co'
const salt = 'QOuQ2Wbjo7JoweHgmyyRiNdGwjwb9Uuh'
const IOTURL = 'js-mqtt.roam.ai'
const prefix = ''


// apiCall is used to made backend API calls to validate Key
// and to get necessary details for subscription
function apiCall(apiKey, path){
    var url = 'https://' + host + path;
    return new Promise((resolve, reject)=>{

        axios.get(url,{
            headers: {
                'sdk-key': apiKey
            }
        }).then((resp)=>{

            const statusCode = resp.status
            if (statusCode == 410) {
                reject("Invalid Key");
            }
            const responseData = resp.data
            if( 'data' in responseData){
                resolve( responseData['data'])
            }
            else {
                debug(responseData.toString())
                reject("Unknown Error");
            }
        }).catch((err)=>{
            reject(err)
        })
    
    })
}

// generateCredentials is used to dynamically create the credentials 
// required to subscribe
function generateCredentials(apiKey){
    timestamp = Date.now()
    clientID = apiKey + '_' + uuid4()
    username = 'pk_'+ timestamp
    password = hash.update(apiKey+timestamp+salt, 'utf-8').digest('hex')
    return {clientID , username , password}
}


// Roam is the default primary class for JS sdk
class Roam  {
    // Constructor for Roam. Takes in parameter from initialize function
    constructor(topicPrefix,eventPrefix, apiKey, conn){
        debug('Constructing Roam class')
        if(typeof(topicPrefix)!='string' ||  typeof(conn)!='object' || typeof(apiKey)!='string' ){
            throw new Error('Cannot construct roam class manually. Please use Initialize(apikey)')
        }
        this.apiKey = apiKey 
        this.topicPrefix = topicPrefix
        this.eventPrefix = eventPrefix
        this.mqttConnection = conn
    }
    // disconnect method disconnects the connection to the Pub/Sub Server
    disconnect(){
        return new Promise((resolve,reject)=>{
            this.mqttConnection.end()
            .then((result)=>{
                resolve("Disconnected Successfully")
            })
            .catch((err)=>{
                reject("Error while disconnecting: "+ err)
            })

        })
    }
    // setCallback is a method to set callback for roam-js SDK
    // For every message received, callback function will be called.
    // Callback function should have one parameter which will contain 
    // the location data.
    setCallback(cb){
        this.mqttConnection.on('message', (topic, message)=>{
            var messageType = topic.split("/")[0]
            var userID = topic.split("/").slice(-1)[0]
            cb(message.toString(), messageType, userID)
        })
    }
    //userEventsSubscription is a method used to create a user level subscription to events
    // It takes a single user id or a array of users as input parameter
    userEventsSubscription(user){
        return new Promise((resolve, reject)=>{
            if (Array.isArray(user)){
                var topics = user.map((e)=>{
                    return this.eventPrefix + e
                })
                resolve( new Subscription(this.mqttConnection , topics))
            }
            var topic = this.eventPrefix+user
            resolve( new Subscription(this.mqttConnection, topic))
        })
    }
    //projectEventsSubscription is a method used to create a 
    // project level subscription. It takes no parameters
    projectEventsSubscription(){
        return new Promise((resolve,reject)=>{
            var topic = this.eventPrefix +'+'
            resolve( new Subscription(this.mqttConnection ,topic))
        })
    }
    //groupEventsSubscription is a method used to create a group level subscription
    // It takes group id as input parameter
    groupEventsSubscription(groupID){ 
        return new Promise((resolve, reject)=>{
            apiCall(this.apiKey , '/api/group/'+groupID)
            .then((data)=>{
                var users = data['user_ids']
                if (Array.isArray(users) && users.length>0){
                var topics = users.map((e)=>{
                return this.eventPrefix + e
                })
                resolve( new Subscription(this.mqttConnection, topics))}
                else{
                    reject("No users in group")
                }
            }).catch((err)=>{reject("Invalid Group ID")})
        })
        }
    //projectSubscription is a method used to create a 
    // project level subscription. It takes no parameters
    projectSubscription(){
        return new Promise((resolve,reject)=>{
            var topic = this.topicPrefix +'+'
            resolve( new Subscription(this.mqttConnection ,topic))
        })
    }
    //userSubscription is a method used to create a user level subscription
    // It takes a single user id or a array of users as input parameter
    userSubscription(user){
        return new Promise((resolve, reject)=>{
            if (Array.isArray(user)){
                var topics = user.map((e)=>{
                    return this.topicPrefix + e
                })
                resolve( new Subscription(this.mqttConnection , topics))
            }
            var topic = this.topicPrefix+user
            resolve( new Subscription(this.mqttConnection, topic))
        })
        
    }
    //groupSubscription is a method used to create a group level subscription
    // It takes group id as input parameter
    groupSubscription(groupID){ 
        return new Promise((resolve, reject)=>{
            apiCall(this.apiKey , '/api/group/'+groupID)
            .then((data)=>{
                var users = data['user_ids']
                if (Array.isArray(users) && users.length>0){
                var topics = users.map((e)=>{
                return this.topicPrefix + e
                })
                resolve( new Subscription(this.mqttConnection, topics))}
                else{
                    reject("No users in group")
                }
            }).catch((err)=>{reject("Invalid Group ID")})
        })
    }
}

// Subscription is an internal class to maintain subscription for roam-js
var Subscription = class{
    // Constructor which takes mqtt connection and topic name as parameters
    // Topic can be string or array
    constructor(connection , topic){
        this.connection = connection
        this.topic = topic
        debug('Subscription created successfully for topics: ', topic)
    }
    // Subscribe subscribes to the topic/topics for which the subscription is created
    subscribe(){

            if (!this.connection.connected && !this.connection.reconnecting){
                this.connection.reconnect()     
            }
            return new Promise((resolve,reject)=>{
                this.connection.subscribe(this.topic)
                .then((result)=>{
                    debug("Subscribed to topics sucessfully: ", result)
                    resolve("Subscribed to topics sucessfully: " +  JSON.stringify(result))
                })
                .catch((err)=>{
                    debug("Error while subscribing :", err)
                    reject(err)
                })

            })
    }
    // Unsubscribe method unsubscribes from the subscription topic/topics
    unsubscribe(){
        return new Promise((resolve,reject)=>{
            this.connection.unsubscribe(this.topic)
            .then((result)=>{
                debug("Unsubscribed successfully from topics: ", this.topic)
                resolve("Unsubscribed successfully")  
            })
            .catch((err)=>{
                debug("Error while unsubscribing: ", err)
                reject("Error while unsubscribing: ", err)
            })
        })
    }
}

function Initialize(apikey) {
    debug('Initializing Roam-js');
    debug('Verifying Keys and fetching required details');
    return new Promise((resolve, reject)=>{
        apiCall(apikey, '/api/details')
        .then((data) => {
            debug("Details of the key:", data)
            const accountID = data['account_id']
            const projectID = data['project_id']
            locationTopicPrefix = prefix+'locations/'+accountID+'/'+projectID+'/'
            eventTopicPrefix = prefix + 'events/'+accountID + '/' + projectID + '/'
            var credentials = generateCredentials(apikey)
            var clientID = credentials.clientID;
            var username = credentials.username;
            var password = credentials.password;
            mqtt.connectAsync('wss://'+ IOTURL+'/mqtt',{
            username: username,
            password: password,
            protocol: 'wss',
            host: IOTURL,
            port:443,
            clientId: clientID,
            resubscribe: true,
            keepalive: 30
            })
            .then((mqttConnection)=>{
                    if (mqttConnection.connected){
                        debug("Connected to Server Successfully")
                        resolve(new Roam(locationTopicPrefix, eventTopicPrefix,apikey,mqttConnection))
                    }
                })
            .catch((err)=>{
                    debug("Error while connection: " ,err)
                    reject("Error while connection: " + err)
                })
        })
        .catch((err)=>{
            debug("Error with API call: ", err)
            reject("Error while API call: " + err )
        });
    })
}


module.exports.Initialize = Initialize;





