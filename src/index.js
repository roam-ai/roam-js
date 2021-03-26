var mqtt = require('mqtt')
var https = require('https')
var uuid4 = require('uuid4')
var crypto = require('crypto');
//creating hash object 
var hash = crypto.createHash('sha512');
const host = 'sdk.geospark.co'
const salt = 'x9nFgM1ioxAOPmT3Fdyeh483lerc1J7k'
const authorizerName = 'iot-authorizer'
const IOTURL = 'az91jf6dri5ey-ats.iot.eu-central-1.amazonaws.com'
const prefix = ''

function fetch(apiKey , url){
    var options = {
        host: host,
        path: url,
        port: '443',
        headers: {'api-key': apiKey},
        method: 'GET'
    }
    const req = https.request(options, res=>{
        if (res.statusCode == 410){
            throw "Invalid API Key"
        }
        res.on('data', d=>{
            data = JSON.parse(d)['data']
            if (data!=undefined){
                return data
            } 
            else{
                throw "Unknown Error"
            }
        })

        res.on('error', (error) => {
                throw "Error while hitting backend" + error
            })

    })

}

function generateCredentials(apiKey){
    timestamp = Date.now()
    clientID = apiKey + '_' + uuid4()
    username = 'sdk_'+ timestamp + '?x-amz-customauthorizer-name='+ authorizerName
    password = hash.update(apiKey+timestamp+salt, 'utf-8').digest('hex')

    return clientID , username , password
}


var Roam =  class {
    constructor(apiKey){
        data = fetch(apiKey, '/api/details')
        account_id = data['account_id']
        project_id = data['project_id']
        if (account_id==undefined || project_id==undefined){
            throw "Unknown Error"
        }
        this.apiKey = apiKey 
        this.accountID = account_id
        this.projectID = project_id
        this.topicPrefix = 'locations/'+this.accountID+'/'+this.projectID+'/'
        var clientID , username , password = generateCredentials(apiKey)
        this.mqtt = mqtt.connect('wss://'+ IOTURL+'/mqtt',{
        username:username,
        password: password,
        protocol: 'wss',
        host: IOTURL,
        port:443,
        clientId: clientID
        })
        this.mqtt.on('message', (topic, message)=>{
            console.log(message.toString())
        })
    }
    disconnect(){
        this.mqtt.end()
    }
    setCallback(cb){
        this.mqtt.on('message', (topic, message)=>{
            cb(message.toString())
        })
    }
    
    projectSubscription(){
        var topic = this.topicPrefix +'+'
        return new Subscription(this.mqtt ,topic)
    }
    userSubscription(user){
        if (Array.isArray(user)){
            user.map((e)=>{
                return this.topicPrefix + e
            })
            return new Subscription(this.mqtt , user)
        }
        topic = this.topicPrefix+user
        return new Subscription(this.mqtt, topic)
    }
    groupSubscription(groupID){
        data = fetch(this.apiKey , '/api/group/'+groupID)
        users = data['user_ids']
        if (Array.isArray(users) && users.length>0){
            users.map((e)=>{
                return this.topicPrefix + e
            })
            return new Subscription(this.mqtt, users)
        }
        throw "Invalid Group ID"
    }
}

var Subscription = class{
    constructor(connection , topic){
        this.connection = connection
        this.topic = topic
    }
    subscribe(){
        this.connection.subscribe(this.topic, (err)=>{
            console.error(err)
        })
    }
    unsubscribe(){
        this.connection.unsubscribe(this.topic)
    }
}



// var Initialize = function(api_key) {
//     return new Roam(api_key)
// }

export {Roam, Subscription};





