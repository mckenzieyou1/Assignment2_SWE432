
export class Producer {
  constructor(name, station) {
    this.name = name;
    this.station = station;
  }
  intro() {
    console.log(`${this.name} from ${this.station} reporting in.`);
  }
}
Producer.prototype.role = 'producer'