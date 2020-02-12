import React from "react";
import { usePouchDb, DatabaseMeta } from "./PouchDb";
import uuid from "uuid";


type GetContent<DatabaseType> = DatabaseType extends PouchDB.Database<infer C> ? C : never;
type DatabaseNames = keyof DatabaseMeta;
type ConnectionContent<DatabaseName extends DatabaseNames> = GetContent<DatabaseMeta[DatabaseName]["connection"]>;

export function usePouchDbFind<DatabaseName extends DatabaseNames>(databaseName: DatabaseName, findRequest: PouchDB.Find.FindRequest<ConnectionContent<DatabaseName>>): null | PouchDB.Find.FindResponse<ConnectionContent<DatabaseName>>
{
    const dbs = usePouchDb();
    const [ currentResults, setResults ] = React.useState<PouchDB.Find.FindResponse<any>>(null);
    // note: This is how we let the PouchDb component update us without causing a redraw of all its children.
    const [ seq, forceUpdate ] = React.useReducer((x) => x + 1, 0);
    const db = dbs[databaseName];

    React.useEffect(initialize, [ db ]);

    React.useEffect(executeQuery, [
        dbs,
        // note: This seems like the best (only?) way to support changing queries...?
        JSON.stringify(findRequest),
        seq,
    ]);

    return currentResults;

    function initialize(): () => void
    {
        if (!db)
        {
            return;
        }

        const id = uuid.v4();

        effect();

        return cleanup;

        async function effect(): Promise<void>
        {
            db.subscribers[id] = forceUpdate;
        }

        function cleanup(): void
        {
            delete db.subscribers[id];
        }
    }

    function executeQuery(): () => void
    {
        let cancelled = false;

        effect();

        return cleanup;

        async function effect(): Promise<void>
        {
            const newResults = await db?.connection.find(findRequest) || null;

            cancelled || setResults(newResults);
        }

        function cleanup(): void
        {
            cancelled = true;
        }
    }
}
