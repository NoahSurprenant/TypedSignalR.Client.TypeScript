import { HubConnectionBuilder } from '@microsoft/signalr'
import { getHubProxyFactory } from '../generated/msgpack/TypedSignalR.Client'
import { UserDefinedType } from '../generated/msgpack/TypedSignalR.Client.TypeScript.Tests.Shared';
import crypto from 'crypto'
import { MessagePackHubProtocol } from '@microsoft/signalr-protocol-msgpack';

const getRandomInt = (max: number) => {
    return Math.floor(Math.random() * max);
}

const toUTCString = (date: string | Date): string => {
    if (typeof date === 'string') {
        const d = new Date(date);
        return d.toUTCString();
    }

    return date.toUTCString();
}

const testMethod = async () => {
    const connection = new HubConnectionBuilder()
        .withUrl("http://localhost:5000/hubs/InheritHub")
        .withHubProtocol(new MessagePackHubProtocol())
        .build();

    const hubProxy = getHubProxyFactory("IInheritHub")
        .createHubProxy(connection);

    try {
        await connection.start();

        const r1 = await hubProxy.get();
        expect(r1).toEqual("TypedSignalR.Client.TypeScript");

        const x = getRandomInt(1000);
        const y = getRandomInt(1000);

        const r2 = await hubProxy.add(x, y);
        expect(r2).toEqual(x + y);

        const s1 = "revue";
        const s2 = "starlight";

        const r3 = await hubProxy.cat(s1, s2);;

        expect(r3).toEqual(s1 + s2);

        const instance: UserDefinedType = {
            DateTime: new Date(),
            Guid: crypto.randomUUID()
        }

        const r4 = await hubProxy.echo(instance);

        expect(r4).toEqual(instance)
    }
    finally {
        await connection.stop();
    }
}

test('unary.test', testMethod);
