class EventEmitter {
    events: { [key: string]: Function[] } = {};

    on(eventName: string, listener: Function) {
        if (!this.events[eventName]) {
            this.events[eventName] = [];
        }
        this.events[eventName].push(listener);
    }

    off(eventName: string, listener: Function) {
        if (this.events[eventName]) {
            this.events[eventName] = this.events[eventName].filter(l => l !== listener);
        }
    }

    emit(eventName: string, data?: any) {
        if (this.events[eventName]) {
            this.events[eventName].forEach(listener => listener(data));
        }
    }
}


export const conversationsEmitter = new EventEmitter();
export const conversationSelectedEmitter = new EventEmitter();
