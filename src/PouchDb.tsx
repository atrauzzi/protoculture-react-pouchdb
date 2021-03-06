import React from "react";
import PouchDB from "pouchdb";


export interface ConfigurationWithInstance<Content>
{
    connection?: null | PouchDB.Database<Content>;
}

export interface ConfigurationWithoutInstance
{
    database?: null | string;
    configuration?: PouchDB.Configuration.DatabaseConfiguration;
}

export interface DatabaseConfigurationDictionary
{
    [name: string]: ( ConfigurationWithInstance<any> & ConfigurationWithoutInstance );
};

export interface DatabaseSyncConfigurationDictionary
{
    [from: string]: {
        to: string;
        options: PouchDB.Replication.SyncOptions;
    };
};

export interface PouchDbProps
{
    databases: DatabaseConfigurationDictionary;

    syncs: DatabaseSyncConfigurationDictionary;

    children?: any;
}

export interface PouchDbMeta<Content>
{
    connection: PouchDB.Database<Content>;
    listener: PouchDB.Core.Changes<Content>;
    subscribers: { [id: string]: React.DispatchWithoutAction };
    syncs: PouchDB.Replication.Sync<Content>[];
}

// note: Use declaration merging against this to add strongly typed databases.
export interface DatabaseMeta
{
    [name: string]: null | PouchDbMeta<any>;
};

export const pouchDbContext = React.createContext<DatabaseMeta>(null);
export const PouchDbProvider = pouchDbContext.Provider;
export const PouchDbConsumer = pouchDbContext.Consumer;

export function usePouchDb(): DatabaseMeta
{
    return React.useContext(pouchDbContext);
}

export function PouchDb(props: PouchDbProps): JSX.Element
{
    const [ currentDatabases, setDatabases ] = React.useState<DatabaseMeta>({});
    React.useEffect(initialize, [ props.databases ]);

    return <PouchDbProvider value={currentDatabases}>
        { props.children }
    </PouchDbProvider>;

    function initialize(): () => void
    {
        effect();

        return cleanup;

        async function effect(): Promise<void>
        {
            const newDatabases: DatabaseMeta = {};

            Object.keys(props.databases).forEach((name) =>
            {
                const definition = props.databases[name];

                if (! definition.database && ! definition.connection)
                {
                    newDatabases[name] = null;

                    return;
                }

                const connection: PouchDB.Database = (
                    definition.connection
                    || new PouchDB(definition.database, definition.configuration)
                );

                const meta: PouchDbMeta<any> = {
                    connection,
                    listener: null,
                    subscribers: {},
                    syncs: [],
                };

                meta.listener = connection
                    .changes({
                        live: true,
                        since: "now",
                    })
                    // note: This is the mechanism to trigger rerenders of descendants without rerendering the whole sub-tree.
                    //       We don't even care about `change` as we can't predict how queries will match without re-running them!
                    //
                    //       At least... That's what I think? 🤔
                    //
                    .on("change", (/* change */) =>
                    {
                        Object.keys(meta.subscribers).forEach((key) =>
                        {
                            meta.subscribers[key]();
                        });
                    });

                newDatabases[name] = meta;
            });

            Object.keys(props.syncs || {}).forEach((from) =>
            {
                const to = props.syncs[from].to;

                if (
                    ! newDatabases[from]?.connection
                    || ! newDatabases[to]?.connection
                )
                {
                    return;
                }

                const fromConnection = newDatabases[from].connection;
                const toConnection = newDatabases[to].connection;
                const options = props.syncs[from].options;

                const sync = fromConnection.sync(toConnection, {
                    retry: true,
                    ...options
                });

                currentDatabases[from]?.syncs.push(sync);
            });

            setDatabases(newDatabases);
        }

        function cleanup(): void
        {
            Object.keys(currentDatabases).map((name) =>
            {
                currentDatabases[name].syncs.forEach((sync) => sync.cancel());
                currentDatabases[name]?.listener.cancel();
                currentDatabases[name]?.connection.close();
            });
        }
    }
}
