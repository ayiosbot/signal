/*---------------------------------------------------------------------------------------------
 *  Copyright (c) 2025 Ayios. All rights reserved.
 *  All code within this repository created by Ayios is under MIT license. Other code within
 *  this repository is under its own respective license which will be displayed within their
 *  respective files or around the areas of their code.
 *  See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Collection } from '@ayios/collection';

export class SignalConnection<T> {
    public readonly id: Symbol;
    private readonly _signal: Signal<T>;
    constructor(signal: Signal<T>, symbol: Symbol) {
        this.id = symbol;
        this._signal = signal;
    }
    private get _listeners() {
        return Object.getOwnPropertyDescriptor(this._signal, '_listeners')!.value as Map<Symbol, Function>;
    }
    get isConnected() {
        return this._listeners.has(this.id);
    }
    disconnect() {
        this._listeners.delete(this.id);
    }
}

export default class Signal<T = void> {
    public readonly name?: string;
    private readonly _listeners = new Collection<Symbol, ((data: T) => void)>();
    constructor(name?: string) {
        this.name = name;
    }
    public async await() {
        return new Promise(resolve => {
            this.once(data => resolve(data));
        });
    }
    public once(callback: (data: T) => void) {
        const symbol = Symbol(this.name);
        this._listeners.set(symbol, (_data: T) => {
            this._listeners.delete(symbol);
            callback(_data);
        });
    }
    public connect(callback: (data: T) => void): SignalConnection<T> {
        const symbol = Symbol(this.name);
        this._listeners.set(symbol, callback);
        return new SignalConnection(this, symbol);
    }
    public disconnectAll(exclusion?: SignalConnection<T>) {
        this._listeners.forEach((_, symbol) => {
            if (symbol !== exclusion?.id) this._listeners.delete(symbol);
        });
    }
    public fire(data: T) {
        this._listeners.forEach(listener => listener(data));
    }
}