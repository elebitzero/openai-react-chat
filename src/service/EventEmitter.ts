
export class EventEmitter<T = any> {
  events: { [key: string]: ((data: T) => void)[] } = {};

  on(eventName: string, listener: (data: T) => void) {
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }
    this.events[eventName].push(listener);
  }

  off(eventName: string, listener: (data: T) => void) {
    if (this.events[eventName]) {
      this.events[eventName] = this.events[eventName].filter(l => l !== listener);
    }
  }

  emit(eventName: string, data: T) { // Removed the optional modifier from `data`
    if (this.events[eventName]) {
      this.events[eventName].forEach(listener => listener(data));
    }
  }
}
