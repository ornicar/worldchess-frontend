export class SocialPopupAuth {

  constructor(private url: string,
              private name: string,
              private callback: () => void) {
  }

  // TODO: Implement communication between opener and popup using postMessage()
  open() {
    const authWindow = window.open(this.url, this.name, 'top=300,left=500,width=500,height=500');
    const interval = window.setInterval(() => {
      if (authWindow.closed) {
        window.clearInterval(interval);
        this.callback();
      }
    }, 1000);
  }
}
