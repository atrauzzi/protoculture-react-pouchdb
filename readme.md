# ![protoculture](protoculture.png)

[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
![Build](https://github.com/atrauzzi/protoculture-react-pouchdb/workflows/Build/badge.svg)
[![npm version](https://badge.fury.io/js/protoculture.svg)](https://badge.fury.io/js/protoculture/react-pouchdb)

## About
This is a collection of React data components which allow you to obtain live data from PouchDB instances. It supports multiple database connections which can be selected by well known strings.

If you're looking to build an offline-first application, look no further!

## How it Works
The current mechanism for handling updates is very simple. All queries performed by the `usePouchDbFind` hook are associated with the specified database connection in the nearest `PouchDb` component.

This means that any time data changes in the database, all queries are re-run. My current rationale for this is that there's no way to know which queries need to be re-run without actually hitting the database itself.

That said, I am interested in researching or being shown any options for improving how this is handled.  Here are some thoughts I've had so far:

 - If a document is new, the last query won't have its `_id`
 - If a document is deleted, we won't know the shape of the set
 - When records are modified, we must preserve both natural as well as query ordering 

## Configuring
Configuration is simple and best done by passing a `PouchDB.Database` instance to your `PouchDb` elements.

```typescript
import PouchDB from "pouchdb";


const localTenantDb = new PouchDB("tenant-1");
const remoteTenantDb = new PouchDB("http://localhost:5984/tenant-1");
localTenantDb.sync(remoteTenantDb, {
    live: true,
});

const localUserDb = new PouchDB("user-1");
const remoteUserDb = new PouchDB("http://localhost:5984/user-1");
localUserDb.sync(remoteUserDb, {
    live: true,
});

export const databases = {
    "tenant": {
        connection: localTenantDb,
    },
    "user": {
        connection: localUserDb,
    },
};

//
// Later in your application...
//

<PouchDb databases={databases}>
```

As you can see, you're free to configure PouchDB as per the official docs, this library will try to stay out of the way! 😊

## Strong Typing for Databases
Because this library is built with TypeScript, you do have the option to add hints for your code to benefit from type checking on the list of available databases as well as their structure.

The following is an example of how you can provide this type information using TypeScript's powerful declaration merging:

```typescript
interface TenantDb
{
    tenantId: string;
}

interface UserDb
{
    userId: string;
    notifications: string[];
}

declare module "@protoculture/react-pouchdb"
{
    export interface DatabaseMeta
    {
        "tenant"?: PouchDbMeta<TenantDb>;
        "user"?: PouchDbMeta<UserDb>;
    }
}
```

A good way to manage this is to have a file called `Databases.ts` somewhere in your project, close to the entrypoint, or whichever component will be using the `PouchDb` React component from this library.

## Meta

`@protoculture/react-pouchdb` is created by Alexander Trauzzi and is available under the [Apache 2.0 license](https://www.apache.org/licenses/LICENSE-2.0.html).
