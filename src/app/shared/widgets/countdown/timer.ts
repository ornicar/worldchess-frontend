export class Timer {
  items: TimerItem[] = [];

  add(item: TimerItem) {
    const index = this.items.findIndex(it => it.key === item.key);

    if (index === -1) {
      this.items.push(item);
    } else {
      this.items[index].value = item.value;
      this.items[index].numbers = item.numbers;
    }
  }
}

interface TimerItem {
  key: string;
  value: number;
  numbers: string[];
}
