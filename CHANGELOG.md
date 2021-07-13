## 0.0.4
* Changes to dependency from uuid4 to uuid to support react.
## 0.0.3
* Added support for browsers to use roam-js.

## 0.0.2
* Added support to subscribe to events data for users, project or user groups of your project in Roam. The various events sources and types which are part of geospark are:
 - __geofence events:__ entry and exit
 - __trip events:__ creation, start, pause, resume, end, entry and exit events for origins and destinations
 - __moving geofence events:__ nearby and away

* Updated callback with additional parameters:
 - __message:__ Actual message sent by geospark backend
 - __messageType:__ locations / events
 - __userID:__ The userID to whom the event or location belongs
## 0.0.1
* A whole new Javascript SDK which is used to subscribe to realtime location data for users, project or user groups of your project in Roam.