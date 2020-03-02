import React from "react";
import PouchDB from "pouchdb";


interface ConfigurationWithInstance<Content>
{
    connection: PouchDB.Database<Content>;
}

interface ConfigurationWithoutInstance
{
    database: string;
    configuration?: PouchDB.Configuration.DatabaseConfiguration;
}

export type DatabaseConfigurationDictionary = { [name: string]: ConfigurationWithInstance<any> | ConfigurationWithoutInstance };

interface PouchDbProps
{
    databases: DatabaseConfigurationDictionary;
    children?: any;
}

export interface PouchDbMeta<Content>
{
    connection: PouchDB.Database<Content>;
    listener: PouchDB.Core.Changes<Content>;
    subscribers: { [id: string]: React.DispatchWithoutAction };
}

// note: Use declaration merging against this to add strongly typed databases.
export interface DatabaseMeta
{
    [name: string]: PouchDbMeta<any>;
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

            Object.keys(props.databases).map((name) =>
            {
                // todo: This is causing an error.
                const definition: any = props.databases[name];

                const connection: PouchDB.Database = (
                    definition.connection
                    || new PouchDB(definition.database, definition.configuration)
                );

                // todo: I don't like everything from here to the last line of this function.
                const meta: PouchDbMeta<any> = {
                    connection,
                    listener: null,
                    subscribers: {},
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

            setDatabases(newDatabases);
        }

        function cleanup(): void
        {
            Object.keys(currentDatabases).map((name) =>
            {
                currentDatabases[name]?.listener.cancel();
                currentDatabases[name]?.connection.close();
            });
        }
    }
}
