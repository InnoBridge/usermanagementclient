# usermanagementclient
This library is to provide the APIs for React Native(mobile) cache for user management(connections, connection requests, ...) for the library `@innobridge/usermanagement`. The reason why a separate library is because `@innobridge/usermanagement` uses the `pg` library that is not supported in React Native, so `@innobridge/usermanagementclient` is created to manage cache for usermanagement on device.

Compatible Versions
|@innobridge/usermanagement|@innobridge/usermanagementclient|
|---|---|
|0.1.3|0.1.3|

## Architecture

```
Server (Node.js) ←→ API ←→ React Native App
     ↓                           ↓
PostgreSQL                SQLite Cache
```

## Dependencies
```
npm install @innobridge/trpcmessengerclient
```