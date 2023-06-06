export class Event {
  timestamp: number = Date.now();
  target: null | EventTarget = null;
  currentTarget: null | EventTarget = null;
  propagation: boolean = true;
  constructor(public type: string) {}
  stopPropagation() {
    this.propagation = false;
  }
}

export class MouseEvent extends Event {
  public target: EventTarget | null = null;
  constructor(
    public type: "click" | "mousedown" | "mouseup",
    public button: number,
    public x: number,
    public y: number
  ) {
    super(type);
  }
}

export type EventHandler = (e: Event) => void;

export class EventTarget {
  private listeners: { [K in string]?: EventHandler[] } = {};
  constructor() {}

  addEventListener(type: string, cb: EventHandler) {
    (this.listeners[type] ??= []).push(cb);
  }

  removeEventListener(type: string, cb: any) {
    const list = this.listeners[type];
    if (list) {
      this.listeners[type] = list.filter((h) => h !== cb);
    }
  }

  dispatchEvent(e: Event) {
    e.target = this;
    const list = this.listeners[e.type];
    if (list) {
      list.forEach((h) => h(e));
    }
  }
}
