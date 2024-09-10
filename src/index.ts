/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Ayios. All rights reserved.
 *  All code created by Ayios within this repository is licensed under the MIT License. Other
 *  code not created by Ayios is under their respective license, which should have an
 *  indication of whatever copyright the file is subject to.
 *--------------------------------------------------------------------------------------------*/
class SignalConnection<T> {
    private readonly _symbol: Symbol;
    private readonly _signal: Signal<T>;
    constructor(signal: Signal<T>, symbol: Symbol) {
        this._symbol = symbol;
        this._signal = signal;
    }
    private get _listeners() {
        return Object.getOwnPropertyDescriptor(this._signal, '_listeners')!.value as Map<Symbol, Function>;
    }
    get isConnected() {
        return this._listeners.has(this._symbol);
    }
    disconnect() {
        this._listeners.delete(this._symbol);
    }
}

export default class Signal<T = void> {
    public readonly name?: string;
    private readonly _listeners = new Map<Symbol, ((data: T) => void)>();
    constructor(name?: string) {
        this.name = name;
    }
    async await() {
        return new Promise(resolve => {
            this.once(data => resolve(data));
        });
    }
    once(callback: (data: T) => void) {
        const symbol = Symbol(this.name);
        this._listeners.set(symbol, (_data: T) => {
            this._listeners.delete(symbol);
            callback(_data);
        });
    }
    connect(callback: (data: T) => void): SignalConnection<T> {
        const symbol = Symbol(this.name);
        this._listeners.set(symbol, callback);
        return new SignalConnection(this, symbol);
    }
    disconnectAll(exclusion: SignalConnection<T>) {
        const exclusionSymbol = Object.getOwnPropertyDescriptor(exclusion, '_symbol')!.value;
        this._listeners.forEach((_, symbol) => {
            if (symbol !== exclusionSymbol) this._listeners.delete(symbol);
        });
    }
    fire(data: T) {
        this._listeners.forEach(listener => listener(data));
    }
}