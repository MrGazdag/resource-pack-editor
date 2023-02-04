export default interface Constructor<T> {
    new(...args: any[]): T;
}